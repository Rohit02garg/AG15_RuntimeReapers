import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Pallet, Carton, Unit } from "@/model/Item";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    await dbConnect();

    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (!session || user.role !== 'MANUFACTURER') {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const parentId = searchParams.get('parentId');
        const type = searchParams.get('type') || 'PALLET'; // Default to Pallet view
        const search = searchParams.get('search') || '';

        let items: any[] = [];
        
        // Build base query
        const query: any = {};
        
        if (search) {
            // Global search within the specified type, ignoring parentId
            query.$or = [
                { serial: { $regex: search, $options: 'i' } },
                { name: { $regex: search, $options: 'i' } }
            ];
        } else if (parentId && type !== 'PALLET') {
            // Standard drill-down
            query.parentId = parentId;
        } else if (type !== 'PALLET') {
            // Missing parentId and no search for Carton/Unit -> Error
            return NextResponse.json({ success: false, message: "Missing Parent ID" }, { status: 400 });
        }

        if (type === 'PALLET') {
            items = await Pallet.find(query).sort({ createdAt: -1 }).limit(50);
        } else if (type === 'CARTON') {
            items = await Carton.find(query).sort({ createdAt: -1 }).limit(50);
        } else if (type === 'UNIT') {
            items = await Unit.find(query).sort({ createdAt: -1 }).limit(50);
        }

        return NextResponse.json({ success: true, items, view: type });

    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    await dbConnect();

    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (!session || user.role !== 'MANUFACTURER') {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        const type = searchParams.get('type') || 'PALLET';

        if (!id) {
            return NextResponse.json({ success: false, message: "Missing item ID" }, { status: 400 });
        }

        let deleted = { pallets: 0, cartons: 0, units: 0 };

        if (type === 'PALLET') {
            // Cascade: Delete Pallet → its Cartons → their Units
            const cartons = await Carton.find({ parentId: id });
            const cartonIds = cartons.map((c: any) => c._id);

            if (cartonIds.length > 0) {
                const unitResult = await Unit.deleteMany({ parentId: { $in: cartonIds } });
                deleted.units = unitResult.deletedCount;
            }

            const cartonResult = await Carton.deleteMany({ parentId: id });
            deleted.cartons = cartonResult.deletedCount;

            await Pallet.findByIdAndDelete(id);
            deleted.pallets = 1;

        } else if (type === 'CARTON') {
            // Cascade: Delete Carton → its Units
            const unitResult = await Unit.deleteMany({ parentId: id });
            deleted.units = unitResult.deletedCount;

            await Carton.findByIdAndDelete(id);
            deleted.cartons = 1;

        } else if (type === 'UNIT') {
            await Unit.findByIdAndDelete(id);
            deleted.units = 1;
        }

        return NextResponse.json({
            success: true,
            message: `Deleted: ${deleted.pallets} pallets, ${deleted.cartons} cartons, ${deleted.units} units`,
            deleted
        });

    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    await dbConnect();

    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (!session || user.role !== 'MANUFACTURER') {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { id, type, name } = body;

        if (!id || !type) {
            return NextResponse.json({ success: false, message: "Missing item ID or type" }, { status: 400 });
        }

        let updatedItem;
        if (type === 'PALLET') {
            updatedItem = await Pallet.findByIdAndUpdate(id, { name }, { new: true });
        } else if (type === 'CARTON') {
            updatedItem = await Carton.findByIdAndUpdate(id, { name }, { new: true });
        } else if (type === 'UNIT') {
            updatedItem = await Unit.findByIdAndUpdate(id, { name }, { new: true });
        }

        if (!updatedItem) {
            return NextResponse.json({ success: false, message: "Item not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, item: updatedItem });

    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
