const express = require('express');
const {
    getOrders,
    getOrder,
    createOrder,
    updateOrderStatus
} = require('../controllers/order');
const { orderRules, validate } = require('../middleware/validator');
const { protectWithBoth } = require('../middleware/auth');

const router = express.Router();

// All routes now use protectWithBoth middleware
router.post('/', protectWithBoth, orderRules.create, validate, createOrder);
router.get('/', protectWithBoth, getOrders);
router.get('/:id', protectWithBoth, getOrder);
router.put('/:id/status', protectWithBoth, updateOrderStatus);

module.exports = router; 