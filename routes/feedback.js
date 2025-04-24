const express = require('express');
const {
    createFeedback,
    getFeedbacks,
    getFeedback,
    updateFeedback,
    deleteFeedback
} = require('../controllers/feedback');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// Public routes
router.post('/', createFeedback);

// Admin only routes
router.get('/', protect, authorize('admin'), getFeedbacks);
router.get('/:id', protect, authorize('admin'), getFeedback);
router.put('/:id', protect, authorize('admin'), updateFeedback);
router.delete('/:id', protect, authorize('admin'), deleteFeedback);

module.exports = router; 