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

const { verifyFirebaseToken } = require('../middleware/firebaseAuth');
const { authorize } = require('../middleware/auth');

// User routes
router.post('/', verifyFirebaseToken, createRoomBooking);
router.get('/my-bookings', verifyFirebaseToken, getMyRoomBookings);
router.get('/:id', verifyFirebaseToken, getRoomBooking);
router.delete('/:id', verifyFirebaseToken, deleteRoomBooking);

// Admin routes
router.get('/', verifyFirebaseToken, authorize('admin'), getRoomBookings);
router.put('/:id/status', verifyFirebaseToken, authorize('admin'), updateRoomBookingStatus);

module.exports = router; 