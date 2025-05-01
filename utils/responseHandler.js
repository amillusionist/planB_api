const messages = require('../config/messages');

// Common response handler functions
const sendResponse = (res, statusCode, success, message, data = null) => {
    return res.status(statusCode).json({
        success,
        message,
        ...(data && { data })
    });
};

const sendSuccessResponse = (res, data = null, message = messages.common.success) => {
    return sendResponse(res, 200, true, message, data);
};

const sendErrorResponse = (res, statusCode = 400, message = messages.common.error) => {
    return sendResponse(res, statusCode, false, message);
};

const sendTokenResponse = (res, user, statusCode = 200) => {
    try {
        const token = user.getSignedJwtToken();
        const options = {
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            httpOnly: true,
            ...(process.env.NODE_ENV === 'production' && { secure: true })
        };

        // Prepare user data to send
        const userData = {
            id: user._id,
            name: user.name,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            profileCompleted: user.profileCompleted,
            addresses: user.addresses,
            paymentMethods: user.paymentMethods
        };

        return res
            .status(statusCode)
            .cookie('token', token, options)
            .json({
                success: true,
                token,
                user: userData
            });
    } catch (err) {
        console.error('Error in sendTokenResponse:', err);
        return sendErrorResponse(res, 500, messages.auth.token.error);
    }
};

module.exports = {
    sendResponse,
    sendSuccessResponse,
    sendErrorResponse,
    sendTokenResponse
}; 