import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Item from '@/model/Item';
import ScanLog from '@/model/ScanLog';
import { scanSchema } from '@/schemas/scanSchema';

// Haversine formula to calculate distance in km
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // 1. Validate Input
        const result = scanSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json({ error: result.error.format() }, { status: 400 });
        }

        const { serial, location, lat, long, stage, hashFragment } = result.data;

        await dbConnect();

        // 2. Fetch Item
        const item = await Item.findOne({ serial });
        if (!item) {
            // Log invalid scan attempt?
            return NextResponse.json({ status: 'INVALID', message: 'Item not found in database' }, { status: 404 });
        }

        // 3. Security Checks (3-Layer Logic)
        let status: 'VALID' | 'SUSPECT' | 'INVALID' = 'VALID';
        let anomalyReason = '';

        // A. Hash Check (Smart QR)
        if (hashFragment) {
            // Check if provided hash matches stored hash (first 8 chars)
            if (item.hash !== hashFragment) {
                status = 'INVALID';
                anomalyReason = 'Hash mismatch (Counterfeit Label)';
            }
        }

        if (status !== 'INVALID') {
            // B. Fetch Previous History for Anomaly Detection
            const lastScan = await ScanLog.findOne({ serial }).sort({ timestamp: -1 });

            if (lastScan) {
                // Layer 1: Impossible Travel (Speed Check)
                if (lat && long && lastScan.notes?.includes('Lat:')) {
                    // Extract last lat/long from notes or add specific fields to ScanLog?
                    // For hackathon, let's assume we store "Lat:X,Long:Y" in notes or add schema fields.
                    // Let's rely on time if coordinates missing. 
                    // Wait, logic needs comparison. Let's start simple.
                    // If last scan was < 5 mins ago in DIFFERENT location string -> Suspect

                    const timeDiffMs = Date.now() - new Date(lastScan.timestamp).getTime();
                    const timeDiffHours = timeDiffMs / (1000 * 60 * 60);

                    // Demo logic: If location changed but time is very short (< 1 min)
                    if (lastScan.location !== location && timeDiffMs < 60000) {
                        status = 'SUSPECT';
                        anomalyReason = `Impossible Travel: Moved from ${lastScan.location} to ${location} in ${(timeDiffMs / 1000).toFixed(1)}s`;
                    }
                }

                // Layer 2: Sequence Check
                // Simple logic: Can't go back to MANUFACTURER if already RETAILER
                if (stage && lastScan.stage) {
                    const stages = ['MANUFACTURER', 'DISTRIBUTOR', 'RETAILER', 'CONSUMER'];
                    const lastIdx = stages.indexOf(lastScan.stage);
                    const currentIdx = stages.indexOf(stage);

                    if (currentIdx < lastIdx) {
                        status = 'SUSPECT';
                        anomalyReason = `Supply Chain Inverse: Moved from ${lastScan.stage} back to ${stage}`;
                    }
                }

                // Layer 3: State Check
                if (item.status === 'SOLD' && stage !== 'CONSUMER') {
                    status = 'SUSPECT';
                    anomalyReason = 'Sold item re-entering supply chain (Diverted)';
                }
            }
        }

        // 4. Log Scan
        await ScanLog.create({
            serial,
            location,
            ip: req.headers.get('x-forwarded-for') || '127.0.0.1',
            stage,
            status,
            notes: anomalyReason || (lat ? `Lat:${lat},Long:${long}` : undefined)
        });

        // 5. Update Item Status if Valid
        if (status === 'VALID' && stage === 'CONSUMER') {
            await Item.updateOne({ serial }, { status: 'SOLD' });
        } else if (status === 'VALID' && stage === 'DISTRIBUTOR') {
            await Item.updateOne({ serial }, { status: 'SHIPPED' });
        }

        return NextResponse.json({
            success: true,
            status,
            message: anomalyReason || 'Item Verified Successfully',
            item: {
                serial: item.serial,
                type: item.type,
                desc: "Pharma Product", // Placeholder
                timestamp: item.createdAt
            }
        });

    } catch (error: any) {
        console.error('Scan Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
