const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Category = require('../models/Category');

const categoryMiddleware = {
  validateCategoryInput: (req, res, next) => {
    const { name, image } = req.body;
    if (!name) return next(new AppError('Category name is required', 400));
    if (!image) return next(new AppError('Category image is required', 400));
    next();
  },

  checkCategoryExists: catchAsync(async (req, res, next) => {
    const category = await Category.findById(req.params.id);
    if (!category) return next(new AppError('Category not found', 404));
    req.category = category;
    next();
  }),

  checkDuplicateCategory: catchAsync(async (req, res, next) => {
    const { name } = req.body;
    if (!name) return next();
    const existingCategory = await Category.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') }
    });
    if (existingCategory && existingCategory._id.toString() !== req.params.id) {
      return next(new AppError('Category with this name already exists', 400));
    }
    next();
  })
};

module.exports = categoryMiddleware;