const mongoose = require('mongoose');
const Menu = require('../models/Menu');
require('dotenv').config();

const migrateCategories = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find all menu items
        const menuItems = await Menu.find();
        console.log(`Found ${menuItems.length} menu items to migrate`);

        // Update each menu item
        for (const item of menuItems) {
            if (item.category && (!item.categories || item.categories.length === 0)) {
                item.categories = [item.category];
                await item.save();
                console.log(`Migrated item: ${item.name}`);
            }
        }

        console.log('Migration completed successfully');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
};

// Run the migration
migrateCategories(); 