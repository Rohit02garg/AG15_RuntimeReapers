import mongoose, { Schema, Document } from 'mongoose';

export interface IItem extends Document {
    serial: string;
    name?: string;
    type: 'UNIT' | 'CARTON' | 'PALLET';
    parentId?: mongoose.Types.ObjectId;
    path?: string; // Materialized path for hierarchy query
    hash: string;
    status: 'CREATED' | 'SHIPPED' | 'DELIVERED' | 'SOLD' | 'RECALLED';
    history: {
        status: string;
        location: string;
        timestamp: Date;
        scannedBy?: string; // Username of distributor
        notes?: string;
    }[];
    createdAt: Date;
    updatedAt: Date;
}

// Shared History Schema
const HistorySchema = new Schema({
    status: { type: String, required: true },
    location: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    scannedBy: { type: String },
    notes: { type: String }
});

// 1. PALLET Model
const PalletSchema = new Schema({
    serial: { type: String, required: true, unique: true, index: true },
    name: { type: String, default: "" },
    hash: { type: String, required: true },
    shortHash: { type: String, required: true }, // 8-char substring
    status: { type: String, default: 'CREATED' },
    path: { type: String, index: true },
    history: [HistorySchema]
}, { timestamps: true });

const Pallet = (mongoose.models.Pallet as mongoose.Model<IItem>) || mongoose.model<IItem>('Pallet', PalletSchema);

// 2. CARTON Model
const CartonSchema = new Schema({
    serial: { type: String, required: true, unique: true, index: true },
    name: { type: String, default: "" },
    parentId: { type: Schema.Types.ObjectId, ref: 'Pallet', index: true }, // Links to Pallet
    hash: { type: String, required: true },
    shortHash: { type: String, required: true },
    status: { type: String, default: 'CREATED' },
    path: { type: String, index: true },
    history: [HistorySchema]
}, { timestamps: true });

const Carton = (mongoose.models.Carton as mongoose.Model<IItem>) || mongoose.model<IItem>('Carton', CartonSchema);

// 3. UNIT Model
const UnitSchema = new Schema({
    serial: { type: String, required: true, unique: true, index: true },
    name: { type: String, default: "" },
    parentId: { type: Schema.Types.ObjectId, ref: 'Carton', index: true }, // Links to Carton
    hash: { type: String, required: true },
    shortHash: { type: String, required: true },
    status: { type: String, default: 'CREATED' },
    path: { type: String, index: true },
    history: [HistorySchema]
}, { timestamps: true });

const Unit = (mongoose.models.Unit as mongoose.Model<IItem>) || mongoose.model<IItem>('Unit', UnitSchema);

// Export them separately
export { Pallet, Carton, Unit };

// For legacy code compatibility, we might need a Helper to find ANY item
// But strictly speaking, they are now separate.
// We can remove 'Item' default export or make it a helper function?
// Let's keep a Dummy default export that throws error or tries to aggregate?
// Actually best to break 'Item' usage to force refactor.
export default Pallet; // Temporary default to prevent import crashes, but we should fix imports.
