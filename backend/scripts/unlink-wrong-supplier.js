/**
 * Unlink wrong supplier account
 * ================================
 * Removes the userId link from "Sup 1" that was incorrectly auto-linked
 * to sathsarakumbukage@gmail.com
 *
 * Usage: node scripts/unlink-wrong-supplier.js
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function run() {
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI || process.env.DB_URI);
  console.log('✅  Connected to MongoDB');

  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }), 'users');
  const Supplier = mongoose.model('Supplier', new mongoose.Schema({}, { strict: false }), 'suppliers');

  // Find the wrongly-linked user
  const user = await User.findOne({ email: 'sathsarakumbukage@gmail.com' }).lean();
  if (!user) {
    console.log('❌  User not found: sathsarakumbukage@gmail.com');
    process.exit(1);
  }
  console.log(`Found user: ${user._id} (${user.email})`);

  // Find supplier linked to this user
  const supplier = await Supplier.findOne({ userId: user._id }).lean();
  if (!supplier) {
    console.log('ℹ️   No supplier is linked to this user — nothing to do.');
    process.exit(0);
  }
  console.log(`Found wrongly-linked supplier: ${supplier._id} (${supplier.name})`);

  // Remove the userId link
  await Supplier.updateOne({ _id: supplier._id }, { $unset: { userId: '' } });
  console.log(`✅  Unlinked userId from supplier "${supplier.name}" (${supplier._id})`);

  await mongoose.disconnect();
  console.log('\nDone. The new account now has no supplier linked.');
  console.log('An admin can re-link it properly via POST /api/suppliers/me/link (owner/manager only).');
}

run().catch((err) => {
  console.error('❌  Error:', err.message);
  process.exit(1);
});
