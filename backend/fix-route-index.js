require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    const collection = db.collection('routes');

    // List existing indexes
    const indexes = await collection.indexes();
    console.log('📋 Current indexes on routes collection:');
    indexes.forEach(idx => console.log(' -', JSON.stringify(idx)));

    // Drop the stale routeCode_1 index if it exists
    const hasStaleIndex = indexes.some(idx => idx.name === 'routeCode_1');
    if (hasStaleIndex) {
        console.log('\n🗑️  Dropping stale index "routeCode_1"...');
        await collection.dropIndex('routeCode_1');
        console.log('✅ Stale index "routeCode_1" dropped successfully!\n');
    } else {
        console.log('\n✅ No stale "routeCode_1" index found. Nothing to drop.\n');
    }

    // Show final state
    const updatedIndexes = await collection.indexes();
    console.log('📋 Updated indexes on routes collection:');
    updatedIndexes.forEach(idx => console.log(' -', JSON.stringify(idx)));

    mongoose.disconnect();
    console.log('\n✅ Done! You can now create routes without errors.');
}).catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
});
