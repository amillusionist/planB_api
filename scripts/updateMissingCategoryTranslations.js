const mongoose = require('mongoose');
require('dotenv').config();

const Category = require('../models/Category');

const updateMissingTranslations = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Define translations for missing categories
        const translations = {
            'all day dishes': {
                nameAr: 'أطباق اليوم',
                descriptionAr: 'تشكيلة متنوعة من الأطباق الشهية متوفرة طوال اليوم'
            },
            'Salads': {
                nameAr: 'سلطات',
                descriptionAr: 'سلطات طازجة ومغذية'
            }
        };

        // Update each category with missing translations
        for (const [name, translation] of Object.entries(translations)) {
            const category = await Category.findOne({ name });
            if (category) {
                await Category.findByIdAndUpdate(category._id, translation);
                console.log(`Updated translations for: ${name}`);
            } else {
                console.log(`Category not found: ${name}`);
            }
        }

        console.log('\nVerifying translations...');
        
        // Verify all categories now have translations
        const categories = await Category.find({});
        let missingTranslations = [];

        for (const category of categories) {
            if (!category.nameAr || !category.descriptionAr) {
                missingTranslations.push(category.name);
            }
        }

        if (missingTranslations.length === 0) {
            console.log('All categories now have complete translations!');
        } else {
            console.log('Still missing translations for:', missingTranslations.join(', '));
        }

    } catch (error) {
        console.error('Error updating category translations:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    }
};

// Run the update
updateMissingTranslations(); 