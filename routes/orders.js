const express = require('express');
const {
    getOrders,
    getOrder,
    createOrder,
    updateOrderStatus
} = require('../controllers/order');
const { orderRules, validate } = require('../middleware/validator');

const router = express.Router();

const { verifyFirebaseToken } = require('../middleware/firebaseAuth');

// User routes
router.post('/', verifyFirebaseToken, orderRules.create, validate, createOrder);
router.get('/', verifyFirebaseToken, getOrders);
router.get('/:id', verifyFirebaseToken, getOrder);
router.put('/:id/status', verifyFirebaseToken, updateOrderStatus);

module.exports = router; 