const express = require('express');
const {
    getMenuItems,
    getMenuItem,
    getMenuItemBySlug,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem
} = require('../controllers/menu');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getMenuItems);
router.get('/slug/:slug', getMenuItemBySlug);
router.get('/:id', getMenuItem);

// Admin routes
router.post('/', protect, authorize('admin', 'superadmin'), createMenuItem);
router.put('/:id', protect, authorize('admin', 'superadmin'), updateMenuItem);
router.delete('/:id', protect, authorize('admin', 'superadmin'), deleteMenuItem);

module.exports = router; 