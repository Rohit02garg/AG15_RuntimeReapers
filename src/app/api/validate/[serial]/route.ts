import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { Pallet, Carton, Unit } from '@/model/Item';
import { validateLuhn } from '@/helpers/luhn';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ serial: string }> }
) {
    try {
        const { serial } = await params;

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

        // 2. DB Existence Check (search across all collections)
        const item = await Pallet.findOne({ serial }).lean() ||
                     await Carton.findOne({ serial }).lean() ||
                     await Unit.findOne({ serial }).lean();

        if (!item) {
            return NextResponse.json({
                valid: false,
                message: 'Serial number not found in database',
                luhnValid: true // It passed math, but not known
            }, { status: 200 });
        }

        // Determine type from which collection matched
        const type = await Pallet.findOne({ serial }).lean() ? 'PALLET' :
                     await Carton.findOne({ serial }).lean() ? 'CARTON' : 'UNIT';

        return NextResponse.json({
            valid: true,
            type,
            status: (item as any).status,
            message: 'Valid Serial'
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
