const mongoose = require('mongoose');
require('dotenv').config();

const Category = require('../models/Category');

const checkCategoryTranslations = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Get all categories
        const categories = await Category.find({});
        console.log(`\nFound ${categories.length} categories`);

        // Check each category for translations
        let missingTranslations = [];
        let hasTranslations = [];

        for (const category of categories) {
            const missing = [];
            
            if (!category.nameAr) {
                missing.push('nameAr');
            }
            if (!category.descriptionAr) {
                missing.push('descriptionAr');
            }

            if (missing.length > 0) {
                missingTranslations.push({
                    name: category.name,
                    missing: missing
                });
            } else {
                hasTranslations.push(category.name);
            }
        }

        // Print results
        console.log('\n=== Categories with Translations ===');
        if (hasTranslations.length > 0) {
            hasTranslations.forEach(name => console.log(`✓ ${name}`));
        } else {
            console.log('No categories have complete translations');
        }

        console.log('\n=== Categories Missing Translations ===');
        if (missingTranslations.length > 0) {
            missingTranslations.forEach(cat => {
                console.log(`✗ ${cat.name} - Missing: ${cat.missing.join(', ')}`);
            });
        } else {
            console.log('All categories have complete translations!');
        }

        // Print summary
        console.log('\n=== Summary ===');
        console.log(`Total Categories: ${categories.length}`);
        console.log(`Categories with translations: ${hasTranslations.length}`);
        console.log(`Categories missing translations: ${missingTranslations.length}`);

    } catch (error) {
        console.error('Error checking category translations:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    }
};

// Run the check
checkCategoryTranslations(); 