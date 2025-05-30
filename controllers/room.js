const Room = require('../models/Room');
const ErrorResponse = require('../utils/errorResponse');
const RoomBooking = require('../models/RoomBooking');
const AppError = require('../utils/appError');

// @desc    Get all rooms
// @route   GET /api/rooms
// @access  Public
exports.getRooms = async (req, res, next) => {
    try {
        const rooms = await Room.find();
        res.status(200).json({
            success: true,
            count: rooms.length,
            data: rooms
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get single room
// @route   GET /api/rooms/:id
// @access  Public
exports.getRoom = async (req, res, next) => {
    try {
        const room = await Room.findById(req.params.id);
        if (!room) {
            return next(new ErrorResponse(`Room not found with id of ${req.params.id}`, 404));
        }
        res.status(200).json({
            success: true,
            data: room
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get available rooms
// @route   GET /api/rooms/available
// @access  Public
exports.getAvailableRooms = async (req, res, next) => {
    try {
        const rooms = await Room.find({ isAvailable: true });
        res.status(200).json({
            success: true,
            count: rooms.length,
            data: rooms
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Create room
// @route   POST /api/rooms
// @access  Private/Admin
exports.createRoom = async (req, res, next) => {
    try {
        const room = await Room.create(req.body);
        res.status(201).json({
            success: true,
            data: room
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Update room
// @route   PUT /api/rooms/:id
// @access  Private/Admin
exports.updateRoom = async (req, res, next) => {
    try {
        const room = await Room.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!room) {
            return next(new ErrorResponse(`Room not found with id of ${req.params.id}`, 404));
        }
        res.status(200).json({
            success: true,
            data: room
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete room
// @route   DELETE /api/rooms/:id
// @access  Private/Admin
exports.deleteRoom = async (req, res, next) => {
    try {
        const room = await Room.findByIdAndDelete(req.params.id);
        if (!room) {
            return next(new ErrorResponse(`Room not found with id of ${req.params.id}`, 404));
        }
        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Update room availability
// @route   PUT /api/rooms/:id/availability
// @access  Private/Admin
exports.updateRoomAvailability = async (req, res, next) => {
    try {
        const room = await Room.findByIdAndUpdate(
            req.params.id,
            { isAvailable: req.body.isAvailable },
            { new: true, runValidators: true }
        );
        if (!room) {
            return next(new ErrorResponse(`Room not found with id of ${req.params.id}`, 404));
        }
        res.status(200).json({
            success: true,
            data: room
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Upload room photo
// @route   PUT /api/rooms/:id/photo
// @access  Private/Admin
exports.uploadRoomPhoto = async (req, res, next) => {
    try {
        const room = await Room.findById(req.params.id);
        if (!room) {
            return next(new ErrorResponse(`Room not found with id of ${req.params.id}`, 404));
        }
        
        if (!req.body.images || !Array.isArray(req.body.images)) {
            return next(new ErrorResponse('Please provide an array of image URLs', 400));
        }

        room.images = [...room.images, ...req.body.images];
        await room.save();

        res.status(200).json({
            success: true,
            data: room
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete room photo
// @route   DELETE /api/rooms/:id/photo
// @access  Private/Admin
exports.deleteRoomPhoto = async (req, res, next) => {
    try {
        const room = await Room.findById(req.params.id);
        if (!room) {
            return next(new ErrorResponse(`Room not found with id of ${req.params.id}`, 404));
        }

        if (!req.body.imageUrl) {
            return next(new ErrorResponse('Please provide the image URL to delete', 400));
        }

        room.images = room.images.filter(img => img !== req.body.imageUrl);
        await room.save();

        res.status(200).json({
            success: true,
            data: room
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get all bookings (Admin only)
// @route   GET /api/rooms/admin/bookings/active
// @access  Private/Admin
exports.getAllActiveBookings = async (req, res, next) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'superadmin' && req.user.role !== 'admin') {
            return next(new AppError('Not authorized to access this route', 403));
        }

        const bookings = await RoomBooking.find()
            .populate('userId', 'name email phone')
            .populate('roomId', 'name capacity')
            .sort('-startTime');

        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get booking statistics (Admin only)
// @route   GET /api/rooms/admin/bookings/statistics
// @access  Private/Admin
exports.getBookingStatistics = async (req, res, next) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'superadmin' && req.user.role !== 'admin') {
            return next(new AppError('Not authorized to access this route', 403));
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Get today's bookings
        const todayBookings = await RoomBooking.countDocuments({
            startTime: { $gte: today }
        });

        // Get total rooms
        const totalRooms = await Room.countDocuments();

        // Get occupied rooms
        const occupiedRooms = await Room.countDocuments({
            status: 'occupied'
        });

        // Get available rooms
        const availableRooms = await Room.countDocuments({
            status: 'available'
        });

        // Get monthly statistics
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthlyBookings = await RoomBooking.countDocuments({
            startTime: { $gte: firstDayOfMonth }
        });

        // Calculate total revenue for the month
        const monthlyRevenue = await RoomBooking.aggregate([
            {
                $match: {
                    startTime: { $gte: firstDayOfMonth },
                    status: 'completed'
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$amount' }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                todayBookings,
                totalRooms,
                occupiedRooms,
                availableRooms,
                monthlyBookings,
                monthlyRevenue: monthlyRevenue[0]?.total || 0
            }
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get bookings for a specific room (Admin only)
// @route   GET /api/rooms/admin/rooms/:id/bookings
// @access  Private/Admin
exports.getRoomBookings = async (req, res, next) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'superadmin' && req.user.role !== 'admin') {
            return next(new AppError('Not authorized to access this route', 403));
        }

        const roomId = req.params.id;

        // Verify room exists
        const room = await Room.findById(roomId);
        if (!room) {
            return next(new AppError('Room not found', 404));
        }

        // Get all bookings for this room
        const bookings = await RoomBooking.find({ roomId })
            .populate('userId', 'name email phone')
            .sort('-startTime');

        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get all bookings with complete data (Admin only)
// @route   GET /api/rooms/admin/bookings
// @access  Private/Admin
exports.getAllBookings = async (req, res, next) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'superadmin' && req.user.role !== 'admin') {
            return next(new AppError('Not authorized to access this route', 403));
        }

        const bookings = await RoomBooking.find()
            .populate('user', 'name email phone')
            .populate('room', 'name capacity amenities')
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings
        });
    } catch (err) {
        next(err);
    }
}; 