import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    username: string;
    password: string; // Hashed
    role: 'MANUFACTURER' | 'DISTRIBUTOR' | 'RETAILER';
    location?: {
        city: string;
        pincode: string;
        geo: {
            type: 'Point';
            coordinates: number[]; // [longitude, latitude]
        };
    };
}

const UserSchema: Schema<IUser> = new Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Password is required']
    },
    role: {
        type: String,
        enum: ['MANUFACTURER', 'DISTRIBUTOR'],
        default: 'MANUFACTURER',
        required: true
    },
    location: {
        city: { type: String, trim: true },
        pincode: { type: String, trim: true },
        geo: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point'
            },
            coordinates: {
                type: [Number],
                required: false
            }
        }
    }
}, { timestamps: true });

// Index for Geospatial Queries
UserSchema.index({ 'location.geo': '2dsphere' });

const User = (mongoose.models.User as mongoose.Model<IUser>) || mongoose.model<IUser>('User', UserSchema);

export default User;
