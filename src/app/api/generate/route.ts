import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Item, { IItem } from '@/model/Item';
import { generateSchema } from '@/schemas/generateSchema';
import { generateSSCC, generateCustomSerial } from '@/helpers/generator';
import { generateHash, getShortHash } from '@/helpers/crypto';
import mongoose from 'mongoose';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // 1. Validate Input
        const result = generateSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json({ error: result.error.format() }, { status: 400 });
        }

        const { type, count, parentId } = result.data;

        await dbConnect();

        // 2. Resolve Hierarchy (if parentId provided)
        let parentPath = ','; // Default root path (or empty)
        let parentObjectId: mongoose.Types.ObjectId | undefined;

        if (parentId) {
            const parent = await Item.findOne({ serial: parentId }); // Identify parent by Serial? Or ObjectId? User sends Serial likely.
            // Let's assume input is Serial for usability, but we link via ObjectId.
            // Or if parentId is indeed ObjectId string. 
            // The schema says string. Let's try to find by ID first, then serial.

            let parentDoc = null;
            if (mongoose.Types.ObjectId.isValid(parentId)) {
                parentDoc = await Item.findById(parentId);
            } else {
                parentDoc = await Item.findOne({ serial: parentId });
            }

            if (!parentDoc) {
                return NextResponse.json({ error: 'Parent Item not found' }, { status: 404 });
            }

            parentObjectId = parentDoc._id;
            // Inherit path: Parent's path + Parent's ID
            // If parent path is ",", then new path is ",PARENT_ID,"
            parentPath = `${parentDoc.path || ','}${parentDoc._id},`;
        }

        // 3. In-Memory Generation Loop (Performance: Avoid DB calls inside loop)
        const batch: Partial<IItem>[] = [];
        const startTimeResult = Date.now();

        // Get a base counter (in real app, this should be atomic from DB)
        // For Hackathon, use Date.now() + index to ensure uniqueness within this batch
        // To strictly follow GS1 counter, we might need a counter DB. 
        // Let's assume strict uniqueness is handled by (Timestamp + LoopIndex) for now.
        const baseCounter = Math.floor(Math.random() * 100000);

        for (let i = 0; i < count; i++) {
            // A. Generate ID
            let serial = '';
            let sscc = undefined;
            const uniqueCounter = baseCounter + i;

            if (type === 'PALLET') {
                sscc = generateSSCC(uniqueCounter);
                serial = sscc;
            } else {
                serial = generateCustomSerial(uniqueCounter);
            }

            // B. Security Hash (SHA256)
            // SHA256(Serial + Timestamp + Type + Salt)
            const timestamp = new Date(); // Use Date object for mongoose
            const fullHash = generateHash(serial, timestamp.toISOString(), type);
            const shortHash = getShortHash(fullHash);

            // C. Construct Object
            batch.push({
                serial,
                sscc,
                type,
                parentId: parentObjectId,
                path: parentPath,
                hash: shortHash,
                fullHash: fullHash,
                status: 'CREATED',
                createdAt: timestamp
            });
        }

        // 4. Bulk Write (Performance: Single DB Roundtrip)
        const options = { ordered: false }; // Continue even if one fails (unlikely due to uniqueness logic)
        // Actually, ordered: false is faster.

        const dbResult = await Item.insertMany(batch, options);

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
