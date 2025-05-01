/**
 * Database Configuration File
 * This file handles the MongoDB connection with optimized settings and error handling
 */

const mongoose = require('mongoose');

/**
 * Connect to MongoDB database
 * Uses environment variables for connection string and implements connection pooling
 * Includes error handling and connection monitoring
 */
const connectDB = async () => {
    try {
        console.log('Attempting to connect to MongoDB...');
        console.log('MongoDB URI:', process.env.MONGODB_URI);

        const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/planb_cafe', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            maxPoolSize: 10,
            minPoolSize: 5,
            maxIdleTimeMS: 30000,
            waitQueueTimeoutMS: 10000
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // Monitor connection events
        mongoose.connection.on('connected', () => {
            console.log('Mongoose connected to DB');
        });

        mongoose.connection.on('error', (err) => {
            console.error('Mongoose connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('Mongoose disconnected from DB');
        });

        // Handle process termination
        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log('Mongoose connection closed through app termination');
            process.exit(0);
        });

    } catch (error) {
        console.error('MongoDB Connection Error:', error);
        console.error('Error stack:', error.stack);
        process.exit(1);
    }
};

module.exports = connectDB; 