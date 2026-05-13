/**
 * Delete test user account
 * Usage: node scripts/delete-test-user.js
 */
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function run() {
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI || process.env.DB_URI);
  console.log('✅  Connected to MongoDB');

  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }), 'users');

  const result = await User.deleteOne({ email: 'sathsarakumbukage@gmail.com' });

  if (result.deletedCount === 1) {
    console.log('✅  Deleted user: sathsarakumbukage@gmail.com');
  } else {
    console.log('ℹ️   User not found — nothing deleted.');
  }

  await mongoose.disconnect();
}

run().catch((err) => { console.error('❌', err.message); process.exit(1); });
