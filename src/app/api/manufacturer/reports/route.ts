import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Report from "@/model/Report";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    await dbConnect();
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (!session || user.role !== 'MANUFACTURER') {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    try {
        const reports = await Report.find({})
            .populate('distributor', 'username businessId email')
            .sort({ createdAt: -1 });

        return NextResponse.json({ success: true, reports });

    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
