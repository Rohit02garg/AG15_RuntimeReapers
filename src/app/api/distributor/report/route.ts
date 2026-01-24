import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Report from "@/model/Report";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function POST(req: NextRequest) {
    await dbConnect();
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (!session || user.role !== 'DISTRIBUTOR') {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    try {
        const { content } = await req.json();

        if (!content || content.trim().length === 0) {
            return NextResponse.json({ success: false, message: "Content is required" }, { status: 400 });
        }

        const wordCount = content.trim().split(/\s+/).length;
        if (wordCount > 300) {
            return NextResponse.json({ success: false, message: `Report exceeds 300 words (Current: ${wordCount})` }, { status: 400 });
        }

        const newReport = await Report.create({
            distributor: user._id,
            content
        });

        return NextResponse.json({ success: true, message: "Report submitted successfully", report: newReport }, { status: 201 });

    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
