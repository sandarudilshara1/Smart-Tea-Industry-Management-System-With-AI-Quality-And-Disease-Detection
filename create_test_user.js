const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: './backend/.env' });

const User = require('./backend/models/User');

async function createUser() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB.');

        const email = 'inv@rmail.com';
        const existing = await User.findOne({ email });
        if (existing) {
            console.log('User already exists.');
            process.exit(0);
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('mypass', salt);

        await User.create({
            email,
            password: hashedPassword,
            role: 'inventory_manager',
            firstName: 'Inventory',
            lastName: 'Manager',
            factoryId: '69f22b1fd22546f164bc0145', // Assign to the factory that has data
            isActive: true
        });

        console.log(`User ${email} created and assigned to factory 69f22b1fd22546f164bc0145.`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

createUser();
