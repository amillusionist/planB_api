const Order = require('../models/Order');
const Booking = require('../models/Booking');
const Feedback = require('../models/Feedback');
const MenuItem = require('../models/MenuItem');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
exports.getDashboardStats = async (req, res, next) => {
    try {
        const [
            totalOrders,
            totalBookings,
            totalFeedbacks,
            recentOrders,
            recentBookings,
            recentFeedbacks
        ] = await Promise.all([
            Order.countDocuments(),
            Booking.countDocuments(),
            Feedback.countDocuments(),
            Order.find().sort('-createdAt').limit(5),
            Booking.find().sort('-createdAt').limit(5),
            Feedback.find().sort('-createdAt').limit(5)
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalOrders,
                totalBookings,
                totalFeedbacks,
                recentOrders,
                recentBookings,
                recentFeedbacks
            }
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get recent orders
// @route   GET /api/admin/recent-orders
// @access  Private/Admin
exports.getRecentOrders = async (req, res, next) => {
    try {
        const orders = await Order.find().sort('-createdAt').limit(10);
        res.status(200).json({
            success: true,
            count: orders.length,
            data: orders
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get recent bookings
// @route   GET /api/admin/recent-bookings
// @access  Private/Admin
exports.getRecentBookings = async (req, res, next) => {
    try {
        const bookings = await Booking.find().sort('-createdAt').limit(10);
        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get recent feedbacks
// @route   GET /api/admin/recent-feedbacks
// @access  Private/Admin
exports.getRecentFeedbacks = async (req, res, next) => {
    try {
        const feedbacks = await Feedback.find().sort('-createdAt').limit(10);
        res.status(200).json({
            success: true,
            count: feedbacks.length,
            data: feedbacks
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get revenue statistics
// @route   GET /api/admin/revenue
// @access  Private/Admin
exports.getRevenue = async (req, res, next) => {
    try {
        const orders = await Order.find();
        const totalRevenue = orders.reduce((acc, order) => acc + order.totalAmount, 0);
        res.status(200).json({
            success: true,
            data: {
                totalRevenue,
                totalOrders: orders.length
            }
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get popular menu items
// @route   GET /api/admin/popular-items
// @access  Private/Admin
exports.getPopularItems = async (req, res, next) => {
    try {
        const orders = await Order.find();
        const itemCounts = {};
        
        orders.forEach(order => {
            order.items.forEach(item => {
                if (itemCounts[item.menuItem]) {
                    itemCounts[item.menuItem] += item.quantity;
                } else {
                    itemCounts[item.menuItem] = item.quantity;
                }
            });
        });

        const popularItems = await Promise.all(
            Object.entries(itemCounts)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(async ([menuItemId, count]) => {
                    const menuItem = await MenuItem.findById(menuItemId);
                    return {
                        menuItem,
                        count
                    };
                })
        );

        res.status(200).json({
            success: true,
            data: popularItems
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get busy time slots
// @route   GET /api/admin/busy-slots
// @access  Private/Admin
exports.getBusySlots = async (req, res, next) => {
    try {
        const bookings = await Booking.find();
        const slotCounts = {};
        
        bookings.forEach(booking => {
            const slot = booking.date.toISOString().split('T')[0] + ' ' + booking.timeSlot;
            if (slotCounts[slot]) {
                slotCounts[slot]++;
            } else {
                slotCounts[slot] = 1;
            }
        });

        const busySlots = Object.entries(slotCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([slot, count]) => ({
                slot,
                count
            }));

        res.status(200).json({
            success: true,
            data: busySlots
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get settings
// @route   GET /api/admin/settings
// @access  Private/Admin
exports.getSettings = async (req, res, next) => {
    try {
        // This is a placeholder. In a real application, you would fetch settings from a database
        const settings = {
            businessHours: {
                monday: { open: "09:00", close: "22:00" },
                tuesday: { open: "09:00", close: "22:00" },
                wednesday: { open: "09:00", close: "22:00" },
                thursday: { open: "09:00", close: "22:00" },
                friday: { open: "09:00", close: "23:00" },
                saturday: { open: "10:00", close: "23:00" },
                sunday: { open: "10:00", close: "22:00" }
            },
            maxBookingDuration: 120, // in minutes
            maxPartySize: 20,
            advanceBookingDays: 30
        };

        res.status(200).json({
            success: true,
            data: settings
        });
    } catch (err) {
        next(err);
    }
}; 