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

        let items: any[] = [];

        if (type === 'PALLET') {
            // Top Level: Show Pallets
            items = await Pallet.find({}).sort({ createdAt: -1 }).limit(50);
        } else if (type === 'CARTON') {
            // Second Level: Show Cartons for a specific Pallet
            if (!parentId) return NextResponse.json({ success: false, message: "Missing Parent ID" }, { status: 400 });
            items = await Carton.find({ parentId }).sort({ createdAt: -1 });
        } else if (type === 'UNIT') {
            // Third Level: Show Units for a specific Carton
            if (!parentId) return NextResponse.json({ success: false, message: "Missing Parent ID" }, { status: 400 });
            items = await Unit.find({ parentId }).sort({ createdAt: -1 });
        }

        return NextResponse.json({ success: true, items, view: type });

    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
