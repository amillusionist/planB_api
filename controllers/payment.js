const PaymentService = require('../services/payment.service');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.initiatePayment = catchAsync(async (req, res, next) => {
    const {
        amount,
        firstName,
        lastName,
        phone,
        email,
        orderId,
        // Optional fields
        street,
        city,
        state,
        country,
        postalCode,
        custom1
    } = req.body;

    // Validate required fields
    if (!amount || !firstName || !lastName || !phone || !email || !orderId) {
        return next(new AppError('Missing required payment details', 400));
    }

    const result = await PaymentService.createPayment({
        amount,
        firstName,
        lastName,
        phone,
        email,
        orderId,
        street,
        city,
        state,
        country,
        postalCode,
        custom1
    });

    res.status(200).json({
        status: 'success',
        data: result
    });
});

exports.verifyPayment = catchAsync(async (req, res, next) => {
    const { paymentId } = req.params;

    if (!paymentId) {
        return next(new AppError('Payment ID is required', 400));
    }

    const result = await PaymentService.verifyPayment(paymentId);

    res.status(200).json({
        status: 'success',
        data: result
    });
});

exports.handleWebhook = catchAsync(async (req, res, next) => {
    const payload = req.body;
    
    // Verify webhook signature if provided by SkipCash
    // Process the webhook payload

    // Update order status based on payment status
    
    res.status(200).json({ received: true });
});
