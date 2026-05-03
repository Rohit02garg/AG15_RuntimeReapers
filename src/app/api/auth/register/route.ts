import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/model/User";
import bcrypt from "bcryptjs";

import { userRegistrationSchema } from "@/schemas/userSchema";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Zod Validation
        const result = userRegistrationSchema.safeParse(body);
        if (!result.success) {
            const errorMessage = (result.error as any).errors.map((e: any) => e.message).join(", ");
            return NextResponse.json({ message: errorMessage }, { status: 400 });
        }

        const { username, password, role } = result.data;

        await dbConnect();

        // Removed username unique check as per user request

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            username,
            password: hashedPassword,
            role: role || 'RETAILER'
        });

        return NextResponse.json({ message: "User created", user: newUser }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
