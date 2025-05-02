const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getCategories, getCategory, createCategory, updateCategory, deleteCategory } = require('../controllers/categorey');

// Public routes (no authentication required)
router.get('/', getCategories);
router.get('/:id', getCategory);

// Protected routes (only superadmin)
router.use(protect); // Protect all routes after this middleware

// Only superadmin can access these routes
router.post('/', createCategory);
router.patch('/:id', updateCategory);
router.delete('/:id', deleteCategory);

module.exports = router;