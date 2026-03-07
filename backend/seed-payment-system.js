const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/database');

// Load environment variables
dotenv.config();

// Import models
const TeaRate = require('./models/TeaRate');
const Route = require('./models/Route');
const Supplier = require('./models/Supplier');
const User = require('./models/User');

// Seed data
const seedPaymentSystem = async () => {
    try {
        console.log('🌱 Starting payment system seed...');

        // Connect to database
        await connectDB();

        // Get or create a factory manager user
        let factoryManager = await User.findOne({ role: 'factory_manager' });
        
        if (!factoryManager) {
            console.log('⚠️  No factory manager found. Please create a factory manager first.');
            console.log('You can do this through the signup process or manually in MongoDB.');
            process.exit(1);
        }

        const factoryId = factoryManager._id;
        console.log(`✅ Using factory: ${factoryManager.name} (${factoryManager._id})`);

        // 1. Create Tea Rate
        console.log('\n📊 Creating tea rate...');
        
        // Check if active tea rate exists
        const existingTeaRate = await TeaRate.findOne({ factoryId, status: 'Active' });
        
        let teaRate;
        if (existingTeaRate) {
            console.log('⚠️  Active tea rate already exists. Skipping...');
            teaRate = existingTeaRate;
        } else {
            teaRate = await TeaRate.create({
                factoryId,
                effectiveDate: new Date(),
                rates: [
                    { quality: 'Premium', ratePerKg: 95.0 },
                    { quality: 'A', ratePerKg: 85.0 },
                    { quality: 'B', ratePerKg: 75.0 },
                    { quality: 'C', ratePerKg: 65.0 }
                ],
                defaultRate: 85.0,
                transportRatePerKg: 10,
                bagWeightPercentage: 5,
                waterWeightPercentage: 3,
                coarseLeafPercentage: 2,
                status: 'Active',
                createdBy: factoryManager._id,
                notes: 'Initial tea rate - seeded data'
            });
            console.log(`✅ Tea rate created: Default rate Rs.${teaRate.defaultRate}/kg`);
        }

        // 2. Create Routes
        console.log('\n🚚 Creating routes...');
        
        const routeData = [
            {
                factoryId,
                routeNumber: 'KD-001',
                routeName: 'Kandy Route',
                area: 'Kandy District',
                description: 'Main collection route for Kandy area',
                collectionDays: ['Monday', 'Wednesday', 'Friday'],
                status: 'Active'
            },
            {
                factoryId,
                routeNumber: 'MT-002',
                routeName: 'Matale Route',
                area: 'Matale District',
                description: 'Matale area tea collection route',
                collectionDays: ['Tuesday', 'Thursday', 'Saturday'],
                status: 'Active'
            },
            {
                factoryId,
                routeNumber: 'NE-003',
                routeName: 'Nuwara Eliya Route',
                area: 'Nuwara Eliya District',
                description: 'Hill country tea collection route',
                collectionDays: ['Monday', 'Thursday'],
                status: 'Active'
            }
        ];

        const routes = [];
        for (const routeInfo of routeData) {
            const existingRoute = await Route.findOne({ routeNumber: routeInfo.routeNumber });
            if (existingRoute) {
                console.log(`⚠️  Route ${routeInfo.routeNumber} already exists. Skipping...`);
                routes.push(existingRoute);
            } else {
                const route = await Route.create(routeInfo);
                console.log(`✅ Route created: ${route.routeName} (${route.routeNumber})`);
                routes.push(route);
            }
        }

        // 3. Create Suppliers
        console.log('\n👨‍🌾 Creating suppliers...');
        
        const supplierData = [
            {
                supplierCode: 'SUP001',
                name: 'John Farmer',
                routeId: routes[0]._id,
                address: '123 Tea Estate Road, Kandy',
                contactNumber: '+94771234567',
                email: 'john.farmer@example.com',
                nicNumber: '123456789V',
                bankDetails: {
                    bankName: 'Bank of Ceylon',
                    branchName: 'Kandy Branch',
                    accountNumber: '1234567890',
                    accountHolderName: 'John Farmer'
                },
                preferredPaymentMethod: 'Bank'
            },
            {
                supplierCode: 'SUP002',
                name: 'Mary Silva',
                routeId: routes[0]._id,
                address: '456 Green Valley, Kandy',
                contactNumber: '+94772345678',
                email: 'mary.silva@example.com',
                nicNumber: '234567890V',
                bankDetails: {
                    bankName: 'Commercial Bank',
                    branchName: 'Kandy Branch',
                    accountNumber: '2345678901',
                    accountHolderName: 'Mary Silva'
                },
                preferredPaymentMethod: 'Bank'
            },
            {
                supplierCode: 'SUP003',
                name: 'Peter Fernando',
                routeId: routes[0]._id,
                address: '789 Hill View Estate, Kandy',
                contactNumber: '+94773456789',
                email: 'peter.fernando@example.com',
                nicNumber: '345678901V',
                bankDetails: {
                    bankName: 'Peoples Bank',
                    branchName: 'Kandy Branch',
                    accountNumber: '3456789012',
                    accountHolderName: 'Peter Fernando'
                },
                preferredPaymentMethod: 'Cash'
            },
            {
                supplierCode: 'SUP004',
                name: 'Nimal Perera',
                routeId: routes[1]._id,
                address: '321 Tea Garden, Matale',
                contactNumber: '+94774567890',
                email: 'nimal.perera@example.com',
                nicNumber: '456789012V',
                bankDetails: {
                    bankName: 'Bank of Ceylon',
                    branchName: 'Matale Branch',
                    accountNumber: '4567890123',
                    accountHolderName: 'Nimal Perera'
                },
                preferredPaymentMethod: 'Bank'
            },
            {
                supplierCode: 'SUP005',
                name: 'Kamala Jayawardana',
                routeId: routes[1]._id,
                address: '654 Mountain View, Matale',
                contactNumber: '+94775678901',
                email: 'kamala.j@example.com',
                nicNumber: '567890123V',
                bankDetails: {
                    bankName: 'Sampath Bank',
                    branchName: 'Matale Branch',
                    accountNumber: '5678901234',
                    accountHolderName: 'Kamala Jayawardana'
                },
                preferredPaymentMethod: 'Bank'
            }
        ];

        const suppliers = [];
        for (const supplierInfo of supplierData) {
            const existingSupplier = await Supplier.findOne({ supplierCode: supplierInfo.supplierCode });
            if (existingSupplier) {
                console.log(`⚠️  Supplier ${supplierInfo.supplierCode} already exists. Skipping...`);
                suppliers.push(existingSupplier);
                continue;
            }

            // Create user account for supplier
            const existingUser = await User.findOne({ email: supplierInfo.email });
            let user;
            
            if (existingUser) {
                user = existingUser;
                console.log(`⚠️  User account for ${supplierInfo.email} already exists. Using existing...`);
            } else {
                user = await User.create({
                    name: supplierInfo.name,
                    email: supplierInfo.email,
                    password: 'supplier123', // Default password
                    role: 'supplier',
                    factoryId
                });
                console.log(`✅ User account created: ${user.email}`);
            }

            const supplier = await Supplier.create({
                ...supplierInfo,
                userId: user._id,
                factoryId,
                status: 'Active'
            });
            
            console.log(`✅ Supplier created: ${supplier.name} (${supplier.supplierCode})`);
            suppliers.push(supplier);
        }

        // Update route supplier counts
        console.log('\n📊 Updating route supplier counts...');
        for (const route of routes) {
            const count = await Supplier.countDocuments({ routeId: route._id, status: 'Active' });
            await Route.findByIdAndUpdate(route._id, { supplierCount: count });
            console.log(`✅ Route ${route.routeNumber}: ${count} suppliers`);
        }

        console.log('\n✅ Payment system seed completed successfully!');
        console.log('\n📋 Summary:');
        console.log(`   - Tea Rate: ${teaRate ? 'Created/Exists' : 'N/A'}`);
        console.log(`   - Routes: ${routes.length} routes`);
        console.log(`   - Suppliers: ${suppliers.length} suppliers`);
        console.log(`   - Default Password: supplier123 (for all supplier accounts)`);
        
        console.log('\n📝 Next Steps:');
        console.log('   1. Start recording tea leaf entries');
        console.log('   2. Calculate monthly payments');
        console.log('   3. Approve and disburse payments');
        console.log('\n   See PAYMENT_SYSTEM_GUIDE.md for detailed instructions.');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding payment system:', error);
        process.exit(1);
    }
};

// Run seed
seedPaymentSystem();
