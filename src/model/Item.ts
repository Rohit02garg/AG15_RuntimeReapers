import mongoose, { Schema, Document } from 'mongoose';

export interface IItem extends Document {
    serial: string;
    sscc?: string;
    type: 'UNIT' | 'CASE' | 'PALLET';
    parentId?: mongoose.Types.ObjectId;
    path?: string;
    hash: string;
    fullHash: string;
    status: 'CREATED' | 'SHIPPED' | 'SOLD';
    createdAt: Date;
}

const ItemSchema: Schema<IItem> = new Schema({
    serial: {
        type: String,
        required: [true, 'Serial number is required'],
        unique: true,
        index: true,
        trim: true
    },
    sscc: {
        type: String,
        index: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['UNIT', 'CASE', 'PALLET'],
        required: [true, 'Item type is required']
    },
    parentId: {
        type: Schema.Types.ObjectId,
        ref: 'Item'
    },
    path: {
        type: String,
        index: true
    },
    hash: {
        type: String,
        required: [true, 'Hash is required']
    },
    fullHash: {
        type: String,
        required: [true, 'Full Hash is required'],
        select: false
    },
    status: {
        type: String,
        enum: ['CREATED', 'SHIPPED', 'SOLD'],
        default: 'CREATED'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Item = (mongoose.models.Item as mongoose.Model<IItem>) || mongoose.model<IItem>('Item', ItemSchema);

export default Item;
