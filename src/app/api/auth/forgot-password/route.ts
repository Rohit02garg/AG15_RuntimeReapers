import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/model/User";
import { sendEmail } from "@/helpers/mailer";

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const { identifier } = await req.json();

        if (!identifier || typeof identifier !== "string") {
            return NextResponse.json({ message: "Email or username is required" }, { status: 400 });
        }

        const normalizedIdentifier = identifier.trim();
        const escapedIdentifier = normalizedIdentifier.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

        const user = await User.findOne({
            $or: [
                { email: { $regex: `^${escapedIdentifier}$`, $options: "i" } },
                { username: normalizedIdentifier }
            ]
        });

        if (!user) {
            return NextResponse.json({
                message: "If an account exists, a reset link has been sent"
            });
        }

        if (!user.email) {
            return NextResponse.json({
                message: "This account has no email configured. Contact your administrator."
            }, { status: 400 });
        }

        await sendEmail({ email: user.email, emailType: "RESET", userId: user._id });

        return NextResponse.json({
            message: "If an account exists, a reset link has been sent",
            success: true
        })

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
