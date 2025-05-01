const mongoose = require('mongoose');

const MenuItemSchema = new mongoose.Schema({
    foodName: {
        type: String,
        required: [true, 'Please add a menu item name'],
        trim: true,
        unique: false
    },
    foodType: {
        type: String,
        required: [true, 'Please specify food type']
    },
    foodCategory: {
        type: String,
        required: [true, 'Please specify food category']
    },
    foodPrice: {
        type: Number,
        required: [true, 'Please add menu item price']
    },
    foodSlug: {
        type: String,
        unique: false
    },
    foodDescription: {
        type: String,
        required: [true, 'Please add a description']
    },
    featureImage: {
        type: String,
        required: [true, 'Please add an image URL']
    },
    isAvailable: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Explicitly disable all indexes
MenuItemSchema.set('autoIndex', false);

const MenuItem = mongoose.model('MenuItem', MenuItemSchema);

module.exports = MenuItem; 