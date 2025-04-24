const { User } = require('../models');
const { sendSuccessResponse, sendErrorResponse, sendTokenResponse } = require('../utils/responseHandler');
const messages = require('../config/messages');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
    try {
        const { name, email, password, phone, address } = req.body;

        // Validate required fields
        if (!name || !email || !password || !phone || !address) {
            return sendErrorResponse(res, 400, messages.auth.register.missingFields);
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return sendErrorResponse(res, 400, messages.auth.register.userExists);
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            phone,
            address
        });

        return sendTokenResponse(res, user, 201);
    } catch (err) {
        next(err);
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate email & password
        if (!email || !password) {
            return sendErrorResponse(res, 400, messages.auth.login.missingCredentials);
        }

        // Check for user
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return sendErrorResponse(res, 401, messages.auth.login.invalidCredentials);
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return sendErrorResponse(res, 401, messages.auth.login.invalidCredentials);
        }

        return sendTokenResponse(res, user);
    } catch (err) {
        next(err);
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        return sendSuccessResponse(res, user, messages.auth.getMe.success);
    } catch (err) {
        next(err);
    }
};

// @desc    Log user out / clear cookie
// @route   GET /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
    return sendSuccessResponse(res, {}, messages.auth.logout.success);
}; 