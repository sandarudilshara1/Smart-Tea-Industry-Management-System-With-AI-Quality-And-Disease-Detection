const mongoose = require('mongoose');
require('dotenv').config();

const dropLicenseIndex = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tea_factory', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        
        console.log('✓ Connected to MongoDB');
        
        const db = mongoose.connection.db;
        const collection = db.collection('drivers');
        
        // Get all indexes
        console.log('\nCurrent indexes on drivers collection:');
        const indexes = await collection.indexes();
        indexes.forEach(index => {
            console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`);
        });
        
        // Drop legacy unique indexes that may block driver creation
        const candidateIndexes = ['licenseNo_1', 'licenseNumber_1', 'userId_1'];
        for (const indexName of candidateIndexes) {
            try {
                await collection.dropIndex(indexName);
                console.log(`\n✓ Successfully dropped ${indexName} unique index`);
            } catch (error) {
                if (error.code === 27) {
                    console.log(`\n  Index ${indexName} does not exist (already removed)`);
                } else {
                    throw error;
                }
            }
        }
        
        // Show remaining indexes
        console.log('\nRemaining indexes on drivers collection:');
        const remainingIndexes = await collection.indexes();
        remainingIndexes.forEach(index => {
            console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`);
        });
        
        console.log('\n✓ Database update complete!');
        console.log('You can now add drivers with duplicate license numbers.');
        console.log('Multiple drivers can also share the same userId (or have no userId).');
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\nDatabase connection closed.');
    }
};

dropLicenseIndex();
