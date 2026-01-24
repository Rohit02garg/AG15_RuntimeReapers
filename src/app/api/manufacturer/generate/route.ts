import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Item, { Pallet, Carton, Unit } from "@/model/Item";
import { generateCustomSerial, generateSSCC } from "@/helpers/generator";
import { generateHash, getShortHash } from "@/helpers/crypto";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import mongoose from "mongoose";

export const maxDuration = 60; // Allow longer timeout for large batches

export async function POST(req: Request) {
    await dbConnect();

    // Auth Check
    const session = await getServerSession(authOptions);
    const user = session?.user as any;
    if (!session || user.role !== 'MANUFACTURER') {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { unitsPerCarton = 10, cartonsPerPallet = 50, totalPallets = 1 } = body;

        // Calculate totals
        const totalCartons = totalPallets * cartonsPerPallet;
        const totalUnits = totalCartons * unitsPerCarton;

        // We need a unique counter source. For MVP, we'll just query the DB count.
        const currentCount = await Item.countDocuments();
        let counter = currentCount + 1;

        const timestamp = Date.now();

        const pallets = [];
        const cartons = [];
        const units = [];

        for (let p = 0; p < totalPallets; p++) {
            const palletId = new mongoose.Types.ObjectId();
            const palletSerial = generateSSCC(counter++);
            const palletHash = generateHash(palletSerial, timestamp, 'PALLET');
            const palletShort = getShortHash(palletHash);

            pallets.push({
                _id: palletId,
                serial: palletSerial,
                hash: palletHash,
                shortHash: palletShort,
                status: 'CREATED',
                history: [{ status: 'CREATED', location: 'Factory', timestamp: new Date(), scannedBy: user.username }]
            });

            // 2. Generate Cartons for this Pallet
            for (let c = 0; c < cartonsPerPallet; c++) {
                const cartonId = new mongoose.Types.ObjectId();
                const cartonSerial = generateCustomSerial(counter++); // Use Custom Serial for Cartons
                const cartonHash = generateHash(cartonSerial, timestamp, 'CARTON');
                const cartonShort = getShortHash(cartonHash);

                cartons.push({
                    _id: cartonId,
                    serial: cartonSerial,
                    parentId: palletId, // LINK TO PALLET
                    hash: cartonHash,
                    shortHash: cartonShort,
                    status: 'CREATED',
                    history: [{ status: 'CREATED', location: 'Factory', timestamp: new Date(), scannedBy: user.username }]
                });

                // 3. Generate Units for this Carton
                for (let u = 0; u < unitsPerCarton; u++) {
                    const unitId = new mongoose.Types.ObjectId();
                    const unitSerial = generateCustomSerial(counter++);
                    const unitHash = generateHash(unitSerial, timestamp, 'UNIT');
                    const unitShort = getShortHash(unitHash);

                    units.push({
                        _id: unitId,
                        serial: unitSerial,
                        parentId: cartonId, // LINK TO CARTON
                        hash: unitHash,
                        shortHash: unitShort,
                        status: 'CREATED',
                        history: [{ status: 'CREATED', location: 'Factory', timestamp: new Date(), scannedBy: user.username }]
                    });
                }
            }
        }

        // Bulk Write
        // Bulk Write to Separate Collections
        await Pallet.insertMany(pallets);
        await Carton.insertMany(cartons);
        await Unit.insertMany(units);

        return NextResponse.json({
            success: true,
            message: `Generated ${totalPallets} Pallets, ${totalCartons} Cartons, ${totalUnits} Units`,
            stats: { pallets: totalPallets, cartons: totalCartons, units: totalUnits }
        });

    } catch (error: any) {
        console.error("Generation Error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
