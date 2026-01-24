import mongoose, { Schema, Document } from 'mongoose';

export interface IAnomaly extends Document {
    distributorId: mongoose.Types.ObjectId;
    itemId: mongoose.Types.ObjectId;
    itemType: 'PALLET' | 'CARTON';
    serial: string;
    expectedLocation: { lat: number, lng: number }; // Registered Location
    actualLocation: { lat: number, lng: number }; // Scan Location
    distanceKm: number;
    timestamp: Date;
    resolved: boolean;
}

const AnomalySchema: Schema<IAnomaly> = new Schema({
    distributorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    itemId: { type: Schema.Types.ObjectId, required: true }, // Dynamic ref
    itemType: { type: String, enum: ['PALLET', 'CARTON'], required: true },
    serial: { type: String, required: true },
    expectedLocation: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
    },
    actualLocation: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
    },
    distanceKm: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now },
    resolved: { type: Boolean, default: false }
});

const Anomaly = (mongoose.models.Anomaly as mongoose.Model<IAnomaly>) || mongoose.model<IAnomaly>('Anomaly', AnomalySchema);

export default Anomaly;
