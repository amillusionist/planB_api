const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Order = require('../models/Order');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
    try {
        const users = await User.find();
        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
        }
        res.status(200).json({
            success: true,
            data: user
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res, next) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!user) {
            return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
        }
        res.status(200).json({
            success: true,
            data: user
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
        }
        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getProfile = catchAsync(async (req, res, next) => {
    const user = await User.findOne({ firebaseUid: req.firebaseUser.uid })
        .select('-__v -createdAt -lastLogin');

    if (!user) {
        return next(new AppError('User not found', 404));
    }

    res.status(200).json({
        success: true,
        data: user
    });
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = catchAsync(async (req, res, next) => {
    const { name, email } = req.body;

    const user = await User.findOne({ firebaseUid: req.firebaseUser.uid });
    if (!user) {
        return next(new AppError('User not found', 404));
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;

    // Check if profile is completed
    if (name && email) {
        user.profileCompleted = true;
    }

    await user.save();

    res.status(200).json({
        success: true,
        data: user
    });
});

// @desc    Add user address
// @route   POST /api/users/addresses
// @access  Private
exports.addAddress = catchAsync(async (req, res, next) => {
    const { type, street, city, state, pincode, isDefault } = req.body;

    const user = await User.findOne({ firebaseUid: req.firebaseUser.uid });
    if (!user) {
        return next(new AppError('User not found', 404));
    }

    // If this is the first address or isDefault is true, set it as default
    if (user.addresses.length === 0 || isDefault) {
        // Reset all other addresses to non-default
        user.addresses.forEach(addr => {
            addr.isDefault = false;
        });
    }

    user.addresses.push({
        type,
        street,
        city,
        state,
        pincode,
        isDefault: user.addresses.length === 0 || isDefault
    });

    await user.save();

    res.status(201).json({
        success: true,
        data: user.addresses[user.addresses.length - 1]
    });
});

// @desc    Update user address
// @route   PUT /api/users/addresses/:id
// @access  Private
exports.updateAddress = catchAsync(async (req, res, next) => {
    const { type, street, city, state, pincode, isDefault } = req.body;
    const addressId = req.params.id;

    const user = await User.findOne({ firebaseUid: req.firebaseUser.uid });
    if (!user) {
        return next(new AppError('User not found', 404));
    }

    const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === addressId);
    if (addressIndex === -1) {
        return next(new AppError('Address not found', 404));
    }

    // If setting as default, reset all other addresses
    if (isDefault) {
        user.addresses.forEach(addr => {
            addr.isDefault = false;
        });
    }

    // Update address
    user.addresses[addressIndex] = {
        ...user.addresses[addressIndex].toObject(),
        type: type || user.addresses[addressIndex].type,
        street: street || user.addresses[addressIndex].street,
        city: city || user.addresses[addressIndex].city,
        state: state || user.addresses[addressIndex].state,
        pincode: pincode || user.addresses[addressIndex].pincode,
        isDefault: isDefault !== undefined ? isDefault : user.addresses[addressIndex].isDefault
    };

    await user.save();

    res.status(200).json({
        success: true,
        data: user.addresses[addressIndex]
    });
});

// @desc    Delete user address
// @route   DELETE /api/users/addresses/:id
// @access  Private
exports.deleteAddress = catchAsync(async (req, res, next) => {
    const addressId = req.params.id;

    const user = await User.findOne({ firebaseUid: req.firebaseUser.uid });
    if (!user) {
        return next(new AppError('User not found', 404));
    }

    const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === addressId);
    if (addressIndex === -1) {
        return next(new AppError('Address not found', 404));
    }

    const wasDefault = user.addresses[addressIndex].isDefault;
    user.addresses.splice(addressIndex, 1);

    // If we deleted the default address and there are other addresses, set the first one as default
    if (wasDefault && user.addresses.length > 0) {
        user.addresses[0].isDefault = true;
    }

    await user.save();

    res.status(200).json({
        success: true,
        data: {}
    });
});

// @desc    Add payment method
// @route   POST /api/users/payment-methods
// @access  Private
exports.addPaymentMethod = catchAsync(async (req, res, next) => {
    const { type, details, isDefault } = req.body;

    const user = await User.findOne({ firebaseUid: req.firebaseUser.uid });
    if (!user) {
        return next(new AppError('User not found', 404));
    }

    // If this is the first payment method or isDefault is true, set it as default
    if (user.paymentMethods.length === 0 || isDefault) {
        // Reset all other payment methods to non-default
        user.paymentMethods.forEach(pm => {
            pm.isDefault = false;
        });
    }

    user.paymentMethods.push({
        type,
        details,
        isDefault: user.paymentMethods.length === 0 || isDefault
    });

    await user.save();

    res.status(201).json({
        success: true,
        data: user.paymentMethods[user.paymentMethods.length - 1]
    });
});

// @desc    Update payment method
// @route   PUT /api/users/payment-methods/:id
// @access  Private
exports.updatePaymentMethod = catchAsync(async (req, res, next) => {
    const { type, details, isDefault, isActive } = req.body;
    const paymentMethodId = req.params.id;

    const user = await User.findOne({ firebaseUid: req.firebaseUser.uid });
    if (!user) {
        return next(new AppError('User not found', 404));
    }

    const pmIndex = user.paymentMethods.findIndex(pm => pm._id.toString() === paymentMethodId);
    if (pmIndex === -1) {
        return next(new AppError('Payment method not found', 404));
    }

    // If setting as default, reset all other payment methods
    if (isDefault) {
        user.paymentMethods.forEach(pm => {
            pm.isDefault = false;
        });
    }

    // Update payment method
    user.paymentMethods[pmIndex] = {
        ...user.paymentMethods[pmIndex].toObject(),
        type: type || user.paymentMethods[pmIndex].type,
        details: details || user.paymentMethods[pmIndex].details,
        isDefault: isDefault !== undefined ? isDefault : user.paymentMethods[pmIndex].isDefault,
        isActive: isActive !== undefined ? isActive : user.paymentMethods[pmIndex].isActive
    };

    await user.save();

    res.status(200).json({
        success: true,
        data: user.paymentMethods[pmIndex]
    });
});

// @desc    Delete payment method
// @route   DELETE /api/users/payment-methods/:id
// @access  Private
exports.deletePaymentMethod = catchAsync(async (req, res, next) => {
    const paymentMethodId = req.params.id;

    const user = await User.findOne({ firebaseUid: req.firebaseUser.uid });
    if (!user) {
        return next(new AppError('User not found', 404));
    }

    const pmIndex = user.paymentMethods.findIndex(pm => pm._id.toString() === paymentMethodId);
    if (pmIndex === -1) {
        return next(new AppError('Payment method not found', 404));
    }

    const wasDefault = user.paymentMethods[pmIndex].isDefault;
    user.paymentMethods.splice(pmIndex, 1);

    // If we deleted the default payment method and there are other methods, set the first one as default
    if (wasDefault && user.paymentMethods.length > 0) {
        user.paymentMethods[0].isDefault = true;
    }

    await user.save();

    res.status(200).json({
        success: true,
        data: {}
    });
});

// @desc    Get all customers (Admin only)
// @route   GET /api/users/customers
// @access  Private/Admin
exports.getAllCustomers = async (req, res, next) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'superadmin' && req.user.role !== 'admin') {
            return next(new AppError('Not authorized to access this route', 403));
        }

        // Get all users with role 'user'
        const customers = await User.find({ role: 'user' })
            .select('-password -__v') // Exclude sensitive fields
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            count: customers.length,
            data: customers
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get customer details by ID (Admin only)
// @route   GET /api/users/customers/:id
// @access  Private/Admin
exports.getCustomerById = async (req, res, next) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'superadmin' && req.user.role !== 'admin') {
            return next(new AppError('Not authorized to access this route', 403));
        }

        const customer = await User.findOne({ 
            _id: req.params.id,
            role: 'user'
        }).select('-password -__v');

        if (!customer) {
            return next(new AppError('Customer not found', 404));
        }

        res.status(200).json({
            success: true,
            data: customer
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get customer order statistics
// @route   GET /api/users/customers/:id/statistics
// @access  Private/Admin
exports.getCustomerStatistics = async (req, res, next) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'superadmin' && req.user.role !== 'admin') {
            return next(new AppError('Not authorized to access this route', 403));
        }

        const customerId = req.params.id;

        // Verify customer exists
        const customer = await User.findOne({ 
            _id: customerId,
            role: 'user'
        });

        if (!customer) {
            return next(new AppError('Customer not found', 404));
        }

        // Get order statistics
        const orders = await Order.find({ 'user.userId': customerId });

        // Calculate statistics
        const totalOrders = orders.length;
        const totalSpent = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        const lastOrder = orders.length > 0 
            ? orders.sort((a, b) => b.createdAt - a.createdAt)[0]
            : null;

        res.status(200).json({
            success: true,
            data: {
                totalOrders,
                totalSpent,
                lastOrder: lastOrder ? {
                    orderId: lastOrder.orderId,
                    totalAmount: lastOrder.totalAmount,
                    status: lastOrder.orderStatus,
                    createdAt: lastOrder.createdAt
                } : null
            }
        });
    } catch (err) {
        next(err);
    }
}; 