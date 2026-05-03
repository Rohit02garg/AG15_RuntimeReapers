import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/model/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { sendEmail } from "@/helpers/mailer";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (!session || user.role !== 'MANUFACTURER') {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await params;
        const distributor = await User.findById(id).select('-password -__v');

        if (!distributor) {
            return NextResponse.json({ success: false, message: "Distributor not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, distributor });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (!session || user.role !== 'MANUFACTURER') {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await params;
        const body = await req.json();
        const { email, phone, city, pincode, gps, businessId } = body;

        const distributor = await User.findById(id);

        if (!distributor) {
            return NextResponse.json({ success: false, message: "Distributor not found" }, { status: 404 });
        }

        // Update fields
        if (email) distributor.email = email;
        if (phone) distributor.phone = phone;
        if (businessId) distributor.businessId = businessId;

        // Update Location if provided
        if (city || pincode || gps) {
            if (!distributor.location) {
                // Initialize with defaults to satisfy TS
                distributor.location = {
                    city: "",
                    pincode: "",
                    geo: { type: 'Point', coordinates: [0, 0] }
                };
            }

            if (city) distributor.location.city = city;
            if (pincode) distributor.location.pincode = pincode;

            if (gps) {
                try {
                    const parts = gps.split(',').map((p: string) => parseFloat(p.trim()));
                    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                        distributor.location.geo.coordinates = [parts[1], parts[0]]; // [Long, Lat]
                    }
                } catch (e) {
                    // ignore invalid gps format
                }
            }
        }

        await distributor.save();

        // Send Email Notification
        if (distributor.email) {
            await sendEmail({
                email: distributor.email,
                emailType: "DISTRIBUTOR_UPDATE",
                userId: distributor._id,
                context: {
                    message: "The manufacturer has updated your contact or location details."
                }
            });
        }

        return NextResponse.json({ success: true, message: "Distributor updated and notified", distributor });

    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (!session || user.role !== 'MANUFACTURER') {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await params;
        const distributor = await User.findById(id);

        if (!distributor) {
            return NextResponse.json({ success: false, message: "Distributor not found" }, { status: 404 });
        }

        if (distributor.role !== 'DISTRIBUTOR') {
            return NextResponse.json({ success: false, message: "Cannot delete non-distributor users" }, { status: 400 });
        }

        await User.findByIdAndDelete(id);
        return NextResponse.json({ success: true, message: `Distributor "${distributor.username}" deleted successfully` });

    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
