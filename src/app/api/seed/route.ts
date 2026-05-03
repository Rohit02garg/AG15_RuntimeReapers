import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/model/User";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
    try {
        // Security: Require a secret key to prevent abuse in production
        const seedSecret = req.nextUrl.searchParams.get('key');
        if (seedSecret !== (process.env.NEXTAUTH_SECRET || 'super-secret-auth-key-change-me')) {
            return NextResponse.json(
                { error: 'Forbidden. Provide ?key=<NEXTAUTH_SECRET> to seed.' },
                { status: 403 }
            );
        }

        await dbConnect();

        const username = process.env.ADMIN_USERNAME || "admin";
        const password = process.env.ADMIN_PASSWORD || "admin123";

        // Check if exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return NextResponse.json({ message: "Admin user already exists. You can login.", user: existingUser });
        }

        // Create
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            username,
            password: hashedPassword,
            role: 'MANUFACTURER'
        });

        return NextResponse.json({
            message: "SUCCESS! Admin User Created.",
            credentials: { username, password },
            action: "Go to /login now"
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
