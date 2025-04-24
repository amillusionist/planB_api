const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const path = require('path');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const errorHandler = require('./middleware/error');
const { sanitizeUserInput } = require('./middleware/validator');

// Load environment variables
dotenv.config();

// Constants
const {
    PORT = 5000,
    NODE_ENV = 'development',
    MONGODB_URI = 'mongodb://localhost:27017/planb_cafe',
    CLIENT_URL = 'http://localhost:3000'
} = process.env;

const app = express();

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'data:', 'https:'],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"]
        }
    }
}));

// Prevent XSS attacks
app.use(xss());

// Prevent parameter pollution
app.use(hpp());

// Sanitize data
app.use(mongoSanitize());

// CORS configuration
app.use(cors({
    origin: CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes'
});

// Apply rate limiting to all routes
app.use(limiter);

// Special rate limiting for sensitive routes
const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // limit each IP to 5 requests per hour
    message: 'Too many login attempts, please try again after an hour'
});

// Apply auth rate limiting to auth routes
app.use('/api/auth', authLimiter);

// Body parser middleware
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Compression middleware
app.use(compression());

// Input sanitization
app.use(sanitizeUserInput);

// Dev logging middleware
if (NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Database connection with improved options
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10
})
.then(() => console.log('MongoDB Connected'))
.catch(err => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
});

// Mount routes
app.use('/api', require('./routes'));

// Error handling middleware
app.use(errorHandler);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.log('Unhandled Rejection! Shutting down...');
    console.log(err.name, err.message);
    process.exit(1);
});

// Start server
const server = app.listen(PORT, () => {
    console.log(`Server running in ${NODE_ENV} mode on port ${PORT}`);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.log('Uncaught Exception! Shutting down...');
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
}); 