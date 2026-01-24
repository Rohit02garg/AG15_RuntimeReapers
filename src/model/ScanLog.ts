import mongoose, { Schema, Document } from 'mongoose';

export interface IScanLog extends Document {
    serial: string;
    location: string;
    timestamp: Date;
    ip?: string;
    stage?: string;
    status: 'VALID' | 'SUSPECT' | 'INVALID';
    notes?: string;
}

const ScanLogSchema: Schema<IScanLog> = new Schema({
    serial: {
        type: String,
        required: [true, 'Serial number is required'],
        index: true,
        trim: true
    },
    location: {
        type: String,
        required: [true, 'Location is required'],
        trim: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    ip: {
        type: String,
        trim: true
    },
    stage: {
        type: String,
        enum: ['MANUFACTURER', 'DISTRIBUTOR', 'RETAILER', 'CONSUMER'],
        trim: true
    },
    status: {
        type: String,
        enum: ['VALID', 'SUSPECT', 'INVALID'],
        required: [true, 'Status is required']
    },
    notes: String
});

const ScanLog = (mongoose.models.ScanLog as mongoose.Model<IScanLog>) || mongoose.model<IScanLog>('ScanLog', ScanLogSchema);

export default ScanLog;