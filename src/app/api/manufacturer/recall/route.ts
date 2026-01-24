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

        // 1. Identify Item and Type
        let item: any = await Pallet.findOne({ serial });
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

        const recallEvent = {
            status: 'RECALLED',
            location: user.location?.city || 'Headquarters',
            timestamp: new Date(),
            scannedBy: user.username,
            notes: reason || 'Batch Decommissioned by Manufacturer'
        };

        // 2. Recursive Logic
        let affectedCount = 1;

        // Helper to update status and history
        const markRecalled = async (doc: any) => {
            doc.status = 'RECALLED';
            doc.history.push(recallEvent);
            await doc.save();
        };

        await markRecalled(item);

        if (type === 'PALLET') {
            // Find Child Cartons
            const cartons = await Carton.find({ parentId: item._id });
            for (const carton of cartons) {
                await markRecalled(carton);
                affectedCount++;

                // Find Child Units of Carton
                const units = await Unit.find({ parentId: carton._id });
                for (const unit of units) {
                    await markRecalled(unit);
                    affectedCount++;
                }
            }
        } else if (type === 'CARTON') {
            // Find Child Units
            const units = await Unit.find({ parentId: item._id });
            for (const unit of units) {
                await markRecalled(unit);
                affectedCount++;
            }
        }

        return NextResponse.json({
            success: true,
            message: `${type} ${serial} and ${affectedCount - 1} dependent items have been RECALLED.`
        });

    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
