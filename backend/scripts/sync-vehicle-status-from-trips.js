require('dotenv').config();
const mongoose = require('mongoose');

const Driver = require('../models/Driver');
const Vehicle = require('../models/Vehicle');

(async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI not set');

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });

    const drivers = await Driver.find({ isActive: true, 'currentTrip.routeId': { $exists: true, $ne: null } })
      .select('name currentTrip')
      .lean();

    let markedInUse = 0;
    let released = 0;
    let skipped = 0;

    for (const d of drivers) {
      const trip = d.currentTrip || {};
      const tripStatus = String(trip.status || '').trim();
      const tripVehicleNo = String(trip.vehicleNo || '').trim().toUpperCase();

      if (!tripVehicleNo || tripVehicleNo === 'NOT ASSIGNED') {
        skipped++;
        continue;
      }
      if (!tripStatus) {
        skipped++;
        continue;
      }

      const vehicleDoc = await Vehicle.findOne({ vehicleNumber: tripVehicleNo, isActive: true });
      if (!vehicleDoc) {
        skipped++;
        continue;
      }

      const vehicleStatus = String(vehicleDoc.status || '').trim();

      if (tripStatus === 'Completed') {
        if (vehicleDoc.driverId) {
          vehicleDoc.status = 'Available';
          vehicleDoc.driverId = null;
          vehicleDoc.assignedDriver = null;
          await vehicleDoc.save();
          released++;
        } else {
          skipped++;
        }
        continue;
      }

      // Active trip => should be in use (unless Maintenance/Unavailable)
      if (['Maintenance', 'Unavailable'].includes(vehicleStatus)) {
        skipped++;
        continue;
      }

      vehicleDoc.status = 'In Use';
      vehicleDoc.assignedDriver = d.name;
      vehicleDoc.driverId = d._id;
      await vehicleDoc.save();
      markedInUse++;
    }

    console.log(
      JSON.stringify(
        {
          driversWithTrips: drivers.length,
          markedInUse,
          released,
          skipped,
        },
        null,
        2
      )
    );
  } catch (e) {
    console.error('sync failed:', e.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect().catch(() => {});
  }
})();
