const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    items: [{
        menuItem: {
            type: mongoose.Schema.ObjectId,
            ref: 'Menu',
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        price: {
            type: Number,
            required: true
        }
    }],
    totalAmount: {
        type: Number,
        required: true
    },
    orderType: {
        type: String,
        enum: ['dine-in', 'delivery', 'takeaway'],
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'],
        default: 'pending'
    },
    deliveryAddress: {
        type: String,
        required: function() {
            return this.orderType === 'delivery';
        }
    },
    tableNumber: {
        type: Number,
        required: function() {
            return this.orderType === 'dine-in';
        }
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'card', 'online'],
        required: true
    },
    specialInstructions: {
        type: String
    },
    estimatedDeliveryTime: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Order', OrderSchema); 