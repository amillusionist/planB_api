const jwt = require('jsonwebtoken');

// Public token verification middleware
exports.verifyPublicToken = (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Public token is required for this operation'
        });
    }

    try {
        // Verify public token
        const decoded = jwt.verify(token, process.env.PUBLIC_TOKEN_SECRET);

        // Add public token data to request
        req.publicToken = decoded;
        next();
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: 'Invalid public token'
        });
    }
};

// Generate public token
exports.generatePublicToken = () => {
    return jwt.sign(
        { 
            type: 'public',
            permissions: ['read']
        },
        process.env.PUBLIC_TOKEN_SECRET,
        { expiresIn: '30d' }
    );
}; 