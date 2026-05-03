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

export async function DELETE(req: NextRequest) {
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
            await Report.findByIdAndDelete(id);
            return NextResponse.json({ success: true, message: "Report deleted" });
        } else {
            const result = await Report.deleteMany({});
            return NextResponse.json({ success: true, message: `Cleared ${result.deletedCount} reports` });
        }

    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
