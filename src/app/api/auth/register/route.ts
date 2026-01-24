import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/model/User";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
    try {
        const { username, password, role } = await req.json();

        if (!username || !password) {
            return NextResponse.json({ message: "Missing fields" }, { status: 400 });
        }

        await dbConnect();

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return NextResponse.json({ message: "User already exists" }, { status: 400 });
        }

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
