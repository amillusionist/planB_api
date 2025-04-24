const RoomBooking = require('../models/RoomBooking');
const Room = require('../models/Room');

// @desc    Create new room booking
// @route   POST /api/room-bookings
// @access  Private
exports.createRoomBooking = async (req, res) => {
    try {
        // Add user to req.body
        req.body.user = req.user.id;

        // Check if room exists and is available
        const room = await Room.findById(req.body.room);
        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room not found'
            });
        }

        if (!room.isAvailable) {
            return res.status(400).json({
                success: false,
                message: 'Room is not available for booking'
            });
        }

        // Check for existing bookings at the same time
        const existingBooking = await RoomBooking.findOne({
            room: req.body.room,
            bookingDate: req.body.bookingDate,
            $or: [
                {
                    startTime: { $lt: req.body.endTime },
                    endTime: { $gt: req.body.startTime }
                }
            ]
        });

        if (existingBooking) {
            return res.status(400).json({
                success: false,
                message: 'Room is already booked for this time slot'
            });
        }

        const booking = await RoomBooking.create(req.body);

        res.status(201).json({
            success: true,
            data: booking
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Get all room bookings
// @route   GET /api/room-bookings
// @access  Private (Admin only)
exports.getRoomBookings = async (req, res) => {
    try {
        const bookings = await RoomBooking.find()
            .populate({
                path: 'user',
                select: 'name email'
            })
            .populate({
                path: 'room',
                select: 'name capacity facilities'
            })
            .sort({ bookingDate: -1 });

        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Get single room booking
// @route   GET /api/room-bookings/:id
// @access  Private
exports.getRoomBooking = async (req, res) => {
    try {
        const booking = await RoomBooking.findById(req.params.id)
            .populate({
                path: 'user',
                select: 'name email'
            })
            .populate({
                path: 'room',
                select: 'name capacity facilities'
            });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Make sure user is booking owner or admin
        if (booking.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this booking'
            });
        }

        res.status(200).json({
            success: true,
            data: booking
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Get user's room bookings
// @route   GET /api/room-bookings/my-bookings
// @access  Private
exports.getMyRoomBookings = async (req, res) => {
    try {
        const bookings = await RoomBooking.find({ user: req.user.id })
            .populate({
                path: 'room',
                select: 'name capacity facilities'
            })
            .sort({ bookingDate: -1 });

        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Update room booking status
// @route   PUT /api/room-bookings/:id/status
// @access  Private (Admin only)
exports.updateRoomBookingStatus = async (req, res) => {
    try {
        const booking = await RoomBooking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        booking.status = req.body.status;
        await booking.save();

        res.status(200).json({
            success: true,
            data: booking
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Delete room booking
// @route   DELETE /api/room-bookings/:id
// @access  Private
exports.deleteRoomBooking = async (req, res) => {
    try {
        const booking = await RoomBooking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Make sure user is booking owner or admin
        if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to delete this booking'
            });
        }

        await booking.remove();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
}; 