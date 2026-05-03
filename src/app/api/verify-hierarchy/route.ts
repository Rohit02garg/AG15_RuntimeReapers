import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { Pallet, Carton, Unit } from '@/model/Item';
import { z } from 'zod';

const verifySchema = z.object({
    parentSerial: z.string(),
    childSerial: z.string()
});

// Helper to find an item across all collections
async function findItemBySerial(serial: string) {
    const pallet = await Pallet.findOne({ serial });
    if (pallet) return { item: pallet, type: 'PALLET' };

    const carton = await Carton.findOne({ serial });
    if (carton) return { item: carton, type: 'CARTON' };

    const unit = await Unit.findOne({ serial });
    if (unit) return { item: unit, type: 'UNIT' };

    return null;
}

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
        const [parentResult, childResult] = await Promise.all([
            findItemBySerial(parentSerial),
            findItemBySerial(childSerial)
        ]);

        if (!parentResult || !childResult) {
            return NextResponse.json({ error: 'One or both items not found' }, { status: 404 });
        }

        const parent = parentResult.item;
        const child = childResult.item;

        // Check Relationship via parentId reference
        const isRelated = child.parentId?.toString() === parent._id.toString();

        if (isRelated) {
            return NextResponse.json({
                verified: true,
                message: `CONFIRMED: ${childResult.type} ${childSerial} belongs to ${parentResult.type} ${parentSerial}`
            });
        } else {
            return NextResponse.json({
                verified: false,
                message: `MISMATCH: ${childResult.type} ${childSerial} is NOT in ${parentResult.type} ${parentSerial}`
            });
        }

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
