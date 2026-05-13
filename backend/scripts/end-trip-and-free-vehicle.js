/*
One-time admin utility:
- Finds any active driver trip using a given vehicle (e.g. TRK-002)
- Marks trip as Completed and sets driver to Available
- Releases the vehicle back to Available and clears assignment fields

Usage:
  node scripts/end-trip-and-free-vehicle.js TRK-002
*/

require('dotenv').config();

const mongoose = require('mongoose');
const Driver = require('../models/Driver');
const Vehicle = require('../models/Vehicle');

async function main() {
    const rawVehicleNo = process.argv[2];
    const vehicleNumber = (rawVehicleNo || '').trim().toUpperCase();

    if (!vehicleNumber) {
        console.error('Missing vehicle number. Example: node scripts/end-trip-and-free-vehicle.js TRK-002');
        process.exitCode = 1;
        return;
    }

    if (!process.env.MONGODB_URI) {
        console.error('Missing MONGODB_URI in environment (.env)');
        process.exitCode = 1;
        return;
    }

    await mongoose.connect(process.env.MONGODB_URI);

    const activeDrivers = await Driver.find({
        isActive: true,
        'currentTrip.routeId': { $exists: true, $ne: null },
        'currentTrip.vehicleNo': new RegExp(`^${vehicleNumber}$`, 'i'),
        'currentTrip.status': { $ne: 'Completed' }
    }).select('name status vehicleNo currentTrip');

    console.log(`Active trip drivers using ${vehicleNumber}: ${activeDrivers.length}`);
    activeDrivers.forEach((d) => {
        console.log(`- ${d.name} | driver.status=${d.status} | trip.status=${d.currentTrip?.status} | trip.route=${d.currentTrip?.routeName || d.currentTrip?.routeId}`);
    });

    const now = new Date();
    let updatedDrivers = 0;

    for (const driver of activeDrivers) {
        driver.currentTrip.status = 'Completed';
        driver.currentTrip.lastUpdate = now;
        driver.status = 'Available';
        await driver.save();
        updatedDrivers += 1;
    }

    const vehicleDoc = await Vehicle.findOne({ vehicleNumber, isActive: true });
    let vehicleUpdated = false;

    if (vehicleDoc) {
        const before = {
            status: vehicleDoc.status,
            driverId: vehicleDoc.driverId,
            assignedDriver: vehicleDoc.assignedDriver
        };

        vehicleDoc.status = 'Available';
        vehicleDoc.driverId = null;
        vehicleDoc.assignedDriver = null;
        await vehicleDoc.save();
        vehicleUpdated = true;

        console.log('Vehicle before:', before);
        console.log('Vehicle after:', {
            status: vehicleDoc.status,
            driverId: vehicleDoc.driverId,
            assignedDriver: vehicleDoc.assignedDriver
        });
    } else {
        console.log(`Vehicle doc not found for ${vehicleNumber}`);
    }

    console.log(JSON.stringify({ updatedDrivers, vehicleUpdated }, null, 2));
}

main()
    .catch((err) => {
        console.error(err);
        process.exitCode = 1;
    })
    .finally(async () => {
        try {
            await mongoose.disconnect();
        } catch {
            // ignore
        }
    });
