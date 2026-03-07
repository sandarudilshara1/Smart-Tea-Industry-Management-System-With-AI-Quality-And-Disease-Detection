require('dotenv').config();
const mongoose = require('mongoose');

async function checkAndFixIndexes() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const db = mongoose.connection.db;
        const collection = db.collection('drivers');

        // Get all indexes
        console.log('\n📋 Current indexes on drivers collection:');
        const indexes = await collection.indexes();
        indexes.forEach(index => {
            console.log(`  - ${index.name}:`, JSON.stringify(index.key));
        });

        // Drop legacy unique indexes on licenseNo/licenseNumber
        const legacyLicenseIndexes = indexes.filter((idx) => {
            const hasLicenseField = idx.key.licenseNo !== undefined || idx.key.licenseNumber !== undefined;
            return hasLicenseField && idx.unique;
        });

        if (legacyLicenseIndexes.length > 0) {
            console.log('\n⚠️  Found legacy unique license index(es) - dropping...');

            for (const index of legacyLicenseIndexes) {
                await collection.dropIndex(index.name);
                console.log(`✅ Successfully dropped index: ${index.name}`);
            }

            const newIndexes = await collection.indexes();
            console.log('\n📋 Indexes after removal:');
            newIndexes.forEach(index => {
                console.log(`  - ${index.name}:`, JSON.stringify(index.key));
            });
        } else {
            console.log('\n✅ No legacy unique license index found - everything is good!');
        }

        console.log('\n🎉 Done! License number validation is removed.');
        console.log('   Drivers can now have duplicate license numbers.');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.code === 27) {
            console.log('ℹ️  Index does not exist (already removed)');
        }
    } finally {
        await mongoose.connection.close();
        console.log('\n✅ Database connection closed');
    }
}

checkAndFixIndexes();
