const Menu = require('../models/Menu');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get all menu items
// @route   GET /api/menu
// @access  Public
exports.getMenuItems = async (req, res, next) => {
    try {
        const menuItems = await Menu.find().populate('categories', 'name slug');
        res.status(200).json({
            success: true,
            count: menuItems.length,
            data: menuItems
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get single menu item
// @route   GET /api/menu/:id
// @access  Public
exports.getMenuItem = async (req, res, next) => {
    try {
        const menuItem = await Menu.findById(req.params.id).populate('categories', 'name slug');
        if (!menuItem) {
            return res.status(404).json({
                success: false,
                error: `Menu item not found with id of ${req.params.id}`
            });
        }
        res.status(200).json({
            success: true,
            data: menuItem
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get menu item by slug
// @route   GET /api/menu/slug/:slug
// @access  Public
exports.getMenuItemBySlug = async (req, res, next) => {
    try {
        const menuItem = await Menu.findOne({ slug: req.params.slug }).populate('categories', 'name slug');
        if (!menuItem) {
            return res.status(404).json({
                success: false,
                error: `Menu item not found with slug of ${req.params.slug}`
            });
        }
        res.status(200).json({
            success: true,
            data: menuItem
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Create new menu item
// @route   POST /api/menu
// @access  Private/Admin
exports.createMenuItem = asyncHandler(async (req, res) => {
    try {
        // Handle categories array
        if (req.body.categories) {
            // If categories is a string (JSON), parse it
            if (typeof req.body.categories === 'string') {
                try {
                    req.body.categories = JSON.parse(req.body.categories);
                } catch (e) {
                    return res.status(400).json({
                        success: false,
                        error: 'Invalid categories format. Must be a valid JSON array'
                    });
                }
            }
            
            // Ensure categories is an array
            if (!Array.isArray(req.body.categories)) {
                req.body.categories = [req.body.categories];
            }
            
            // Flatten the array in case it's nested
            req.body.categories = req.body.categories.flat();
        }

        const menuItem = await Menu.create(req.body);
        res.status(201).json({
            success: true,
            data: menuItem
        });
    } catch (error) {
        console.error('Error creating menu item:', error);
        if (error.code === 11000) {
            res.status(400).json({
                success: false,
                error: 'A menu item with this name already exists'
            });
        } else {
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }
});

// @desc    Update menu item
// @route   PUT /api/menu/:id
// @access  Private/Admin
exports.updateMenuItem = asyncHandler(async (req, res) => {
    try {
        console.log('Raw request body:', JSON.stringify(req.body, null, 2));
        console.log('Request headers:', req.headers);
        console.log('Update ID:', req.params.id);

        // Handle categories array
        if (req.body.categories) {
            // If categories is a string (JSON), parse it
            if (typeof req.body.categories === 'string') {
                try {
                    req.body.categories = JSON.parse(req.body.categories);
                } catch (e) {
                    return res.status(400).json({
                        success: false,
                        error: 'Invalid categories format. Must be a valid JSON array'
                    });
                }
            }
            
            // Ensure categories is an array
            if (!Array.isArray(req.body.categories)) {
                req.body.categories = [req.body.categories];
            }
            
            // Flatten the array in case it's nested
            req.body.categories = req.body.categories.flat();
        }

        const menuItem = await Menu.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!menuItem) {
            return res.status(404).json({
                success: false,
                error: 'Menu item not found'
            });
        }

        res.status(200).json({
            success: true,
            data: menuItem
        });
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).json({
                success: false,
                error: 'A menu item with this name already exists'
            });
        } else {
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }
});

// @desc    Delete menu item
// @route   DELETE /api/menu/:id
// @access  Private/Admin
exports.deleteMenuItem = async (req, res, next) => {
    try {
        const menuItem = await Menu.findByIdAndDelete(req.params.id);
        if (!menuItem) {
            return res.status(404).json({
                success: false,
                error: `Menu item not found with id of ${req.params.id}`
            });
        }
        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        next(err);
    }
}; 