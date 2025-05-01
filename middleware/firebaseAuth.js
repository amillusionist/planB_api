const admin = require('../config/firebaseAdmin');
const AppError = require('../utils/appError');
const User = require('../models/User');

exports.verifyFirebaseToken = async (req, res, next) => {
    try {
        // Check if Firebase Admin is initialized
        if (!admin.apps.length) {
            throw new Error('Firebase Admin not initialized');
        }

        // Get token from header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next(new AppError('No token provided', 401));
        }

        const token = authHeader.split(' ')[1];

        // Verify Firebase token
        const decodedToken = await admin.auth().verifyIdToken(token);
        
        // Find or create user in database
        let user = await User.findOne({ phoneNumber: decodedToken.phone_number });
        
        if (!user) {
            // Create new user if doesn't exist
            user = await User.create({
                phoneNumber: decodedToken.phone_number,
                role: 'user'
            });
        }
        
        // Add user info to request
        req.user = {
            id: user._id,
            role: user.role,
            phoneNumber: user.phoneNumber
        };

        next();
    } catch (error) {
        console.error('Firebase token verification error:', error);
        if (error.code === 'auth/id-token-expired') {
            return next(new AppError('Token has expired', 401));
        }
        if (error.code === 'auth/argument-error') {
            return next(new AppError('Invalid token format', 401));
        }
        return next(new AppError('Invalid token', 401));
    }
}; 