const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getCategories, getCategory, createCategory, updateCategory, deleteCategory, restoreCategory } = require('../controllers/categorey');
const upload = require('../middleware/upload');

// Public routes (no authentication required)
router.get('/', (req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next();
}, getCategories);
router.get('/:id', getCategory);

// Protected routes (only superadmin)
router.use(protect); // Protect all routes after this middleware

// Only superadmin can access these routes
router.post('/', upload.single('image'), createCategory);
router.patch('/:id', upload.single('image'), updateCategory);
router.delete('/:id', deleteCategory);

// Add restore route
router.patch('/:id/restore', restoreCategory);

module.exports = router;