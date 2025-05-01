const admin = require('firebase-admin');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    try {
        console.log('Initializing Firebase Admin...');
        
        // Use the actual Firebase project ID
        admin.initializeApp({
            projectId: 'planbcafeqa-f3e47',
            credential: admin.credential.applicationDefault()
        });
        
        console.log('Firebase Admin initialized successfully');
    } catch (error) {
        console.error('Firebase Admin initialization error:', error);
        console.error('Error stack:', error.stack);
        // Don't throw the error in development mode
        if (process.env.NODE_ENV !== 'development') {
            throw error;
        }
        console.log('Continuing in development mode despite initialization error');
    }
}

module.exports = admin; 