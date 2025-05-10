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
} = require('../controllers/room');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getRooms);
router.get('/available', getAvailableRooms);
router.get('/:id', getRoom);

// Admin routes
router.post('/', protect, authorize('superadmin', 'admin'), createRoom);
router.put('/:id', protect, authorize('superadmin', 'admin'), updateRoom);
router.delete('/:id', protect, authorize('superadmin', 'admin'), deleteRoom);
router.put('/:id/availability', protect, authorize('superadmin', 'admin'), updateRoomAvailability);
router.put('/:id/photo', protect, authorize('superadmin', 'admin'), uploadRoomPhoto);
router.delete('/:id/photo', protect, authorize('superadmin', 'admin'), deleteRoomPhoto);

module.exports = router; 