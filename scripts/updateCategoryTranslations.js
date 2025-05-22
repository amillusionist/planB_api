const mongoose = require('mongoose');
require('dotenv').config();

const Category = require('../models/Category');

const categoryTranslations = {
    'breakfast': {
        nameAr: 'إفطار',
        descriptionAr: 'جميع أنواع المشروبات والمرطبات.'
    },
    'ice-creams': {
        nameAr: 'آيس كريم',
        descriptionAr: 'حلويات ووجبات خفيفة حلوة.'
    },
    'hot-drinks': {
        nameAr: 'مشروبات ساخنة',
        descriptionAr: 'مشروبات ساخنة بما في ذلك القهوة والشاي.'
    },
    'cold-drinks': {
        nameAr: 'مشروبات باردة',
        descriptionAr: 'مشروبات منعشة وباردة.'
    },
    'snacks': {
        nameAr: 'وجبات خفيفة',
        descriptionAr: 'وجبات خفيفة لذيذة.'
    },
    'desserts': {
        nameAr: 'حلويات',
        descriptionAr: 'حلويات وحلويات لذيذة.'
    },
    'sandwiches': {
        nameAr: 'شطائر',
        descriptionAr: 'شطائر لذيذة ومتنوعة.'
    }
};

const updateCategories = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // First, clear all existing Arabic translations
        await Category.updateMany({}, {
            $unset: { nameAr: "", descriptionAr: "" }
        });
        console.log('Cleared all existing Arabic translations');

        // Update each category with new translations
        for (const [slug, translations] of Object.entries(categoryTranslations)) {
            const category = await Category.findOne({ slug });
            if (category) {
                // Check if this translation is already used by another category
                const existingCategory = await Category.findOne({
                    _id: { $ne: category._id },
                    $or: [
                        { nameAr: translations.nameAr },
                        { descriptionAr: translations.descriptionAr }
                    ]
                });

                if (existingCategory) {
                    console.log(`Warning: Translation for ${category.name} is already used by ${existingCategory.name}`);
                    continue;
                }

                category.nameAr = translations.nameAr;
                category.descriptionAr = translations.descriptionAr;
                await category.save();
                console.log(`Updated category: ${category.name}`);
            } else {
                console.log(`Category not found: ${slug}`);
            }
        }

        // Verify no duplicates exist
        const duplicates = await Category.aggregate([
            {
                $group: {
                    _id: "$nameAr",
                    count: { $sum: 1 },
                    categories: { $push: "$name" }
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
                console.log(`Arabic name "${dup._id}" is used by: ${dup.categories.join(', ')}`);
            });
        } else {
            console.log('\nNo duplicate translations found');
        }

        console.log('\nAll categories updated successfully');
    } catch (error) {
        console.error('Error updating categories:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
};

// Run the update
updateCategories(); 