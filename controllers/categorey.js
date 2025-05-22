const Category = require('../models/Category');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

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
    
    // Debug language
    console.log('Target Language:', targetLanguage);
    
    // Format categories based on language
    const formattedCategories = categories.map(category => 
        formatCategoryByLanguage(category, targetLanguage)
    );
    
    res.status(200).json({
        status: 'success',
        results: formattedCategories.length,
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

    // Ensure name and description are present in at least one language
    if (!req.body.name && !req.body.nameAr) {
        return next(new AppError('Category name (English or Arabic) is required', 400));
    }
    if (!req.body.description && !req.body.descriptionAr) {
        return next(new AppError('Category description (English or Arabic) is required', 400));
    }

    // If Arabic fields are missing, copy from English
    if (!req.body.nameAr && req.body.name) {
        req.body.nameAr = req.body.name;
    }
    if (!req.body.descriptionAr && req.body.description) {
        req.body.descriptionAr = req.body.description;
    }

    // If English fields are missing, copy from Arabic
    if (!req.body.name && req.body.nameAr) {
        req.body.name = req.body.nameAr;
    }
    if (!req.body.description && req.body.descriptionAr) {
        req.body.description = req.body.descriptionAr;
    }

    // Trim fields
    if (req.body.nameAr) {
        req.body.nameAr = req.body.nameAr.trim();
    }
    if (req.body.descriptionAr) {
        req.body.descriptionAr = req.body.descriptionAr.trim();
    }
    if (req.body.name) {
        req.body.name = req.body.name.trim();
    }
    if (req.body.description) {
        req.body.description = req.body.description.trim();
    }

    const category = await Category.create(req.body);
    const targetLanguage = (req.headers['accept-language'] || 'en').toLowerCase();
    const formattedCategory = formatCategoryByLanguage(category, targetLanguage);

    res.status(201).json({
        status: 'success',
        data: { category: formattedCategory }
    });
});

// Update category
exports.updateCategory = catchAsync(async (req, res, next) => {
    // Handle translations if provided
    if (req.body.nameAr) {
        req.body.nameAr = req.body.nameAr.trim();
    }
    if (req.body.descriptionAr) {
        req.body.descriptionAr = req.body.descriptionAr.trim();
    }
    
    const category = await Category.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    );
    
    if (!category) return next(new AppError('No category found with that ID', 404));
    
    const targetLanguage = (req.headers['accept-language'] || 'en').toLowerCase();
    const formattedCategory = formatCategoryByLanguage(category, targetLanguage);
    
    res.status(200).json({
        status: 'success',
        data: { category: formattedCategory }
    });
});

// Delete category
exports.deleteCategory = catchAsync(async (req, res, next) => {
    const category = await Category.findByIdAndUpdate(
        req.params.id,
        { isActive: false },
        { new: true }
    );
    if (!category) return next(new AppError('No category found with that ID', 404));
    res.status(204).json({ status: 'success', data: null });
});