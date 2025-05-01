const express = require('express');
const {
    initiatePayment,
    verifyPayment,
    handleWebhook
} = require('../controllers/payment');

const router = express.Router();

// Remove protect middleware for testing
router.post('/create', initiatePayment);
router.get('/verify/:paymentId', verifyPayment);
router.post('/webhook', handleWebhook);

module.exports = router;