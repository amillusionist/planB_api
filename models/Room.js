const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a room name'],
        unique: true,
        trim: true,
        maxlength: [50, 'Name cannot be more than 50 characters']
    },
    description: {
        type: String,
        required: [true, 'Please add a description'],
        maxlength: [500, 'Description cannot be more than 500 characters']
    },
    capacity: {
        type: Number,
        required: [true, 'Please add room capacity'],
        min: [1, 'Capacity must be at least 1']
    },
    price: {
        type: Number,
        required: [true, 'Please add room price'],
        min: [0, 'Price cannot be negative']
    },
    amenities: {
        type: [String],
        required: true
    },
    images: {
        type: [String],
        required: true
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Room', RoomSchema); 