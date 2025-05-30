const express = require('express');
const router = express.Router();
const { protectWithBoth } = require('../middleware/auth');
const {
    getProfile,
    updateProfile,
    addAddress,
    updateAddress,
    deleteAddress,
    addPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    getAllCustomers,
    getCustomerById,
    getCustomerStatistics
} = require('../controllers/user');

// Customer management routes (Admin only)
router.get('/customers', protectWithBoth, getAllCustomers);
router.get('/customers/:id', protectWithBoth, getCustomerById);
router.get('/customers/:id/statistics', protectWithBoth, getCustomerStatistics);

// User profile routes
router.get('/profile', protectWithBoth, getProfile);
router.put('/profile', protectWithBoth, updateProfile);

// Address management routes
router.post('/addresses', protectWithBoth, addAddress);
router.put('/addresses/:id', protectWithBoth, updateAddress);
router.delete('/addresses/:id', protectWithBoth, deleteAddress);

// Payment method management routes
router.post('/payment-methods', protectWithBoth, addPaymentMethod);
router.put('/payment-methods/:id', protectWithBoth, updatePaymentMethod);
router.delete('/payment-methods/:id', protectWithBoth, deletePaymentMethod);

module.exports = router; 