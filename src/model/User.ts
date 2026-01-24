import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    username: string;
    password: string; // Hashed
    role: 'MANUFACTURER' | 'DISTRIBUTOR' | 'RETAILER';
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
    }
});

const User = (mongoose.models.User as mongoose.Model<IUser>) || mongoose.model<IUser>('User', UserSchema);

export default User;
