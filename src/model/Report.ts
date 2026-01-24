import mongoose, { Schema, Document } from 'mongoose';

export interface IReport extends Document {
    distributor: mongoose.Schema.Types.ObjectId;
    content: string;
    createdAt: Date;
    updatedAt: Date;
}

const ReportSchema: Schema<IReport> = new Schema({
    distributor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: [true, 'Report content is required'],
        trim: true,
        validate: {
            validator: function (v: string) {
                // Approximate word count check
                return v.trim().split(/\s+/).length <= 300;
            },
            message: 'Report cannot exceed 300 words'
        }
    }
}, { timestamps: true });

const Report = (mongoose.models.Report as mongoose.Model<IReport>) || mongoose.model<IReport>('Report', ReportSchema);

export default Report;
