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
