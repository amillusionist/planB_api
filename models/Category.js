const mongoose = require('mongoose');
const slugify = require('slugify'); // We'll use this for slug generation

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Category name is required'],
        trim: true,
        unique: true,
        maxlength: [100, 'Category name cannot be more than 100 characters']
    },
    nameAr: {
        type: String,
        trim: true,
        maxlength: [100, 'Arabic category name cannot be more than 100 characters']
    },
    slug: {
        type: String,
        unique: true
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot be more than 500 characters']
    },
    descriptionAr: {
        type: String,
        trim: true,
        maxlength: [500, 'Arabic description cannot be more than 500 characters']
    },
    image: {
        type: String,
        required: [true, 'Please add an image URL']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Pre-save middleware to create slug from name
categorySchema.pre('save', function(next) {
    if (this.isModified('name')) {
        this.slug = slugify(this.name, { 
            lower: true,      // convert to lowercase
            strict: true      // remove special characters
        });
    }
    next();
});

// Also handle slug generation on update
categorySchema.pre('findOneAndUpdate', function(next) {
    if (this._update.name) {
        this._update.slug = slugify(this._update.name, {
            lower: true,
            strict: true
        });
    }
    next();
});

// Add indexes for better query performance
categorySchema.index({ name: 1 });
categorySchema.index({ nameAr: 1 });
categorySchema.index({ slug: 1 });
categorySchema.index({ isActive: 1 });

const Category = mongoose.model('Category', categorySchema);

module.exports = Category; 