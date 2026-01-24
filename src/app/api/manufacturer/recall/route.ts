import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Pallet, Carton, Unit } from "@/model/Item";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function POST(req: Request) {
    await dbConnect();

    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (!session || user.role !== 'MANUFACTURER') {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    try {
        const { serial, reason } = await req.json();

        if (!serial) {
            return NextResponse.json({ success: false, message: "Serial number is required" }, { status: 400 });
        }

        // Search across collections
        let item = await Pallet.findOne({ serial });
        let type = 'PALLET';
        let Model: any = Pallet;

        if (!item) {
            item = await Carton.findOne({ serial });
            type = 'CARTON';
            Model = Carton;
        }

        if (!item) {
            item = await Unit.findOne({ serial });
            type = 'UNIT';
            Model = Unit;
        }

        if (!item) {
            return NextResponse.json({ success: false, message: "Item not found" }, { status: 404 });
        }

        // Update Status
        item.status = 'RECALLED';
        item.history.push({
            status: 'RECALLED',
            location: user.location?.city || 'Headquarters',
            timestamp: new Date(),
            scannedBy: user.username,
            notes: reason || 'Batch Decommissioned by Manufacturer'
        });

        await item.save();

        return NextResponse.json({
            success: true,
            message: `${type} ${serial} has been RECALLED successfully.`
        });

    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
