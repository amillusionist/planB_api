const Translation = require('../models/Translation');
const { translateText } = require('./googleTranslation');

// In-memory cache with TTL
const memoryCache = new Map();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

// Function to detect if text is already in the target language
const isAlreadyInTargetLanguage = (text, targetLanguage) => {
    if (!text || typeof text !== 'string') return false;
    return targetLanguage === 'ar' ? /[\u0600-\u06FF]/.test(text) : false;
};

// Function to clean up duplicate translations
const cleanupDuplicates = async () => {
    try {
        const duplicates = await Translation.aggregate([
            {
                $group: {
                    _id: { originalText: "$originalText", targetLanguage: "$targetLanguage" },
                    count: { $sum: 1 },
                    docs: { $push: "$_id" }
                }
            },
            {
                $match: {
                    count: { $gt: 1 }
                }
            }
        ]);

        for (const duplicate of duplicates) {
            const [keep, ...remove] = duplicate.docs;
            await Translation.deleteMany({ _id: { $in: remove } });
        }
    } catch (error) {
        console.error('Error during duplicate cleanup:', error);
    }
};

// Function to get translation with caching
const getTranslation = async (originalText, targetLanguage) => {
    try {
        if (!originalText || !targetLanguage) return originalText;

        // Check if text is already in target language
        if (isAlreadyInTargetLanguage(originalText, targetLanguage)) {
            return originalText;
        }

        // Check memory cache first
        const cacheKey = `${originalText}:${targetLanguage}`;
        const cachedData = memoryCache.get(cacheKey);
        
        if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
            return cachedData.translation;
        }

        // Check database cache
        const cachedTranslation = await Translation.findOne({
            originalText,
            targetLanguage
        });

        if (cachedTranslation) {
            memoryCache.set(cacheKey, {
                translation: cachedTranslation.translatedText,
                timestamp: Date.now()
            });
            return cachedTranslation.translatedText;
        }

        // Get from Google Translate
        const translatedText = await translateText(originalText, targetLanguage);
        if (!translatedText) return originalText;

        // Save to database and memory cache
        try {
            const existingTranslation = await Translation.findOne({
                originalText,
                targetLanguage,
                translatedText
            });

            if (!existingTranslation) {
                await Translation.create({
                    originalText,
                    translatedText,
                    targetLanguage
                });
            }

            memoryCache.set(cacheKey, {
                translation: translatedText,
                timestamp: Date.now()
            });
        } catch (dbError) {
            console.error('Error saving translation:', dbError);
        }

        return translatedText;
    } catch (error) {
        console.error('Translation error:', error);
        return originalText;
    }
};

// Load translations into memory cache on startup
const initializeCache = async () => {
    try {
        await cleanupDuplicates();
        const translations = await Translation.find({});
        translations.forEach(translation => {
            const cacheKey = `${translation.originalText}:${translation.targetLanguage}`;
            memoryCache.set(cacheKey, {
                translation: translation.translatedText,
                timestamp: Date.now()
            });
        });
    } catch (error) {
        console.error('Error initializing cache:', error);
    }
};

// Initialize cache
initializeCache();

// Clean up expired cache entries periodically
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of memoryCache.entries()) {
        if (now - value.timestamp > CACHE_TTL) {
            memoryCache.delete(key);
        }
    }
}, 60 * 60 * 1000); // Check every hour

module.exports = {
    getTranslation
}; 