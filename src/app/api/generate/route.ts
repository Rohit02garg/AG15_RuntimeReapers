import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/dbConnect';
import { Pallet, Carton, Unit } from '@/model/Item';
import { generateSchema } from '@/schemas/generateSchema';
import { generateSSCC, generateCustomSerial } from '@/helpers/generator';
import { generateHash, getShortHash } from '@/helpers/crypto';
import mongoose from 'mongoose';

export async function POST(req: NextRequest) {
    try {
        // Authentication Guard — only MANUFACTURER role can generate batches
        const session = await getServerSession(authOptions);
        if (!session || session.user?.role !== 'MANUFACTURER') {
            return NextResponse.json(
                { error: 'Unauthorized. Manufacturer access required.' },
                { status: 401 }
            );
        }

        const body = await req.json();

        // 1. Validate Input
        const result = generateSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json({ error: result.error.format() }, { status: 400 });
        }

        const { type, count, parentId } = result.data;
        await dbConnect();

        // 2. Select Model
        let Model: any;
        switch (type) {
            case 'PALLET': Model = Pallet; break;
            case 'CASE': Model = Carton; break; // Frontend sends CASE, Model is Carton
            case 'UNIT': Model = Unit; break;
            default: return NextResponse.json({ error: 'Invalid Type' }, { status: 400 });
        }

        // 3. Resolve Hierarchy (if parentId provided)
        let parentObjectId: mongoose.Types.ObjectId | undefined;
        // Note: Schemas don't stickly enforce `path` field, but we can compute it if needed. 
        // For now, just linking parentId is sufficient for the defined Schemas (Unit/Carton have parentId).

        if (parentId) {
            // Find parent across collections (since specific parent type isn't passed explicitly)
            // But realistically: Unit -> Carton, Carton -> Pallet.
            // If creating UNIT, parent is CARTON. If creating CASE, parent is PALLET.

            let parentDoc: any = null;
            if (mongoose.Types.ObjectId.isValid(parentId)) {
                parentDoc = await Pallet.findById(parentId).lean() ||
                    await Carton.findById(parentId).lean();
            } else {
                parentDoc = await Pallet.findOne({ serial: parentId }).lean() ||
                    await Carton.findOne({ serial: parentId }).lean();
            }

            if (!parentDoc) {
                return NextResponse.json({ error: 'Parent Item not found' }, { status: 404 });
            }
            parentObjectId = parentDoc._id;
        }

        // 4. In-Memory Generation Loop
        const batch: any[] = [];
        const startTimeResult = Date.now();
        const baseCounter = Math.floor(Math.random() * 100000);

        for (let i = 0; i < count; i++) {
            // A. Generate ID
            let serial = '';
            const uniqueCounter = baseCounter + i;

            if (type === 'PALLET') {
                serial = generateSSCC(uniqueCounter);
            } else {
                serial = generateCustomSerial(uniqueCounter);
            }

            // B. Security Hash
            const timestamp = new Date();
            const fullHash = generateHash(serial, timestamp.toISOString(), type);
            const shortHash = getShortHash(fullHash);

            // C. Construct Object
            batch.push({
                serial,
                name: "", // Explicitly setting it so it shows up in MongoDB viewer
                // hash: fullHash (long), shortHash: shortHash (short)
                hash: fullHash,
                shortHash: shortHash,
                parentId: parentObjectId, // Schemas ignore this if not defined (e.g. Pallet)
                status: 'CREATED',
                history: [{
                    status: 'CREATED',
                    location: 'MANUFACTURER_FACILITY', // Default
                    timestamp: timestamp,
                    scannedBy: 'SYSTEM',
                    notes: 'Batch Generated'
                }]
            });
        }

        // 5. Bulk Write
        const dbResult = await Model.insertMany(batch, { ordered: false });

        const duration = Date.now() - startTimeResult;

        return NextResponse.json({
            success: true,
            message: `Generated ${dbResult.length} items in ${duration}ms`,
            duration,
            sample: batch.slice(0, 3)
        });

    } catch (error: any) {
        console.error('Generation Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}