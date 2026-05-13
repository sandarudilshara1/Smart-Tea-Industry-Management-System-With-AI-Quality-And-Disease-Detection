const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './backend/.env' });

const TeaLeafEntry = require('./backend/models/TeaLeafEntry');

async function migrateData() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB.');

        const targetFactoryId = '69f58496dff50e6fabd3c45f';
        
        console.log(`Updating all TeaLeafEntry records to factoryId: ${targetFactoryId}...`);
        const result = await TeaLeafEntry.updateMany(
            {}, 
            { $set: { factoryId: new mongoose.Types.ObjectId(targetFactoryId) } }
        );

        console.log(`Successfully updated ${result.modifiedCount} records.`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

migrateData();
