import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Pallet, Carton, Unit } from "@/model/Item";
import ScanLog from "@/model/ScanLog";
import { getShortHash } from "@/helpers/crypto";

export async function POST(req: Request) {
    await dbConnect();

    try {
        const { serial, code, location } = await req.json(); // code is the 8-char hash fragment

        if (!serial || !code) {
            return NextResponse.json({ status: 'INVALID', message: 'Missing Serial or Code' });
        }

        // Search across collections
        let item = await Pallet.findOne({ serial });
        let type = 'PALLET';

        if (!item) {
            item = await Carton.findOne({ serial });
            type = 'CARTON';
        }

        if (!item) {
            item = await Unit.findOne({ serial });
            type = 'UNIT';
        }

        // 1. EXISTENCE CHECK
        if (!item) {
            await ScanLog.create({
                serial, location, status: 'INVALID', stage: 'CONSUMER', notes: 'Serial not found'
            });
            return NextResponse.json({ status: 'INVALID', message: 'Product not found in database.' });
        }

        // 2. CRYPTO CHECK
        const validShortHash = getShortHash(item.hash);
        if (validShortHash !== code) {
            await ScanLog.create({
                serial, location, status: 'INVALID', stage: 'CONSUMER', notes: 'Hash mismatch'
            });
            return NextResponse.json({ status: 'INVALID', message: 'Verification Code incorrect. Possible Counterfeit.' });
        }

        // 3. VELOCITY / ANOMALY CHECK (Simple)
        const lastScan = await ScanLog.findOne({ serial, status: 'VALID' }).sort({ timestamp: -1 });
        let status = 'VALID';
        let notes = 'Verified Successfully';

        if (lastScan) {
            const timeDiff = Date.now() - new Date(lastScan.timestamp).getTime();
            const minutesDiff = timeDiff / (1000 * 60);

            if (minutesDiff < 10 && lastScan.location !== location) {
                status = 'SUSPECT';
                notes = `Impossible Travel: Scanned at ${lastScan.location} ${Math.floor(minutesDiff)} mins ago.`;
            }
        }

        // 4. LOG SCAN
        await ScanLog.create({
            serial, location, status, stage: 'CONSUMER', notes
        });

        // --- HIERARCHICAL HISTORY LOGIC ---
        let finalHistory: any[] = [];

        if (type === 'PALLET') {
            finalHistory = item.history || [];
        }
        else if (type === 'CARTON') {
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
            if (item.parentId) {
                const parentCarton = await Carton.findById(item.parentId).lean();
                if (parentCarton) {
                    if (parentCarton.history) {
                        finalHistory = [...parentCarton.history];
                    }
                    if (parentCarton.parentId) {
                        const grandParentPallet = await Pallet.findById(parentCarton.parentId).lean();
                        if (grandParentPallet && grandParentPallet.history) {
                            finalHistory = [...grandParentPallet.history, ...finalHistory];
                        }
                    }
                }
            }
        }

        // Deduplicate History based on Status + Location + Timestamp
        const uniqueEvents = new Map();
        finalHistory.forEach(event => {
            const key = `${event.status}-${event.location}-${new Date(event.timestamp).getTime()}`;
            if (!uniqueEvents.has(key)) {
                uniqueEvents.set(key, event);
            }
        });
        finalHistory = Array.from(uniqueEvents.values());

        finalHistory.sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

        // 5. RETURN RESULT
        return NextResponse.json({
            status,
            message: notes,
            item: {
                serial: item.serial,
                type: type, // Return the explicit type
                status: item.status,
                history: finalHistory
            }
        });

    } catch (error: any) {
        return NextResponse.json({ status: 'ERROR', message: error.message }, { status: 500 });
    }
}
