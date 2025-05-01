const MenuItem = require('../models/MenuItem');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all menu items
// @route   GET /api/menu
// @access  Public
exports.getMenuItems = async (req, res, next) => {
    try {
        const menuItems = await MenuItem.find();
        res.status(200).json({
            success: true,
            count: menuItems.length,
            data: menuItems
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Create menu item
// @route   POST /api/menu
// @access  Private/Admin
exports.createMenuItem = async (req, res, next) => {
    try {
        const menuItem = await MenuItem.create(req.body);
        res.status(201).json({
            success: true,
            data: menuItem
        });
    } catch (err) {
        console.log("Error details:", err);
        if (err.code === 11000) {
            console.log("Duplicate key details:", err.keyPattern);
            console.log("Duplicate key value:", err.keyValue);
        }
        next(err);
    }
};

// @desc    Update menu item
// @route   PUT /api/menu/:id
// @access  Private/Admin
exports.updateMenuItem = async (req, res, next) => {
    try {
        const menuItem = await MenuItem.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!menuItem) {
            return next(new ErrorResponse(`Menu item not found with id of ${req.params.id}`, 404));
        }
        res.status(200).json({
            success: true,
            data: menuItem
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete menu item
// @route   DELETE /api/menu/:id
// @access  Private/Admin
exports.deleteMenuItem = async (req, res, next) => {
    try {
        const menuItem = await MenuItem.findByIdAndDelete(req.params.id);
        if (!menuItem) {
            return next(new ErrorResponse(`Menu item not found with id of ${req.params.id}`, 404));
        }
        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        next(err);
    }
}; 