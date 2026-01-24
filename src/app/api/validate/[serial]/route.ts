import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Item from '@/model/Item';
import { validateLuhn } from '@/helpers/luhn';

export async function GET(
    req: NextRequest,
    { params }: { params: { serial: string } }
) {
    try {
        const { serial } = params;

        // 1. Math Validation (Luhn)
        // For Custom Serial: it ends with check digit.
        // For SSCC: it ends with check digit.
        // So validateLuhn(serial) should be true.
        const isValidLuhn = validateLuhn(serial);

        if (!isValidLuhn) {
            return NextResponse.json({
                valid: false,
                message: 'Invalid Check Digit (Luhn Failed)'
            }, { status: 200 });
        }

        await dbConnect();

        // 2. DB Existence Check
        const item = await Item.findOne({ serial });

        if (!item) {
            return NextResponse.json({
                valid: false,
                message: 'Serial number not found in database',
                luhnValid: true // It passed math, but not known
            }, { status: 200 });
        }

        return NextResponse.json({
            valid: true,
            type: item.type,
            status: item.status,
            message: 'Valid Serial'
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
