const mongoose = require('mongoose');
require('dotenv').config();

const Menu = require('../models/Menu');

// Helper function to detect Arabic text
const isArabicText = (text) => {
    if (typeof text !== 'string') return false;
    return /[\u0600-\u06FF]/.test(text);
};

const updateMenuTranslations = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // First, clear all existing Arabic translations
        await Menu.updateMany({}, {
            $unset: { 
                nameAr: "", 
                descriptionAr: "",
                ingredientsAr: ""
            }
        });
        console.log('Cleared all existing Arabic translations');

        // Get all menu items
        const menuItems = await Menu.find({});
        console.log(`Found ${menuItems.length} menu items`);

        // Track used translations to avoid duplicates
        const usedTranslations = new Set();

        // Process each menu item
        for (const item of menuItems) {
            try {
                // Skip if no name or description
                if (!item.name || !item.description) {
                    console.log(`Skipping item ${item._id}: Missing name or description`);
                    continue;
                }

                const updates = {};
                
                // Handle name translation
                if (item.name && !isArabicText(item.name)) {
                    const nameAr = item.name;
                    if (!usedTranslations.has(nameAr)) {
                        updates.nameAr = nameAr;
                        usedTranslations.add(nameAr);
                    } else {
                        console.log(`Skipping duplicate name translation for: ${item.name}`);
                    }
                }
                
                // Handle description translation
                if (item.description && !isArabicText(item.description)) {
                    const descAr = item.description;
                    if (!usedTranslations.has(descAr)) {
                        updates.descriptionAr = descAr;
                        usedTranslations.add(descAr);
                    } else {
                        console.log(`Skipping duplicate description translation for: ${item.name}`);
                    }
                }
                
                // Handle ingredients translation
                if (item.ingredients && Array.isArray(item.ingredients)) {
                    const ingredientsAr = item.ingredients
                        .filter(ingredient => !isArabicText(ingredient))
                        .filter(ingredient => !usedTranslations.has(ingredient));
                    
                    if (ingredientsAr.length > 0) {
                        updates.ingredientsAr = ingredientsAr;
                        ingredientsAr.forEach(ing => usedTranslations.add(ing));
                    }
                }

                // Only update if there are changes
                if (Object.keys(updates).length > 0) {
                    await Menu.findByIdAndUpdate(item._id, updates);
                    console.log(`Updated translations for: ${item.name}`);
                } else {
                    console.log(`No translations needed for: ${item.name}`);
                }
            } catch (error) {
                console.error(`Error processing item ${item._id}:`, error);
            }
        }

        // Verify no duplicates exist
        const duplicates = await Menu.aggregate([
            {
                $group: {
                    _id: "$nameAr",
                    count: { $sum: 1 },
                    items: { $push: "$name" }
                }
            },
            {
                $match: {
                    count: { $gt: 1 },
                    _id: { $ne: null }
                }
            }
        ]);

        if (duplicates.length > 0) {
            console.log('\nFound duplicate translations:');
            duplicates.forEach(dup => {
                console.log(`Arabic name "${dup._id}" is used by: ${dup.items.join(', ')}`);
            });
        } else {
            console.log('\nNo duplicate translations found');
        }

        console.log('\nAll menu items updated successfully');
    } catch (error) {
        console.error('Error updating menu translations:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
};

// Run the update
updateMenuTranslations(); 