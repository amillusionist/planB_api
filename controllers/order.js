const Order = require('../models/Order');
const User = require('../models/User');
const AppError = require('../utils/appError');
const { emitNewOrder, emitOrderUpdate, emitOrderStatusChange } = require('../services/socketService');

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

        // Format address if provided
        let formattedAddress = null;
        if (req.body.deliveryAddress) {
            formattedAddress = {
                line1: req.body.deliveryAddress,
                city: req.body.city || 'Not specified',
                state: req.body.state || 'Not specified',
                postalCode: req.body.postalCode || 'Not specified',
                country: req.body.country || 'Not specified'
            };
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
                address: formattedAddress
            },
            items: req.body.items.map(item => ({
                foodSlug: item.foodSlug,
                foodName: item.foodName,
                quantity: item.quantity,
                foodPrice: item.foodPrice,
                totalPrice: item.totalPrice,
            })),
            orderTotal: req.body.orderTotal,
            tax: req.body.tax || 0,
            shipping: req.body.shipping || 0,
            discount: req.body.discount || 0,
            notes: req.body.specialInstructions || "",
            paymentDetails: {
                paymentMethod: req.body.paymentMethod,
                amountPaid: req.body.orderTotal,
                transactionId: req.body.payment?.transactionId || "",
                skipCashPaymentId: req.body.payment?.skipCashPaymentId || "",
                status: req.body.payment?.status || "new",
                payUrl: req.body.payment?.payUrl || "",
            }
        };

        console.log('Creating order with data:', JSON.stringify(orderData, null, 2));

        const order = await Order.create(orderData);

        // Emit new order event
        emitNewOrder('restaurant', order);

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

        // Emit order status change event
        emitOrderStatusChange('restaurant', order);
        
        // If it's a dine-in order, also emit to the specific table
        if (order.orderType === 'dine_in' && order.tableNumber) {
            emitOrderStatusChange(`table-${order.tableNumber}`, order);
        }

        res.status(200).json({
            success: true,
            data: order
        });
    } catch (err) {
        next(err);
    }
}; 