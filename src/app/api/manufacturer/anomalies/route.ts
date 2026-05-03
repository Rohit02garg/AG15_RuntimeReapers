import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Anomaly from "@/model/Anomaly";
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
        const anomalies = await Anomaly.find({})
            .populate('distributorId', 'username location')
            .sort({ timestamp: -1 });

        return NextResponse.json({ success: true, anomalies });

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

        if (id) {
            await Anomaly.findByIdAndDelete(id);
            return NextResponse.json({ success: true, message: "Anomaly dismissed" });
        } else {
            // Clear all anomalies
            const result = await Anomaly.deleteMany({});
            return NextResponse.json({ success: true, message: `Cleared ${result.deletedCount} anomalies` });
        }

    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
