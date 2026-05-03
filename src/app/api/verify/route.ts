import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { findItemBySerial, getAggregatedHistory } from "@/lib/itemHelper";
import ScanLog from "@/model/ScanLog";
import { getShortHash } from "@/helpers/crypto";

export async function POST(req: Request) {
    await dbConnect();

    try {
        const { serial, code, location } = await req.json(); // code is the 8-char hash fragment

        if (!serial || !code) {
            return NextResponse.json({ status: 'INVALID', message: 'Missing Serial or Code' });
        }

        // Search across all collections using centralized helper
        const result = await findItemBySerial(serial);

        // 1. EXISTENCE CHECK
        if (!result) {
            await ScanLog.create({
                serial, location, status: 'INVALID', stage: 'CONSUMER', notes: 'Serial not found'
            });
            return NextResponse.json({ status: 'INVALID', message: 'Product not found in database.' });
        }

        const { item, type } = result;

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

        // 5. AGGREGATE HIERARCHICAL HISTORY using centralized helper
        const finalHistory = await getAggregatedHistory(item, type);

        // 6. RETURN RESULT
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
