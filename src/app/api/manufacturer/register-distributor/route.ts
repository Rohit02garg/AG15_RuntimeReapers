import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/model/User";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { sendEmail } from "@/helpers/mailer";

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
            const flattened = result.error.flatten().fieldErrors;
            const fieldErrors: any = {};

            // Take the first error message for each field
            Object.keys(flattened).forEach((key) => {
                if (flattened[key as keyof typeof flattened]) {
                    fieldErrors[key] = flattened[key as keyof typeof flattened]![0];
                }
            });

            return NextResponse.json({ success: false, errors: fieldErrors, message: "Validation Failed" }, { status: 400 });
        }

        const { username, password, businessId, city, pincode, gps, email, phone } = result.data;

        // Removed username unique check as per user request

        // Check for existing Business ID
        const existingBusinessId = await User.findOne({ businessId });
        if (existingBusinessId) {
            return NextResponse.json({ success: false, errors: { businessId: "Business ID already registered" }, message: "Validation Failed" }, { status: 400 });
        }

        // Check for existing Email
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return NextResponse.json({ success: false, errors: { email: "Email is already registered" }, message: "Validation Failed" }, { status: 400 });
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
            businessId,
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

        // Send Welcome Email
        if (email) {
            await sendEmail({
                email,
                emailType: "DISTRIBUTOR_WELCOME",
                userId: newUser._id,
                context: {
                    username,
                    password, // Sending raw password once (bad security practice usually, but standard for this kind of "admin creates user" flow)
                    businessId
                }
            });
        }

        return NextResponse.json({ success: true, message: "Distributor registered successfully" }, { status: 201 });

    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
