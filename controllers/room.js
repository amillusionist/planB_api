const Room = require('../models/Room');
const ErrorResponse = require('../utils/errorResponse');

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