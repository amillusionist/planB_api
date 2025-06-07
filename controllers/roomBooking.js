const RoomBooking = require('../models/RoomBooking');
const Room = require('../models/Room');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// @desc    Create a new room booking
// @route   POST /api/room-bookings
// @access  Private
exports.createRoomBooking = catchAsync(async (req, res, next) => {
    console.log('Creating room booking with data:', JSON.stringify(req.body, null, 2));
    console.log('Current Firebase UID:', req.firebaseUser.uid);

    const {
        room,
        bookingDate,
        startTime,
        endTime,
        purpose,
        customerName,
        customerPhone,
        customerEmail,
        amount
    } = req.body;

    // Validate required fields
    if (!room || !bookingDate || !startTime || !endTime || !purpose || !customerName || !customerPhone || !customerEmail || !amount) {
        return next(new AppError('Missing required booking details', 400));
    }

    // Check if room exists
    const roomExists = await Room.findById(room);
    if (!roomExists) {
        return next(new AppError('Room not found', 404));
    }

    // Check if there's an existing booking for the same time slot
    const existingBooking = await RoomBooking.findOne({
        room,
        bookingDate,
        startTime,
        endTime,
        paymentStatus: { $in: ['pending', 'paid'] }
    });

    if (existingBooking) {
        console.log('Existing booking details:', {
            id: existingBooking._id,
            userId: existingBooking.user,
            currentUserId: req.firebaseUser.uid,
            paymentStatus: existingBooking.paymentStatus,
            startTime: existingBooking.startTime,
            endTime: existingBooking.endTime
        });

        // If the existing booking is pending payment, update it with new customer details
        if (existingBooking.paymentStatus === 'pending') {
            console.log('Updating existing booking with pending payment');
            existingBooking.customerName = customerName;
            existingBooking.customerPhone = customerPhone;
            existingBooking.customerEmail = customerEmail;
            existingBooking.amount = amount;
            existingBooking.user = req.firebaseUser.uid;
            await existingBooking.save();

            // Create payment info for the frontend
            const paymentInfo = {
                orderId: existingBooking._id.toString(),
                bookingId: existingBooking._id.toString(),
                type: 'study_room',
                amount: amount,
                firstName: customerName.split(' ')[0],
                lastName: customerName.split(' ').slice(1).join(' ') || customerName,
                phone: customerPhone,
                email: customerEmail
            };

            return res.status(200).json({
                status: 'success',
                message: 'Booking updated successfully',
                data: {
                    booking: existingBooking,
                    paymentInfo
                }
            });
        }

        return next(new AppError('This time slot is already booked', 400));
    }

    // Create new booking
    const booking = await RoomBooking.create({
        room,
        bookingDate,
        startTime,
        endTime,
        purpose,
        customerName,
        customerPhone,
        customerEmail,
        amount,
        user: req.firebaseUser.uid,
        status: 'pending',
        paymentStatus: 'pending',
        paymentDetails: {
            status: 'pending',
            amount: amount,
            paymentMethod: 'skipcash'
        }
    });

    // Create payment info for the frontend
    const paymentInfo = {
        orderId: booking._id.toString(),
        bookingId: booking._id.toString(),
        type: 'study_room',
        amount: amount,
        firstName: customerName.split(' ')[0],
        lastName: customerName.split(' ').slice(1).join(' ') || customerName,
        phone: customerPhone,
        email: customerEmail
    };

    res.status(201).json({
        status: 'success',
        message: 'Booking created successfully',
        data: {
            booking,
            paymentInfo
        }
    });
});

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
        console.log('Getting room booking with ID:', req.params.id);
        console.log('Current user:', {
            firebaseUid: req.firebaseUser.uid,
            role: req.user.role
        });

        const booking = await RoomBooking.findOne({ _id: req.params.id });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        console.log('Found booking:', {
            id: booking._id,
            userId: booking.user,
            status: booking.status
        });

        // Make sure user is booking owner or admin
        if (booking.user !== req.firebaseUser.uid && req.user.role !== 'admin' && req.user.role !== 'superadmin') {
            console.log('Authorization failed:', {
                bookingUserId: booking.user,
                currentUserId: req.firebaseUser.uid,
                userRole: req.user.role
            });
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
        console.error('Error in getRoomBooking:', err);
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
        console.log('Getting bookings for user:', req.firebaseUser.uid);
        
        const bookings = await RoomBooking.find({ user: req.firebaseUser.uid })
            .populate({
                path: 'room',
                select: 'name capacity facilities'
            })
            .sort({ bookingDate: -1 });

        console.log(`Found ${bookings.length} bookings for user`);

        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings
        });
    } catch (err) {
        console.error('Error in getMyRoomBookings:', err);
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
        console.log('Attempting to delete booking:', req.params.id);
        console.log('Current user:', {
            firebaseUid: req.firebaseUser.uid,
            role: req.user.role
        });

        const booking = await RoomBooking.findOne({ _id: req.params.id });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        console.log('Found booking:', {
            id: booking._id,
            userId: booking.user,
            status: booking.status
        });

        // Make sure user is booking owner or admin
        if (booking.user !== req.firebaseUser.uid && req.user.role !== 'admin' && req.user.role !== 'superadmin') {
            console.log('Authorization failed:', {
                bookingUserId: booking.user,
                currentUserId: req.firebaseUser.uid,
                userRole: req.user.role
            });
            return res.status(401).json({
                success: false,
                message: 'Not authorized to delete this booking'
            });
        }

        await booking.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        console.error('Error in deleteRoomBooking:', err);
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
}; 