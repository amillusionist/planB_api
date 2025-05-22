const { getTranslation } = require('../services/translationService');

// Cache for translated responses with TTL
const responseCache = new Map();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

// Helper function to detect Arabic text
const isArabicText = (text) => {
    if (typeof text !== 'string') return false;
    return /[\u0600-\u06FF]/.test(text);
};

// Helper function to clean Mongoose document
const cleanMongooseDoc = (doc) => {
    if (!doc) return doc;
    if (doc._doc) doc = doc._doc;
    
    const cleanDoc = { ...doc };
    delete cleanDoc.$__;
    delete cleanDoc.$isNew;
    delete cleanDoc.__v;
    
    return cleanDoc;
};

// Helper function to translate item
const translateItem = async (item, targetLanguage) => {
    if (!item || typeof item !== 'object') return item;

    const translatedItem = { ...item };

    try {
        if (typeof item.name === 'string' && !isArabicText(item.name)) {
            translatedItem.name = await getTranslation(item.name, targetLanguage);
        }
        if (typeof item.description === 'string' && !isArabicText(item.description)) {
            translatedItem.description = await getTranslation(item.description, targetLanguage);
        }
        if (Array.isArray(item.ingredients)) {
            translatedItem.ingredients = await Promise.all(
                item.ingredients.map(async (ingredient) => {
                    if (typeof ingredient !== 'string' || isArabicText(ingredient)) {
                        return ingredient;
                    }
                    return await getTranslation(ingredient, targetLanguage);
                })
            );
        }
    } catch (error) {
        console.error('Error translating item:', error);
        return item;
    }

    return translatedItem;
};

const translateResponse = async (req, res, next) => {
    const targetLanguage = req.headers['accept-language'] || 'en';
    if (targetLanguage === 'en') return next();

    // Store original methods
    const originalSend = res.send;
    const originalJson = res.json;

    // Override json method
    res.json = async function(data) {
        try {
            if (!data?.success || !data?.data) {
                return originalJson.call(this, data);
            }

            // Clean Mongoose documents
            if (Array.isArray(data.data)) {
                data.data = data.data.map(cleanMongooseDoc);
            } else if (typeof data.data === 'object') {
                data.data = cleanMongooseDoc(data.data);
            }

            // Generate cache key
            const cacheKey = `${JSON.stringify(data.data)}:${targetLanguage}`;
            
            // Check cache first
            const cachedData = responseCache.get(cacheKey);
            if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
                data.data = cachedData.translation;
                return originalJson.call(this, data);
            }

            // Handle array of items
            if (Array.isArray(data.data)) {
                const translatedItems = await Promise.all(
                    data.data.map(item => translateItem(item, targetLanguage))
                );

                responseCache.set(cacheKey, {
                    translation: translatedItems,
                    timestamp: Date.now()
                });
                data.data = translatedItems;
            }
            // Handle single item
            else if (typeof data.data === 'object') {
                const translatedItem = await translateItem(data.data, targetLanguage);

                responseCache.set(cacheKey, {
                    translation: translatedItem,
                    timestamp: Date.now()
                });
                data.data = translatedItem;
            }

            // Clear old cache entries
            if (responseCache.size > 1000) {
                const now = Date.now();
                for (const [key, value] of responseCache.entries()) {
                    if (now - value.timestamp > CACHE_TTL) {
                        responseCache.delete(key);
                    }
                }
            }

            return originalJson.call(this, data);
        } catch (error) {
            console.error('Translation error:', error);
            return originalJson.call(this, data);
        }
    };

    // Override send method to use json
    res.send = function(data) {
        if (typeof data === 'object') {
            return res.json(data);
        }
        return originalSend.call(this, data);
    };

    next();
};

// Clean up expired cache entries periodically
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of responseCache.entries()) {
        if (now - value.timestamp > CACHE_TTL) {
            responseCache.delete(key);
        }
    }
}, 60 * 60 * 1000); // Check every hour

module.exports = translateResponse; 