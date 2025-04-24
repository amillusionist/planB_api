const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide your name']
    },
    email: {
        type: String,
        required: [true, 'Please provide your email']
    },
    rating: {
        type: Number,
        required: [true, 'Please provide a rating'],
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: [true, 'Please provide your feedback']
    },
    foodQuality: {
        type: Number,
        min: 1,
        max: 5
    },
    service: {
        type: Number,
        min: 1,
        max: 5
    },
    ambiance: {
        type: Number,
        min: 1,
        max: 5
    },
    isPublic: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Feedback', feedbackSchema); 