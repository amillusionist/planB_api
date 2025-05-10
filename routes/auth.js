const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const { verifyFirebaseToken } = require('../middleware/firebaseAuth');

// Email/password auth routes
router.post('/login', authController.login);

// Firebase auth routes
router.post('/verify', verifyFirebaseToken, authController.verifyFirebaseToken);
router.put('/complete-profile', verifyFirebaseToken, authController.completeProfile);
router.get('/me', verifyFirebaseToken, authController.getMe);

// Test route (for development only)
router.post('/test-token', authController.generateTestToken);

module.exports = router; 