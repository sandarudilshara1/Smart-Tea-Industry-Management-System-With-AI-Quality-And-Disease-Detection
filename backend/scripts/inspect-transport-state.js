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

        const vehicles = await Vehicle.find({ isActive: true })
            .select('vehicleNumber status driverId assignedDriver isActive')
            .sort({ vehicleNumber: 1 })
            .lean();

        const availableVehicles = vehicles.filter(
            (v) => String(v.status || '').trim() === 'Available'
        );

        const drivers = await Driver.find({ isActive: true })
            .select('name vehicleNo status currentTrip')
            .sort({ updatedAt: -1 })
            .lean();

        const trips = drivers
            .filter((d) => d.currentTrip && d.currentTrip.routeId)
            .map((d) => {
                const tripVehicleNo = String(d.currentTrip.vehicleNo || '').trim().toUpperCase();
                const tripStatus = String(d.currentTrip.status || '').trim();
                return {
                    driver: d.name,
                    driverStatus: d.status,
                    tripRouteId: d.currentTrip.routeId,
                    tripVehicleNo,
                    tripStatus,
                };
            });

        const takenByTrip = new Map();
        for (const t of trips) {
            if (!t.tripVehicleNo) continue;
            if (t.tripVehicleNo === 'NOT ASSIGNED') continue;
            // Treat as taken only if status is present and not Completed.
            if (!t.tripStatus) continue;
            if (t.tripStatus === 'Completed') continue;
            takenByTrip.set(t.tripVehicleNo, t);
        }

        console.log('\n=== Active Vehicles (isActive=true) ===');
        vehicles.forEach((v) => {
            console.log(
                JSON.stringify(
                    {
                        vehicleNumber: v.vehicleNumber,
                        status: v.status,
                        driverId: v.driverId,
                        assignedDriver: v.assignedDriver,
                    },
                    null,
                    0
                )
            );
        });

        console.log('\n=== Available Vehicles ===');
        console.log(availableVehicles.map((v) => v.vehicleNumber));

        console.log('\n=== Driver Trips (routeId present) ===');
        trips.forEach((t) => console.log(JSON.stringify(t, null, 0)));

        console.log('\n=== Vehicles taken by non-completed trips ===');
        for (const [vehicleNumber, info] of takenByTrip.entries()) {
            console.log(
                JSON.stringify(
                    {
                        vehicleNumber,
                        takenByDriver: info.driver,
                        tripStatus: info.tripStatus,
                        driverStatus: info.driverStatus,
                    },
                    null,
                    0
                )
            );
        }

        console.log('\n=== Available vehicles that are also taken by trip (inconsistency) ===');
        const inconsistent = availableVehicles
            .map((v) => v.vehicleNumber)
            .filter((vn) => takenByTrip.has(String(vn).trim().toUpperCase()));
        console.log(inconsistent);
    } catch (e) {
        console.error('inspect failed:', e.message);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect().catch(() => { });
    }
})();
