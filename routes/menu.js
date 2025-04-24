const express = require('express');
const {
    getMenus,
    getMenu,
    createMenu,
    updateMenu,
    deleteMenu,
    uploadMenuPhoto,
    deleteMenuPhoto
} = require('../controllers/menu');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getMenus);
router.get('/:id', getMenu);

// Admin routes
router.post('/', protect, authorize('admin'), createMenu);
router.put('/:id', protect, authorize('admin'), updateMenu);
router.delete('/:id', protect, authorize('admin'), deleteMenu);
router.put('/:id/photo', protect, authorize('admin'), uploadMenuPhoto);
router.delete('/:id/photo', protect, authorize('admin'), deleteMenuPhoto);

module.exports = router; 