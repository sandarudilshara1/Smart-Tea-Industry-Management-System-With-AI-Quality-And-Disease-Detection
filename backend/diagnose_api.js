const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const TeaLeafEntry = require('./models/TeaLeafEntry');
const FertilizerInventoryTransaction = require('./models/FertilizerInventoryTransaction');
const User = require('./models/User');
const Supplier = require('./models/Supplier');

async function diagnose() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB.');

        // 1. Check User
        const email = 'inv@rmail.com';
        let user = await User.findOne({ email });
        if (!user) {
            console.log(`User ${email} NOT FOUND. Checking for similar emails...`);
            const allUsers = await User.find({}, 'email role factoryId').limit(20);
            allUsers.forEach(u => console.log(`- ${u.email} (${u.role})`));
            
            console.log('\nCreating user inv@rmail.com for testing if it doesnt exist...');
            const bcrypt = require('bcryptjs');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('mypass', salt);
            
            user = await User.create({
                email,
                password: hashedPassword,
                role: 'inventory_manager',
                firstName: 'Inventory',
                lastName: 'Manager',
                factoryId: 1, // Using numeric 1 as seen in some parts, or we might need an ObjectId
                isActive: true
            });
            console.log('User inv@rmail.com created.');
        } else {
            console.log(`User found: ${user.email}, Role: ${user.role}, FactoryId: ${user.factoryId}`);
        }

        // 2. Check Data
        const totalLeaf = await TeaLeafEntry.countDocuments();
        const totalFert = await FertilizerInventoryTransaction.countDocuments();
        console.log(`\nTotal Data: Leaf=${totalLeaf}, Fertilizer=${totalFert}`);

        // 3. Check Join (Lookup)
        const leafWithSupplier = await TeaLeafEntry.aggregate([
            { $limit: 5 },
            {
                $lookup: {
                    from: 'suppliers',
                    localField: 'supplierId',
                    foreignField: '_id',
                    as: 'supplier'
                }
            }
        ]);
        
        console.log('\nLookup Test (TeaLeafEntry -> Supplier):');
        leafWithSupplier.forEach((l, i) => {
            console.log(`Entry ${i}: supplierId=${l.supplierId}, FoundJoin=${l.supplier.length > 0}`);
        });

        // 4. Test the exact query used in controller
        const factoryId = user.factoryId;
        const matchQuery = {};
        // If the controller uses isValidObjectId, we need to know if factoryId is a valid ObjectId string
        const isValidObjectId = (val) => typeof val === 'string' && mongoose.Types.ObjectId.isValid(val);
        
        if (isValidObjectId(factoryId)) {
            matchQuery.factoryId = new mongoose.Types.ObjectId(factoryId);
        }
        
        console.log(`\nTesting Match Query with factoryId="${factoryId}":`, matchQuery);
        const results = await TeaLeafEntry.find(matchQuery).limit(5);
        console.log(`Found ${results.length} matches for this factoryId.`);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

diagnose();
