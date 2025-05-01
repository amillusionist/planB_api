const express = require('express');
const {
    getMenuItems,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem
} = require('../controllers/menu');

const router = express.Router();

const { verifyFirebaseToken } = require('../middleware/firebaseAuth');

// Public routes
router.get('/', getMenuItems);
router.get('/:id', getMenuItems);

// Admin routes
router.post('/', verifyFirebaseToken, createMenuItem);
router.put('/:id', verifyFirebaseToken, updateMenuItem);
router.delete('/:id', verifyFirebaseToken, deleteMenuItem);

module.exports = router; 