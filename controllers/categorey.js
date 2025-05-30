const Category = require('../models/Category');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const path = require('path');
const { getTranslation } = require('../services/translationService');
const fs = require('fs');

// Helper function to format category based on language
const formatCategoryByLanguage = (category, language) => {
    if (!category) return null;
    
    const formatted = {
        _id: category._id,
        image: category.image,
        isActive: category.isActive,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
        slug: category.slug
    };

    // Debug log
    console.log('Language:', language);
    console.log('Category:', category);

    if (language === 'ar') {
        formatted.name = category.nameAr || category.name;
        formatted.description = category.descriptionAr || category.description;
    } else {
        formatted.name = category.name;
        formatted.description = category.description;
    }

    return formatted;
};

// Get all categories
exports.getCategories = catchAsync(async (req, res) => {
    // Debug headers
    console.log('All Headers:', req.headers);
    console.log('Accept-Language:', req.headers['accept-language']);
    
    const categories = await Category.find({ isActive: true });
    const targetLanguage = (req.headers['accept-language'] || 'en').toLowerCase();
    
    const formattedCategories = categories.map(category => 
        formatCategoryByLanguage(category, targetLanguage)
    );

    res.status(200).json({
        status: 'success',
        count: formattedCategories.length,
        data: { categories: formattedCategories }
    });
});

// Get single category
exports.getCategory = catchAsync(async (req, res, next) => {
    const category = await Category.findById(req.params.id);
    if (!category) return next(new AppError('No category found with that ID', 404));
    
    const targetLanguage = (req.headers['accept-language'] || 'en').toLowerCase();
    const formattedCategory = formatCategoryByLanguage(category, targetLanguage);
    
    res.status(200).json({
        status: 'success',
        data: { category: formattedCategory }
    });
});

// Create category
exports.createCategory = catchAsync(async (req, res, next) => {
    req.body.createdBy = req.user._id;

    // Handle file upload
    if (req.file) {
        // Create relative path for the image using forward slashes
        const relativePath = path.join('uploads', 'categories', req.file.filename).replace(/\\/g, '/');
        req.body.image = relativePath;
    } else if (!req.body.image) {
        return next(new AppError('Category image is required', 400));
    }

    // Ensure name and description are present
    if (!req.body.name) {
        return next(new AppError('Category name is required', 400));
    }
    if (!req.body.description) {
        return next(new AppError('Category description is required', 400));
    }

    // Trim fields
    req.body.name = req.body.name.trim();
    req.body.description = req.body.description.trim();

    // Get Arabic translations
    const nameAr = await getTranslation(req.body.name, 'ar');
    const descriptionAr = await getTranslation(req.body.description, 'ar');

    // Create category with both English and Arabic fields
    const category = await Category.create({
        name: req.body.name,
        nameAr: nameAr,
        description: req.body.description,
        descriptionAr: descriptionAr,
        image: req.body.image,
        createdBy: req.body.createdBy
    });

    const targetLanguage = (req.headers['accept-language'] || 'en').toLowerCase();
    const formattedCategory = formatCategoryByLanguage(category, targetLanguage);

    res.status(201).json({
        status: 'success',
        data: { category: formattedCategory }
    });
});

// Update category
exports.updateCategory = catchAsync(async (req, res, next) => {
    // Handle file upload
    if (req.file) {
        // Create relative path for the image using forward slashes
        const relativePath = path.join('uploads', 'categories', req.file.filename).replace(/\\/g, '/');
        req.body.image = relativePath;
    }

    // Get current category
    const currentCategory = await Category.findById(req.params.id);
    if (!currentCategory) {
        return next(new AppError('No category found with that ID', 404));
    }

    // Prepare update data
    const updateData = { ...req.body };

    // If name or description is being updated, translate them
    if (req.body.name && req.body.name !== currentCategory.name) {
        updateData.name = req.body.name.trim();
        updateData.nameAr = await getTranslation(updateData.name, 'ar');
    }
    if (req.body.description && req.body.description !== currentCategory.description) {
        updateData.description = req.body.description.trim();
        updateData.descriptionAr = await getTranslation(updateData.description, 'ar');
    }
    
    const category = await Category.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
    );
    
    const targetLanguage = (req.headers['accept-language'] || 'en').toLowerCase();
    const formattedCategory = formatCategoryByLanguage(category, targetLanguage);
    
    res.status(200).json({
        status: 'success',
        data: { category: formattedCategory }
    });
});

// Delete category (soft delete)
exports.deleteCategory = catchAsync(async (req, res, next) => {
    const category = await Category.findByIdAndUpdate(
        req.params.id,
        { isActive: false },
        { new: true }
    );
    if (!category) return next(new AppError('No category found with that ID', 404));
    res.status(204).json({ status: 'success', data: null });
});

// Restore category
exports.restoreCategory = catchAsync(async (req, res, next) => {
    const category = await Category.findByIdAndUpdate(
        req.params.id,
        { isActive: true },
        { new: true }
    );
    if (!category) return next(new AppError('No category found with that ID', 404));
    
    const targetLanguage = (req.headers['accept-language'] || 'en').toLowerCase();
    const formattedCategory = formatCategoryByLanguage(category, targetLanguage);
    
    res.status(200).json({
        status: 'success',
        data: { category: formattedCategory }
    });
});