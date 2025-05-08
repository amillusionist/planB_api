const Order = require('../models/Order');
const User = require('../models/User');
const AppError = require('../utils/appError');

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private
exports.getOrders = async (req, res, next) => {
    try {
        let query;
        // If user is not admin, only show their orders
        if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
            query = Order.find({ 'user.userId': req.user.id });
        } else {
            query = Order.find();
        }

        const orders = await query.sort('-createdAt');
        res.status(200).json({
            success: true,
            count: orders.length,
            data: orders
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Create order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res, next) => {
    try {
        console.log('Received order creation request:', req.body);
        
        // Get user details
        const user = await User.findById(req.user.id);
        if (!user) {
            return next(new AppError('User not found', 404));
        }

        // Prepare order data
        const orderData = {
            orderId: req.body.orderId,
            orderType: req.body.orderType,
            tableNumber: req.body.tableNumber,
            user: {
                userId: user._id,
                name: user.name,
                email: user.email,
                phone: user.phoneNumber,
                address: req.body.address,
            },
            items: req.body.items.map(item => ({
                menuItem: item.menuItem,
                foodName: item.foodName,
                quantity: item.quantity,
                foodPrice: item.foodPrice,
                totalPrice: item.totalPrice,
            })),
            orderTotal: req.body.orderTotal,
            tax: req.body.tax || 0,
            shipping: req.body.shipping || 0,
            discount: req.body.discount || 0,
            notes: req.body.notes || "",
            paymentDetails: {
                paymentMethod: req.body.paymentDetails?.paymentMethod || "cash",
                amountPaid: req.body.paymentDetails?.amountPaid || 0,
                transactionId: req.body.paymentDetails?.transactionId || "",
                skipCashPaymentId: req.body.paymentDetails?.skipCashPaymentId || "",
                status: req.body.paymentDetails?.status || "new",
                payUrl: req.body.paymentDetails?.payUrl || "",
            }
        };

        console.log('Creating order with data:', JSON.stringify(orderData, null, 2));

        const order = await Order.create(orderData);

        res.status(201).json({
            success: true,
            data: order
        });
    } catch (err) {
        console.error('Error creating order:', err);
        next(err);
    }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = async (req, res, next) => {
    try {
        const order = await Order.findOne({ orderId: req.params.id });
        if (!order) {
            return next(new AppError(`Order not found with id of ${req.params.id}`, 404));
        }
        // Make sure user is order owner or admin
        if (order.user.userId.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'superadmin') {
            return next(new AppError(`Not authorized to access this order`, 401));
        }
        res.status(200).json({
            success: true,
            data: order
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res, next) => {
    try {
        const order = await Order.findOne({ orderId: req.params.id });
        if (!order) {
            return next(new AppError(`Order not found with id of ${req.params.id}`, 404));
        }

        // Update order status
        order.orderStatus = req.body.orderStatus;
        if (req.body.cookingStatus) {
            order.cookingStatus = req.body.cookingStatus;
        }
        if (req.body.paymentStatus) {
            order.paymentStatus = req.body.paymentStatus;
        }
        if (req.body.paymentDetails) {
            order.paymentDetails = {
                ...order.paymentDetails,
                ...req.body.paymentDetails
            };
        }

        await order.save();

        res.status(200).json({
            success: true,
            data: order
        });
    } catch (err) {
        next(err);
    }
}; 