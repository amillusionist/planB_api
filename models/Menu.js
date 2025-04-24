const mongoose = require('mongoose');

const MenuSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name for the menu item']
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    price: {
        type: Number,
        required: [true, 'Please add a price']
    },
    category: {
        type: mongoose.Schema.ObjectId,
        ref: 'Category',
        required: true
    },
    image: {
        type: String,
        required: [true, 'Please add an image URL']
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    preparationTime: {
        type: Number,
        required: [true, 'Please add preparation time in minutes']
    },
    ingredients: {
        type: [String],
        required: [true, 'Please add ingredients']
    },
    nutritionalInfo: {
        calories: Number,
        protein: Number,
        carbs: Number,
        fat: Number
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Menu', MenuSchema); 