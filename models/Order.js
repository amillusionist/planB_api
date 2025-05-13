const mongoose = require('mongoose');

const AddressSchema = new mongoose.Schema({
    line1: {
        type: String,
        required: true
    },
    line2: String,
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    postalCode: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    }
});

const PaymentDetailsSchema = new mongoose.Schema({
    paymentMethod: {
        type: String,
        enum: ['online', 'cash'],
        required: true
    },
    transactionId: String,
    amountPaid: {
        type: Number,
        required: true
    },
    paymentDate: Date,
    skipCashPaymentId: String,
    status: {
        type: String,
        enum: ['new', 'pending', 'paid', 'failed', 'refunded'],
        default: 'new'
    },
    payUrl: String
});

const OrderItemSchema = new mongoose.Schema({
    foodSlug: {
        type: String,
        required: true
    },
    foodName: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    foodPrice: {
        type: Number,
        required: true
    },
    totalPrice: {
        type: Number,
        required: true
    }
});

const OrderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true,
        unique: true
    },
    orderType: {
        type: String,
        enum: ['dine_in', 'takeaway', 'delivery', 'dinein'],
        required: true
    },
    tableNumber: {
        type: String,
        required: function() {
            return this.orderType === 'dine_in' || this.orderType === 'dinein';
        }
    },
    user: {
        userId: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: true
        },
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        },
        address: AddressSchema
    },
    orderStatus: {
        type: String,
        enum: ['pending', 'confirmed', 'cooking', 'completed', 'cancelled'],
        default: 'pending'
    },
    cookingStatus: {
        type: String,
        enum: ['not_started', 'in_progress', 'completed'],
        default: 'not_started'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'Paid', 'failed', 'refunded'],
        default: 'pending'
    },
    paymentDetails: PaymentDetailsSchema,
    orderTotal: {
        type: Number,
        required: true
    },
    items: [OrderItemSchema],
    tax: {
        type: Number,
        default: 0
    },
    shipping: {
        type: Number,
        default: 0
    },
    discount: {
        type: Number,
        default: 0
    },
    notes: String
}, {
    timestamps: true // This will automatically add createdAt and updatedAt fields
});

// Generate orderId before saving
OrderSchema.pre('save', function(next) {
    if (!this.orderId) {
        this.orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }
    next();
});

module.exports = mongoose.model('Order', OrderSchema); 