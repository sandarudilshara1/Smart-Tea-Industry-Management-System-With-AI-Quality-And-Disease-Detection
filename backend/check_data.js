const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env
dotenv.config();

const TeaLeafEntry = require('./models/TeaLeafEntry');
const FertilizerInventoryTransaction = require('./models/FertilizerInventoryTransaction');
const User = require('./models/User');
const Supplier = require('./models/Supplier'); // Added to fix populate error

async function testData() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        const leafCount = await TeaLeafEntry.countDocuments();
        console.log(`Total TeaLeafEntry records: ${leafCount}`);

        const fertilizerCount = await FertilizerInventoryTransaction.countDocuments();
        console.log(`Total FertilizerInventoryTransaction records: ${fertilizerCount}`);

        const users = await User.find().limit(10);
        console.log('--- Users in DB (Top 10) ---');
        users.forEach(u => console.log(`- ${u.email} (${u.role}, factoryId: ${u.factoryId})`));
        console.log('---------------------------');

        const user = await User.findOne({ email: 'inv@email.com' });
        if (user) {
            console.log(`User found: ${user.firstName} ${user.lastName} (Role: ${user.role}, FactoryId: ${user.factoryId})`);
            
            const userLeafCount = await TeaLeafEntry.countDocuments({ factoryId: user.factoryId });
            console.log(`Leaf entries for user's factory (${user.factoryId}): ${userLeafCount}`);
        } else {
            console.log('User inv@email.com not found.');
        }

        if (leafCount > 0) {
            const sampleLeaf = await TeaLeafEntry.findOne().populate('supplierId');
            console.log('Sample Leaf Entry (first):', JSON.stringify({
                _id: sampleLeaf._id,
                factoryId: sampleLeaf.factoryId,
                supplierName: sampleLeaf.supplierId?.name,
                date: sampleLeaf.date
            }, null, 2));
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

testData();
