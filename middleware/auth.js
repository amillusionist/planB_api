const jwt = require('jsonwebtoken');
const User = require('../models/User');
const admin = require('../config/firebaseAdmin');
const AppError = require('../utils/appError');

// Protect routes with either Firebase or JWT token
exports.protectWithBoth = async (req, res, next) => {
    try {
        let token;
        let user;

        // Check for Bearer token in header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return next(new AppError('No token provided', 401));
        }

        // Try JWT verification first
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            user = await User.findById(decoded.id);
            
            if (user && user.role === 'superadmin') {
                req.user = user;
                return next();
            }
        } catch (jwtError) {
            // If JWT verification fails, try Firebase token
            try {
                const decodedToken = await admin.auth().verifyIdToken(token);
                user = await User.findOne({ firebaseUid: decodedToken.uid });
                
                if (!user) {
                    return next(new AppError('User not found', 401));
                }
                
                req.user = user;
                return next();
            } catch (firebaseError) {
                return next(new AppError('Invalid token', 401));
            }
        }
    } catch (err) {
        return next(new AppError('Authentication failed', 401));
    }
};

// Protect routes
exports.protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized to access this route'
        });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = await User.findById(decoded.id);

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        next();
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized to access this route'
        });
    }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `User role ${req.user.role} is not authorized to access this route`
            });
        }
        next();
    };
}; 