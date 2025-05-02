const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
    createCollections();
}).catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});

async function createCollections() {
    try {
        const db = mongoose.connection.db;
        const collections = [
            'bookings',
            'categories',
            'feedbacks',
            'menuitems',
            'menus',
            'orders',
            'roombookings',
            'rooms',
            'users'
        ];

        for (const collection of collections) {
            const exists = await db.listCollections({ name: collection }).hasNext();
            if (!exists) {
                await db.createCollection(collection);
                console.log(`Created collection: ${collection}`);
            } else {
                console.log(`Collection already exists: ${collection}`);
            }
        }

        console.log('All collections checked and created if needed');
        process.exit(0);
    } catch (err) {
        console.error('Error creating collections:', err);
        process.exit(1);
    }
} 