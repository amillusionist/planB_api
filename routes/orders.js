const express = require('express');
const {
    getOrders,
    getOrder,
    createOrder,
    updateOrderStatus
} = require('../controllers/order');

const router = express.Router();

const { verifyFirebaseToken } = require('../middleware/firebaseAuth');

// User routes
router.post('/', verifyFirebaseToken, createOrder);
router.get('/', verifyFirebaseToken, getOrders);
router.get('/:id', verifyFirebaseToken, getOrder);
router.put('/:id/status', verifyFirebaseToken, updateOrderStatus);

module.exports = router; 