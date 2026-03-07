require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('✅ Connected to MongoDB\n');
  
  const db = mongoose.connection.db;
  const routes = await db.collection('routes').find({}).toArray();
  
  console.log('📊 Total routes in MongoDB:', routes.length);
  
  if (routes.length > 0) {
    console.log('\n🚗 Routes:\n');
    routes.forEach((r, i) => {
      console.log(`${i+1}. ${r.routeName} (${r.routeNumber})`);
      console.log('   Area:', r.area);
      console.log('   Status:', r.status);
      console.log('   Suppliers:', r.supplierCount);
      console.log('   Collection Days:', r.collectionDays?.join(', ') || 'None');
      console.log('');
    });
  } else {
    console.log('\n⚠️  No routes found. Create routes using the Route Management page.');
  }
  
  mongoose.disconnect();
}).catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
