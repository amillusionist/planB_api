const mongoose = require('mongoose');

const TranslationSchema = new mongoose.Schema({
    originalText: {
        type: String,
        required: true,
        index: true
    },
    targetLanguage: {
        type: String,
        required: true,
        index: true
    },
    translatedText: {
        type: String,
        required: true
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

// Compound index for faster lookups
TranslationSchema.index({ originalText: 1, targetLanguage: 1 });

module.exports = mongoose.model('Translation', TranslationSchema); 