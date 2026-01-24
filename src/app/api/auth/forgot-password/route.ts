import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/model/User";
import { sendEmail } from "@/helpers/mailer";

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const { email } = await req.json();

        const user = await User.findOne({ email });

        if (!user) {
            // It is safer to return 200 even if user doesn't exist to prevent enumeration attacks,
            // but for this MVP/Task we can return 404 or success with message.
            // Let's return success msg "If email exists..." or specific error for easier debugging now.
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        await sendEmail({ email, emailType: "RESET", userId: user._id });

        return NextResponse.json({
            message: "Email sent successfully",
            success: true
        })

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
