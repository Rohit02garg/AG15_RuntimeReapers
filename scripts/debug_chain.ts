
import dbConnect from "@/lib/dbConnect";
import { Pallet, Carton, Unit } from "@/model/Item";

async function debugChain() {
    await dbConnect();
    console.log("Connected to DB");

    // Find one Unit
    const unit = await Unit.findOne().lean();
    if (!unit) {
        console.log("No Units found.");
        return;
    }
    console.log("Found Unit:", unit.serial, "ParentID:", unit.parentId);

    if (!unit.parentId) {
        console.log("Unit has no parentId!");
        return;
    }

    // Find Parent Carton
    const carton = await Carton.findById(unit.parentId).lean();
    if (!carton) {
        console.log("Parent Carton NOT FOUND with ID:", unit.parentId);
        return;
    }
    console.log("Found Parent Carton:", carton.serial, "ParentID:", carton.parentId);
    console.log("Carton History Length:", carton.history?.length);

    if (!carton.parentId) {
        console.log("Carton has no parentId!");
        return;
    }

    // Find Grandparent Pallet
    const pallet = await Pallet.findById(carton.parentId).lean();
    if (!pallet) {
        console.log("Grandparent Pallet NOT FOUND with ID:", carton.parentId);
        return;
    }
    console.log("Found Grandparent Pallet:", pallet.serial);
    console.log("Pallet History Length:", pallet.history?.length);

    console.log("\nIf you see this, the chain exists in DB.");
    process.exit(0);
}

debugChain().catch(console.error);
