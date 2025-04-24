const express = require('express');
const {
    createRoomBooking,
    getRoomBookings,
    getRoomBooking,
    getMyRoomBookings,
    updateRoomBookingStatus,
    deleteRoomBooking
} = require('../controllers/roomBooking');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// User routes
router.post('/', protect, createRoomBooking);
router.get('/my-bookings', protect, getMyRoomBookings);
router.get('/:id', protect, getRoomBooking);
router.delete('/:id', protect, deleteRoomBooking);

// Admin routes
router.get('/', protect, authorize('admin'), getRoomBookings);
router.put('/:id/status', protect, authorize('admin'), updateRoomBookingStatus);

module.exports = router; 