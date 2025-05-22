const express = require('express');
const {
    getMenuItems,
    getMenuItem,
    getMenuItemBySlug,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem
} = require('../controllers/menu');
const translateResponse = require('../middleware/translation');
const Menu = require('../models/Menu');
const { getTranslation } = require('../services/translationService');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// Apply translation middleware
router.use(translateResponse);

// Public routes
router.get('/', getMenuItems);
router.get('/slug/:slug', getMenuItemBySlug);
router.get('/:id', getMenuItem);

// Admin routes
router.post('/', protect, authorize('admin', 'superadmin'), createMenuItem);
router.put('/:id', protect, authorize('admin', 'superadmin'), updateMenuItem);
router.delete('/:id', protect, authorize('admin', 'superadmin'), deleteMenuItem);

// Test translation endpoint
router.get('/test-translation', async (req, res) => {
    try {
        const targetLanguage = req.headers['accept-language'] || 'en';
        console.log('Testing translation with language:', targetLanguage);
        
        const testText = 'Hello, this is a test message';
        const translatedText = await getTranslation(testText, targetLanguage);
        
        res.json({
            success: true,
            original: testText,
            translated: translatedText,
            language: targetLanguage
        });
    } catch (error) {
        console.error('Translation test error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router; 