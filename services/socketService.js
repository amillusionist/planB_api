const socketIO = require('socket.io');

let io;

const initializeSocket = (server) => {
    io = socketIO(server, {
        cors: {
            origin: ['https://walrus-app-at4vl.ondigitalocean.app', 'http://localhost:3000'],
            methods: ['GET', 'POST'],
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        console.log('New client connected');

        // Join a room (e.g., for specific restaurant or table)
        socket.on('joinRoom', (roomId) => {
            socket.join(roomId);
            console.log(`Client joined room: ${roomId}`);
        });

        // Leave a room
        socket.on('leaveRoom', (roomId) => {
            socket.leave(roomId);
            console.log(`Client left room: ${roomId}`);
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected');
        });
    });

    return io;
};

// Emit order updates to specific room
const emitOrderUpdate = (roomId, orderData) => {
    if (io) {
        io.to(roomId).emit('orderUpdate', orderData);
    }
};

// Emit new order notification
const emitNewOrder = (roomId, orderData) => {
    if (io) {
        io.to(roomId).emit('newOrder', orderData);
    }
};

// Emit order status change
const emitOrderStatusChange = (roomId, orderData) => {
    if (io) {
        io.to(roomId).emit('orderStatusChange', orderData);
    }
};

module.exports = {
    initializeSocket,
    emitOrderUpdate,
    emitNewOrder,
    emitOrderStatusChange
}; 