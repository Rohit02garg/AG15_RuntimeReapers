import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { findItemBySerial, getAggregatedHistory } from "@/lib/itemHelper";

export async function GET(req: Request, { params }: { params: Promise<{ serial: string }> }) {
    await dbConnect();
    const { serial } = await params;

    try {
        // Use centralized helper for cross-collection search
        const result = await findItemBySerial(serial);

        if (!result) {
            return NextResponse.json({ success: false, message: "Item not found" }, { status: 404 });
        }

        const { item, type } = result;

        // Aggregate hierarchical history using centralized helper
        const finalHistory = await getAggregatedHistory(item, type);

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
