const express = require('express');
const {
    getRooms,
    getRoom,
    createRoom,
    updateRoom,
    deleteRoom,
    getAvailableRooms,
    updateRoomAvailability,
    uploadRoomPhoto,
    deleteRoomPhoto
} = require('../controllers/rooms');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getRooms);
router.get('/available', getAvailableRooms);
router.get('/:id', getRoom);

// Admin routes
router.post('/', protect, authorize('admin'), createRoom);
router.put('/:id', protect, authorize('admin'), updateRoom);
router.delete('/:id', protect, authorize('admin'), deleteRoom);
router.put('/:id/availability', protect, authorize('admin'), updateRoomAvailability);
router.put('/:id/photo', protect, authorize('admin'), uploadRoomPhoto);
router.delete('/:id/photo', protect, authorize('admin'), deleteRoomPhoto);

module.exports = router; 