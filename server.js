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
const { errorHandler } = require('./utils/errorResponse');
const { sanitizeUserInput } = require('./middleware/validator');
const { protect } = require('./middleware/auth');
const connectDB = require('./config/db');
const routes = require('./config/routes');
const { verifyFirebaseToken } = require('./middleware/firebaseAuth');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const { initializeSocket } = require('./services/socketService');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Constants
const {
    NODE_ENV = 'development',
    MONGODB_URI = 'mongodb://localhost:27017/planb_cafe',
    CLIENT_URL = 'http://localhost:3000'
} = process.env;

const PORT = process.env.PORT || 5000;
const app = express();
const server = require('http').createServer(app);

// Trust proxy
app.set('trust proxy', 1);

// Initialize Socket.IO
const io = initializeSocket(server);

// Security middleware
app.use(helmet());
app.use(cors({
    origin: NODE_ENV === 'development' 
        ? true  // Allow all origins in development
        : [CLIENT_URL, 'http://localhost:5173', 'https://walrus-app-at4vl.ondigitalocean.app'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());

// Rate limiting
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// Compression
app.use(compression());

// Sanitize user input
app.use(sanitizeUserInput);

// Logging
if (NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/room-bookings', require('./routes/roomBooking'));
app.use('/api/rooms', require('./routes/rooms'));
app.use('/api/menu', require('./routes/menu'));
app.use('/api/categorey', require('./routes/categorey'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/payment', require('./routes/payment'));

// Error handling
app.use(errorHandler);

// Start server
server.listen(PORT, () => {
    console.log(`Server running in ${NODE_ENV} mode on port ${PORT}`);
}); 