const express = require('express');
const {
    getOrders,
    getOrder,
    createOrder,
    updateOrder,
    deleteOrder,
    getMyOrders,
    updateOrderStatus,
    updateDeliveryStatus
} = require('../controllers/orders');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// User routes
router.post('/', protect, createOrder);
router.get('/my-orders', protect, getMyOrders);
router.get('/my-orders/:id', protect, getOrder);

// Admin routes
router.get('/', protect, authorize('admin'), getOrders);
router.put('/:id/status', protect, authorize('admin'), updateOrderStatus);
router.put('/:id/delivery', protect, authorize('admin'), updateDeliveryStatus);
router.delete('/:id', protect, authorize('admin'), deleteOrder);

module.exports = router; 