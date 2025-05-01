const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

// Load env vars
dotenv.config();

// Connect to DB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('DB Connected'))
  .catch(err => console.error('DB Connection Error:', err));

const createSuperAdmin = async () => {
    try {
        // Check if superadmin already exists
        const existingAdmin = await User.findOne({ email: 'planbcafeqa@gmail.com' });
        
        if (existingAdmin) {
            console.log('Superadmin already exists');
            process.exit(0);
        }

        // Create superadmin with secure password
        const superadmin = await User.create({
            name: 'Super Admin',
            email: 'planbcafeqa@gmail.com',
            password: 'PlanB@2024!',
            phone: '1234567890',
            address: 'Plan B Cafe',
            role: 'superadmin'
        });

        console.log('Superadmin created successfully!');
        console.log('Email: planbcafeqa@gmail.com');
        console.log('Password: PlanB@2024!');
        process.exit(0);
    } catch (error) {
        console.error('Error creating superadmin:', error);
        process.exit(1);
    }
};

createSuperAdmin(); 