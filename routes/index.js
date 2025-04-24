const express = require('express');
const router = express.Router();

// Import all route files
const authRoutes = require('./auth');
const userRoutes = require('./users');
const menuRoutes = require('./menu');
const orderRoutes = require('./orders');
const roomRoutes = require('./rooms');
const roomBookingRoutes = require('./roomBooking');
const feedbackRoutes = require('./feedback');
const adminRoutes = require('./admin');

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/menu', menuRoutes);
router.use('/orders', orderRoutes);
router.use('/rooms', roomRoutes);
router.use('/room-bookings', roomBookingRoutes);
router.use('/feedback', feedbackRoutes);
router.use('/admin', adminRoutes);

module.exports = router; 