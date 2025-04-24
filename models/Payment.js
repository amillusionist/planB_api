const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
    order: {
        type: mongoose.Schema.ObjectId,
        ref: 'Order',
        required: true
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'card', 'online'],
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    transactionId: {
        type: String,
        required: function() {
            return this.paymentMethod !== 'cash';
        }
    },
    paymentDetails: {
        cardNumber: String,
        cardHolder: String,
        expiryDate: String,
        cvv: String
    },
    refundAmount: {
        type: Number,
        default: 0
    },
    refundReason: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hide sensitive payment details when converting to JSON
PaymentSchema.methods.toJSON = function() {
    const obj = this.toObject();
    if (obj.paymentDetails) {
        delete obj.paymentDetails.cvv;
        if (obj.paymentDetails.cardNumber) {
            obj.paymentDetails.cardNumber = obj.paymentDetails.cardNumber.replace(/\d(?=\d{4})/g, "*");
        }
    }
    return obj;
};

module.exports = mongoose.model('Payment', PaymentSchema); 