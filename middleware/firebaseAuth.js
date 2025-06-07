const admin = require('../config/firebaseAdmin');
const AppError = require('../utils/appError');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

exports.verifyFirebaseToken = async (req, res, next) => {
    console.log('verifyFirebaseToken called', req.method, req.originalUrl);
    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next(new AppError('No token provided', 401));
        }

        const token = authHeader.split(' ')[1];

        // First try JWT for superadmin
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id);
            
            if (user && user.role === 'superadmin') {
                req.user = user;
                req.firebaseUser = { uid: user.firebaseUid };
                return next();
            }
        } catch (jwtError) {
            // If JWT fails, continue to Firebase verification
            console.log('JWT verification failed, trying Firebase');
        }

        // If not superadmin or JWT failed, try Firebase token
        if (!admin.apps.length) {
            throw new Error('Firebase Admin not initialized');
        }

        // Verify Firebase token
        const decodedToken = await admin.auth().verifyIdToken(token);
        
        // Add Firebase user info to request
        req.firebaseUser = {
            uid: decodedToken.uid,
            phone_number: decodedToken.phone_number
        };
        
        // Find or create user in database
        let user = await User.findOne({ phoneNumber: decodedToken.phone_number });
        
        if (!user) {
            // Create new user if doesn't exist
            user = await User.create({
                firebaseUid: decodedToken.uid,
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