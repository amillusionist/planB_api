const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const categoreyController = require('../controllers/categorey');

// Public routes (no authentication required)
router.get('/', categoreyController.getAllCategories);
router.get('/:id', categoreyController.getCategory);

// Protected routes (only superadmin)
router.use(protect); // Protect all routes after this middleware

// Only superadmin can access these routes
router.post('/', categoreyController.createCategory);
router.patch('/:id', categoreyController.updateCategory);
router.delete('/:id', categoreyController.deleteCategory);

module.exports = router;