import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Item from "@/model/Item";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function POST(req: Request) {
    await dbConnect();

    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (!session || user.role !== 'DISTRIBUTOR') {
        return NextResponse.json({ success: false, message: "Unauthorized: Distributors only" }, { status: 401 });
    }

    try {
        const { serial, location, status } = await req.json();

        if (!serial || !location || !status) {
            return NextResponse.json({ success: false, message: "Missing serial, location, or status" }, { status: 400 });
        }

        const item = await Item.findOne({ serial: serial });

        if (!item) {
            return NextResponse.json({ success: false, message: "Item not found" }, { status: 404 });
        }

        // Update Item Status
        item.status = status;
        item.history.push({
            status,
            location,
            timestamp: new Date(),
            scannedBy: user.username
        });

        await item.save();

        return NextResponse.json({
            success: true,
            message: `Item ${serial} updated to ${status} at ${location}`
        });

    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
