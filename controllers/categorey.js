const Category = require('../models/Category');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Get all categories
exports.getCategories = catchAsync(async (req, res) => {
    const categories = await Category.find({ isActive: true });
    res.status(200).json({
        status: 'success',
        results: categories.length,
        data: { categories }
    });
});

// Get single category
exports.getCategory = catchAsync(async (req, res, next) => {
    const category = await Category.findById(req.params.id);
    if (!category) return next(new AppError('No category found with that ID', 404));
    res.status(200).json({
        status: 'success',
        data: { category }
    });
});

// Create category
exports.createCategory = catchAsync(async (req, res, next) => {
    req.body.createdBy = req.user._id;
    const category = await Category.create(req.body);
    res.status(201).json({
        status: 'success',
        data: { category }
    });
});

// Update category
exports.updateCategory = catchAsync(async (req, res, next) => {
    const category = await Category.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    );
    if (!category) return next(new AppError('No category found with that ID', 404));
    res.status(200).json({
        status: 'success',
        data: { category }
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