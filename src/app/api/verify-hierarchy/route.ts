import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Item from '@/model/Item';
import { z } from 'zod';

const verifySchema = z.object({
    parentSerial: z.string(),
    childSerial: z.string()
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const result = verifySchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ error: result.error.format() }, { status: 400 });
        }

        const { parentSerial, childSerial } = result.data;
        await dbConnect();

        // Fetch both
        const [parent, child] = await Promise.all([
            Item.findOne({ serial: parentSerial }),
            Item.findOne({ serial: childSerial })
        ]);

        if (!parent || !child) {
            return NextResponse.json({ error: 'One or both items not found' }, { status: 404 });
        }

        // Check Relationship
        // Child path should contain Parent ID.
        const isRelated = child.path?.includes(parent._id.toString());

        if (isRelated) {
            return NextResponse.json({
                verified: true,
                message: `CONFIRMED: ${child.type} ${childSerial} belongs to ${parent.type} ${parentSerial}`
            });
        } else {
            return NextResponse.json({
                verified: false,
                message: `MISMATCH: ${child.type} ${childSerial} is NOT in ${parent.type} ${parentSerial}`
            });
        }

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
