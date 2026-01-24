import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Pallet, Carton } from "@/model/Item";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import Anomaly from "@/model/Anomaly";
import { calculateDistance } from "@/helpers/geo";

export async function POST(req: Request) {
    await dbConnect();

    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (!session || user.role !== 'DISTRIBUTOR') {
        return NextResponse.json({ success: false, message: "Unauthorized: Distributors only" }, { status: 401 });
    }

    // Fetch full user to get registered location (session might not have it)
    const dbUser = await import("@/model/User").then(mod => mod.default.findById(user._id));
    if (!dbUser) {
        return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    try {
        const { serial, location, status, type, gps } = await req.json(); // GPS: { lat, lng }

        if (!serial || !location || !status || !type) {
            return NextResponse.json({ success: false, message: "Missing serial, location, status, or type" }, { status: 400 });
        }

        let item = null;
        let Model = null;

        if (type === 'PALLET') {
            Model = Pallet;
        } else if (type === 'CARTON') {
            Model = Carton;
        } else {
            return NextResponse.json({ success: false, message: "Invalid type. Must be PALLET or CARTON" }, { status: 400 });
        }

        item = await Model.findOne({ serial: serial });

        if (!item) {
            return NextResponse.json({ success: false, message: `${type} not found` }, { status: 404 });
        }

        // Anomaly Detection
        let anomalyDetected = false;
        let distance = 0;

        // 1. Check if User has a registered location
        if (dbUser.location && dbUser.location.geo && dbUser.location.geo.coordinates && gps && gps.lat && gps.lng) {
            const userLng = dbUser.location.geo.coordinates[0];
            const userLat = dbUser.location.geo.coordinates[1];

            // Calculate Distance
            distance = calculateDistance(userLat, userLng, gps.lat, gps.lng);

            // Threshold: 5 KM
            if (distance > 5) {
                // Log Anomaly
                await Anomaly.create({
                    distributorId: dbUser._id,
                    itemId: item._id,
                    itemType: type,
                    serial: serial,
                    expectedLocation: { lat: userLat, lng: userLng },
                    actualLocation: { lat: gps.lat, lng: gps.lng },
                    distanceKm: distance
                });

                return NextResponse.json({
                    success: false,
                    message: `Location Verification Failed: You are ${distance.toFixed(2)}km away from your registered location. Access Denied.`
                }, { status: 403 });
            }
        }

        // Update Item Status (Only if no anomaly)
        item.status = status;
        item.history.push({
            status: status,
            location,
            timestamp: new Date(),
            scannedBy: user.username
        });

        await item.save();

        return NextResponse.json({
            success: true,
            message: `${type} ${serial} updated to ${status} at ${location}`
        });

    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
