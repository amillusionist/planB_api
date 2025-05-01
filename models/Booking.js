const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    room: {
        type: mongoose.Schema.ObjectId,
        ref: 'Room',
        required: true
    },
    date: {
        type: Date,
        required: [true, 'Please add a booking date']
    },
    timeSlot: {
        type: String,
        required: [true, 'Please add a time slot']
    },
    duration: {
        type: Number,
        required: [true, 'Please add booking duration in minutes'],
        min: [30, 'Minimum booking duration is 30 minutes']
    },
    numberOfGuests: {
        type: Number,
        required: [true, 'Please add number of guests'],
        min: [1, 'Number of guests must be at least 1']
    },
    specialRequests: {
        type: String,
        maxlength: [500, 'Special requests cannot be more than 500 characters']
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'completed'],
        default: 'pending'
    },
    totalAmount: {
        type: Number,
        required: [true, 'Please add total amount']
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'refunded'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Booking', BookingSchema); 