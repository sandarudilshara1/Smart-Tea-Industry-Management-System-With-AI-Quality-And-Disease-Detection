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

        // Check for licenseNo index
        const hasLicenseNoIndex = indexes.some(idx => 
            idx.key.licenseNo !== undefined
        );

        if (hasLicenseNoIndex) {
            console.log('\n⚠️  Found licenseNo unique index - dropping it...');
            
            // Find the exact index name
            const licenseIndex = indexes.find(idx => idx.key.licenseNo !== undefined);
            await collection.dropIndex(licenseIndex.name);
            
            console.log(`✅ Successfully dropped index: ${licenseIndex.name}`);
            
            // Verify it's gone
            const newIndexes = await collection.indexes();
            console.log('\n📋 Indexes after removal:');
            newIndexes.forEach(index => {
                console.log(`  - ${index.name}:`, JSON.stringify(index.key));
            });
        } else {
            console.log('\n✅ No licenseNo unique index found - everything is good!');
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
