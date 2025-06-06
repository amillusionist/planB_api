const { body, param, query, validationResult } = require('express-validator');
const messages = require('../config/messages');

// Common validation rules
const commonRules = {
    id: param('id').isMongoId().withMessage(messages.common.invalidId),
    page: query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    limit: query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
};

// Auth validation rules
const authRules = {
    register: [
        body('name')
            .trim()
            .isLength({ min: 2, max: 20 })
            .withMessage('Name must be between 2 and 20 characters')
            .matches(/^[a-zA-Z\s]*$/)
            .withMessage('Name can only contain letters and spaces'),
        body('email')
            .trim()
            .isEmail()
            .withMessage('Please provide a valid email')
            .normalizeEmail()
    ],
    login: [
        body('phone')
            .trim()
            .isMobilePhone()
            .withMessage('Please provide a valid phone number')
    ]
};

// User validation rules
const userRules = {
    update: [
        body('name')
            .optional()
            .trim()
            .isLength({ min: 2, max: 20 })
            .withMessage('Name must be between 2 and 20 characters')
            .matches(/^[a-zA-Z\s]*$/)
            .withMessage('Name can only contain letters and spaces'),
        body('email')
            .optional()
            .trim()
            .isEmail()
            .withMessage('Please provide a valid email')
            .normalizeEmail()
    ]
};

// Menu validation rules
const menuRules = {
    create: [
        body('name')
            .trim()
            .isLength({ min: 2, max: 50 })
            .withMessage('Name must be between 2 and 50 characters'),
        body('description')
            .trim()
            .isLength({ min: 10, max: 200 })
            .withMessage('Description must be between 10 and 200 characters'),
        body('price')
            .isFloat({ min: 0 })
            .withMessage('Price must be a positive number'),
        body('category')
            .trim()
            .isLength({ min: 2, max: 30 })
            .withMessage('Category must be between 2 and 30 characters')
    ]
};

// Order validation rules
const orderRules = {
    create: [
        body('orderId')
            .notEmpty()
            .withMessage('Order ID is required'),
        body('items')
            .isArray()
            .withMessage('Items must be an array'),
        body('items.*.foodSlug')
            .notEmpty()
            .withMessage('Food slug is required'),
        body('items.*.foodName')
            .notEmpty()
            .withMessage('Food name is required'),
        body('items.*.quantity')
            .isInt({ min: 1 })
            .withMessage('Quantity must be at least 1'),
        body('items.*.foodPrice')
            .isFloat({ min: 0 })
            .withMessage('Food price must be a positive number'),
        body('items.*.totalPrice')
            .isFloat({ min: 0 })
            .withMessage('Total price must be a positive number'),
        body('orderTotal')
            .isFloat({ min: 0 })
            .withMessage('Order total must be a positive number'),
        body('orderType')
            .custom((value) => {
                const normalizedValue = value.toLowerCase().replace(/\s+/g, '_');
                return ['dine_in', 'takeaway', 'delivery', 'online'].includes(normalizedValue);
            })
            .withMessage('Invalid order type. Must be one of: Dine In, Takeaway, Delivery, Online'),
        body('tableNumber')
            .if(body('orderType').custom(value => value.toLowerCase().replace(/\s+/g, '_') === 'dine_in'))
            .notEmpty()
            .withMessage('Table number is required for dine-in orders'),
        body('deliveryAddress')
            .if(body('orderType').custom(value => value.toLowerCase().replace(/\s+/g, '_') === 'delivery'))
            .notEmpty()
            .withMessage('Delivery address is required for delivery orders'),
        body('paymentMethod')
            .isIn(['online', 'cash'])
            .withMessage('Payment method must be online or cash')
    ]
};

// Room validation rules
const roomRules = {
    create: [
        body('name')
            .trim()
            .isLength({ min: 2, max: 30 })
            .withMessage('Name must be between 2 and 30 characters'),
        body('capacity')
            .isInt({ min: 1, max: 20 })
            .withMessage('Capacity must be between 1 and 20'),
        body('price')
            .isFloat({ min: 0 })
            .withMessage('Price must be a positive number'),
        body('description')
            .trim()
            .isLength({ min: 10, max: 200 })
            .withMessage('Description must be between 10 and 200 characters')
    ]
};

// Room Booking validation rules
const roomBookingRules = {
    create: [
        body('roomId')
            .isMongoId()
            .withMessage('Invalid room ID'),
        body('startTime')
            .isISO8601()
            .withMessage('Invalid start time format')
            .custom((value) => {
                const bookingTime = new Date(value);
                const now = new Date();
                if (bookingTime < now) {
                    throw new Error('Start time cannot be in the past');
                }
                return true;
            }),
        body('endTime')
            .isISO8601()
            .withMessage('Invalid end time format')
            .custom((value, { req }) => {
                const startTime = new Date(req.body.startTime);
                const endTime = new Date(value);
                const maxDuration = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

                if (endTime <= startTime) {
                    throw new Error('End time must be after start time');
                }
                if (endTime - startTime > maxDuration) {
                    throw new Error('Booking duration cannot exceed 24 hours');
                }
                return true;
            })
    ]
};

// Feedback validation rules
const feedbackRules = {
    create: [
        body('rating')
            .isInt({ min: 1, max: 5 })
            .withMessage('Rating must be between 1 and 5'),
        body('comment')
            .trim()
            .isLength({ min: 10, max: 50 })
            .withMessage('Comment must be between 10 and 50 words')
            .custom((value) => {
                const wordCount = value.trim().split(/\s+/).length;
                if (wordCount > 50) {
                    throw new Error('Comment cannot exceed 50 words');
                }
                return true;
            })
    ]
};

// Validation middleware
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log('Validation Errors:', errors.array());
        console.log('Request Body:', req.body);
        return res.status(400).json({
            success: false,
            message: messages.common.validationError,
            errors: errors.array()
        });
    }
    next();
};

// Sanitize user input middleware
const sanitizeUserInput = (req, res, next) => {
    // Sanitize all string inputs
    if (req.body) {
        Object.keys(req.body).forEach(key => {
            if (typeof req.body[key] === 'string') {
                req.body[key] = req.body[key].trim();
            }
        });
    }
    next();
};

module.exports = {
    commonRules,
    authRules,
    userRules,
    menuRules,
    orderRules,
    roomRules,
    roomBookingRules,
    feedbackRules,
    validate,
    sanitizeUserInput
}; 