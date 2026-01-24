import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Unit } from "@/model/Item";
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
        // Fetch latest 50 Units for Label Printing
        const items = await Unit.find({})
            .sort({ createdAt: -1 })
            .limit(50);

        return NextResponse.json({ success: true, items });

    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
