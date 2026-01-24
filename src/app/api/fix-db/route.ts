import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Item from "@/model/Item";
import mongoose from "mongoose";

export async function GET() {
    try {
        await dbConnect();

        // Option 1: Drop the entire collection to start fresh (Standard for Dev)
        // await Item.collection.drop(); 

        // Option 2: Just drop the indexes
        await Item.collection.dropIndexes();

        return NextResponse.json({
            success: true,
            message: "Indexes dropped successfully. Old 'serialNumber' index should be gone. You can now Generate."
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message });
    }
}
