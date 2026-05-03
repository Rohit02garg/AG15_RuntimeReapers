import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const MONGODB_URI = process.env.MONGODB_URI;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
    email: String,
    businessId: String,
    location: Object
}, { strict: false });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function seedAdmin() {
    if (!MONGODB_URI) {
        console.error('❌ MONGODB_URI is missing in .env file');
        process.exit(1);
    }

    try {
        console.log('⏳ Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to Database');

        // Check if a manufacturer already exists
        const existingAdmin = await User.findOne({ role: 'MANUFACTURER' });

        const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

        if (existingAdmin) {
            console.log(`⚠️  Admin already exists (Username: ${existingAdmin.username}). Updating password & username...`);
            existingAdmin.username = ADMIN_USERNAME;
            existingAdmin.password = hashedPassword;
            await existingAdmin.save();
            console.log('✅ Admin credentials updated successfully!');
        } else {
            console.log(`⏳ Creating fresh Admin account...`);
            await User.create({
                username: ADMIN_USERNAME,
                password: hashedPassword,
                role: 'MANUFACTURER'
            });
            console.log('✅ Fresh Admin created successfully!');
        }

        console.log(`\n🔑 Current Login Credentials:`);
        console.log(`   Username: ${ADMIN_USERNAME}`);
        console.log(`   Password: ${ADMIN_PASSWORD}\n`);

    } catch (error) {
        console.error('❌ Seeding failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from DB. Exiting...');
        process.exit(0);
    }
}

seedAdmin();
