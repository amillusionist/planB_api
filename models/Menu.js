const mongoose = require('mongoose');
const slugify = require('slugify');

const MenuSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name for the menu item']
    },
    slug: {
        type: String,
        unique: true
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    price: {
        type: Number,
        required: [true, 'Please add a price']
    },
    categories: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Category',
        required: true
    }],
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

// Pre-save middleware to create slug from name
MenuSchema.pre('save', function(next) {
    console.log('Pre-save middleware triggered');
    console.log('Current name:', this.name);
    if (this.name) {
        this.slug = slugify(this.name, { 
            lower: true,      // convert to lowercase
            strict: true      // remove special characters
        });
        console.log('Generated slug:', this.slug);
    }
    next();
});

// Pre-findOneAndUpdate middleware to update slug
MenuSchema.pre('findOneAndUpdate', function(next) {
    if (this._update.name) {
        this._update.slug = slugify(this._update.name, {
            lower: true,
            strict: true
        });
    }
    next();
});

// Add indexes for better query performance
MenuSchema.index({ slug: 1 });
MenuSchema.index({ name: 1 });

module.exports = mongoose.model('Menu', MenuSchema); 