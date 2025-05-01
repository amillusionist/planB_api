const { User } = require('../models');
const { sendSuccessResponse, sendErrorResponse, sendTokenResponse } = require('../utils/responseHandler');
const messages = require('../config/messages');
const AppError = require('../utils/appError');
const admin = require('../config/firebaseAdmin');

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

// @desc    Verify Firebase token and create/update user
// @route   POST /api/auth/verify
// @access  Public
exports.verifyFirebaseToken = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        console.log('Auth Header:', authHeader);

        if (!authHeader) {
            console.log('No authorization header provided');
            return next(new AppError('No token provided', 401));
        }

        // Handle both Bearer and basic token formats
        let token;
        if (authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        } else {
            token = authHeader; // Accept the token directly
        }
        
        console.log('Token received:', token);

        // In development mode, try Firebase verification first
        if (process.env.NODE_ENV === 'development') {
            try {
                // Try Firebase verification first
                if (admin.apps.length) {
                    console.log('Attempting Firebase verification...');
                    const decodedToken = await admin.auth().verifyIdToken(token);
                    console.log('Firebase token verified successfully');
                    
                    const { uid: firebaseUid, phone_number: phoneNumber } = decodedToken;
                    
                    // Check if user exists
                    let user = await User.findOne({ firebaseUid });

                    if (!user) {
                        console.log('Creating new user from Firebase token...');
                        user = await User.create({
                            firebaseUid,
                            phoneNumber,
                            isVerified: true
                        });
                    } else {
                        user.lastLogin = Date.now();
                        await user.save();
                    }

                    return sendTokenResponse(res, user);
                }
            } catch (firebaseError) {
                console.log('Firebase verification failed, falling back to test mode');
                // Fall through to test mode
            }
        }

        // If Firebase verification failed or we're in test mode
        if (process.env.NODE_ENV === 'development') {
            console.log('Using test mode verification');
            const phoneNumber = token;
            
            let user = await User.findOne({ phoneNumber });
            if (!user) {
                user = await User.create({
                    phoneNumber,
                    isVerified: true,
                    firebaseUid: `test-${phoneNumber}`
                });
            }
            return sendTokenResponse(res, user);
        }

        // Production mode - must use Firebase verification
        if (!admin.apps.length) {
            console.error('Firebase Admin not initialized');
            return next(new AppError('Firebase Admin not initialized', 500));
        }

        // Verify Firebase token
        console.log('Verifying Firebase token...');
        const decodedToken = await admin.auth().verifyIdToken(token);
        console.log('Token verified successfully');
        
        const { uid: firebaseUid, phone_number: phoneNumber } = decodedToken;

        // Check if user exists
        let user = await User.findOne({ firebaseUid });

        if (!user) {
            console.log('Creating new user...');
            // Create new user
            user = await User.create({
                firebaseUid,
                phoneNumber,
                isVerified: true
            });
            console.log('New user created');
        } else {
            // Update last login
            user.lastLogin = Date.now();
            await user.save();
            console.log('User last login updated');
        }

        return sendTokenResponse(res, user);
    } catch (err) {
        console.error('Error in verifyFirebaseToken:', err);
        console.error('Error code:', err.code);
        console.error('Error message:', err.message);
        console.error('Error stack:', err.stack);

        if (err.code === 'auth/id-token-expired') {
            return next(new AppError('Token has expired', 401));
        }
        if (err.code === 'auth/argument-error') {
            return next(new AppError('Invalid token format', 401));
        }
        if (err.code === 'auth/invalid-token') {
            return next(new AppError('Invalid token', 401));
        }
        return next(new AppError('Token verification failed', 401));
    }
};

// @desc    Complete user profile
// @route   PUT /api/auth/complete-profile
// @access  Private
exports.completeProfile = async (req, res, next) => {
    try {
        if (!req.firebaseUser) {
            return next(new AppError('Firebase user not found', 401));
        }

        const { uid: firebaseUid } = req.firebaseUser;
        const { name, email, address } = req.body;

        // Find user
        const user = await User.findOne({ firebaseUid });

        if (!user) {
            return next(new AppError('User not found', 404));
        }

        // Update profile
        user.name = name;
        user.email = email;
        user.address = address;
        user.profileCompleted = true;

        await user.save();

        return sendSuccessResponse(res, user, 'Profile completed successfully');
    } catch (err) {
        console.error('Error in completeProfile:', err);
        next(err);
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
    try {
        if (!req.firebaseUser) {
            return next(new AppError('Firebase user not found', 401));
        }

        const { uid: firebaseUid } = req.firebaseUser;
        const user = await User.findOne({ firebaseUid });
        
        if (!user) {
            return next(new AppError('User not found', 404));
        }

        return sendSuccessResponse(res, user);
    } catch (err) {
        console.error('Error in getMe:', err);
        next(err);
    }
};

// @desc    Log user out / clear cookie
// @route   GET /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
    return sendSuccessResponse(res, {}, messages.auth.logout.success);
};

// @desc    Generate test token (for development only)
// @route   POST /api/auth/test-token
// @access  Public
exports.generateTestToken = async (req, res, next) => {
    try {
        const { phoneNumber } = req.body;

        if (!phoneNumber) {
            return next(new AppError('Phone number is required', 400));
        }

        // Create a custom token
        const customToken = await admin.auth().createCustomToken(phoneNumber);

        res.status(200).json({
            success: true,
            token: customToken
        });
    } catch (err) {
        next(err);
    }
}; 