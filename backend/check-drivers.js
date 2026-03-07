require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('✅ Connected to MongoDB\n');
  
  const drivers = await mongoose.connection.db.collection('drivers').find({}).toArray();
  console.log('📊 Total drivers in MongoDB:', drivers.length);
  console.log('\n👥 Drivers:\n');
  
  drivers.forEach((d, i) => {
    console.log(`${i+1}. ${d.name} (${d.email})`);
    console.log('   ID:', d._id);
    console.log('   License:', d.licenseNo);
    console.log('   Vehicle:', d.vehicleNo || 'N/A');
    console.log('   Status:', d.status);
    console.log('   Created:', d.createdAt);
    console.log('');
  });
  
  mongoose.disconnect();
}).catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
