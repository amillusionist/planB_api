const socketIO = require('socket.io');

let io;

const initializeSocket = (server) => {
    io = socketIO(server, {
        cors: {
            origin: ['https://walrus-app-at4vl.ondigitalocean.app', 'http://localhost:3000', 'http://localhost:5173'],
            methods: ['GET', 'POST'],
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        console.log('New client connected');

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