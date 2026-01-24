import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/model/User";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

import { distributorRegistrationSchema } from "@/schemas/userSchema";

export async function POST(req: Request) {
    await dbConnect();
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (!session || user.role !== 'MANUFACTURER') {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();

        // Zod Validation
        const result = distributorRegistrationSchema.safeParse(body);
        if (!result.success) {
            const errorMessage = (result.error as any).errors.map((e: any) => e.message).join(", ");
            return NextResponse.json({ success: false, message: errorMessage }, { status: 400 });
        }

        const { username, password, city, pincode, gps, email, phone } = result.data;

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return NextResponse.json({ success: false, message: "Username already taken" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        let geo = { type: 'Point', coordinates: [0, 0] };
        if (gps) {
            // EXPECTED: "lat, long" -> e.g. "28.7041, 77.1025"
            // GEOJSON: [longitude, latitude] -> [77.1025, 28.7041]
            try {
                const parts = gps.split(',').map((p: string) => parseFloat(p.trim()));
                if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                    geo.coordinates = [parts[1], parts[0]]; // Swap to [Long, Lat]
                }
            } catch (e) {
                console.warn("Invalid GPS format provided");
            }
        }

        const newUser = new User({
            username,
            password: hashedPassword,
            role: 'DISTRIBUTOR',
            email,
            phone,
            location: {
                city,
                pincode,
                geo
            }
        });

        await newUser.save();

        return NextResponse.json({ success: true, message: "Distributor registered successfully" }, { status: 201 });

    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
