const express = require('express');
const {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    getMe,
    updateMe,
    deleteMe,
    updatePassword
} = require('../controllers/users');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// User routes
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);
router.delete('/me', protect, deleteMe);
router.put('/updatepassword', protect, updatePassword);

// Admin routes
router.get('/', protect, authorize('admin'), getUsers);
router.get('/:id', protect, authorize('admin'), getUser);
router.post('/', protect, authorize('admin'), createUser);
router.put('/:id', protect, authorize('admin'), updateUser);
router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router; 