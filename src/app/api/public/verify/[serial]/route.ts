import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Unit, Carton, Pallet } from "@/model/Item";

export async function GET(req: Request, { params }: { params: Promise<{ serial: string }> }) {
    await dbConnect();
    const { serial } = await params;

    try {
        // Parallel search across all collections
        const results = await Promise.all([
            Unit.findOne({ serial }).lean(),
            Carton.findOne({ serial }).lean(),
            Pallet.findOne({ serial }).lean()
        ]);

        // Find the first non-null result
        // Order priority: Unit -> Carton -> Pallet
        let item: any = results[0] || results[1] || results[2];
        let type = results[0] ? 'UNIT' : results[1] ? 'CARTON' : results[2] ? 'PALLET' : null;

        if (!item) {
            return NextResponse.json({ success: false, message: "Item not found" }, { status: 404 });
        }

        // --- HIERARCHICAL HISTORY LOGIC ---
        let finalHistory: any[] = [];

        if (type === 'PALLET') {
            // Logic: Keep same
            finalHistory = item.history || [];
        }
        else if (type === 'CARTON') {
            // Logic: Pallet History + Carton History
            finalHistory = [...(item.history || [])];

            if (item.parentId) {
                const parentPallet = await Pallet.findById(item.parentId).lean();
                if (parentPallet && parentPallet.history) {
                    finalHistory = [...parentPallet.history, ...finalHistory];
                }
            }
        }
        else if (type === 'UNIT') {
            // Logic: Grandparent Pallet + Parent Carton (Ignore Unit Journey)
            // 1. Get Parent Carton
            if (item.parentId) {
                const parentCarton = await Carton.findById(item.parentId).lean();
                if (parentCarton) {
                    // Add Carton History
                    if (parentCarton.history) {
                        finalHistory = [...parentCarton.history];
                    }

                    // 2. Get Grandparent Pallet (from Carton's parent)
                    if (parentCarton.parentId) {
                        const grandParentPallet = await Pallet.findById(parentCarton.parentId).lean();
                        if (grandParentPallet && grandParentPallet.history) {
                            // Prepend Pallet History
                            finalHistory = [...grandParentPallet.history, ...finalHistory];
                        }
                    }
                }
            }
            // NOTE: We explicitely DO NOT add item.history for Unit, as requested.
        }

        // Deduplicate History based on Status + Location + Timestamp
        // (Batch generation often creates identical 'Created' events for hierarchy)
        // SPECIAL HANDLING: For 'RECALLED', we only want ONE event to show up, 
        // even if Pallet + Carton + Unit all have it.
        const uniqueEvents = new Map();
        finalHistory.forEach(event => {
            // Standard Key
            let key = `${event.status}-${event.location}-${new Date(event.timestamp).getTime()}`;

            // If RECALLED (robust check), force a single key so we only keep one
            if (event.status && event.status.trim().toUpperCase() === 'RECALLED') {
                key = `RECALLED-EVENT`;
            }

            if (!uniqueEvents.has(key)) {
                uniqueEvents.set(key, event);
            }
        });
        finalHistory = Array.from(uniqueEvents.values());

        // Sort combined history by timestamp
        finalHistory.sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

        // Determine Overall Trust Status based on COMPOUND history
        // If ANY history event in the chain is 'SUSPECT', the thread is tainted.
        const isSuspect = finalHistory.some((h: any) => h.status === 'SUSPECT') || item.status === 'SUSPECT';

        return NextResponse.json({
            success: true,
            item: {
                serial: item.serial,
                type: type,
                status: item.status,
                integrity: isSuspect ? 'SUSPECT' : 'VALID',
                history: finalHistory,
                hash: item.hash,
                createdAt: item.createdAt
            }
        });

    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
