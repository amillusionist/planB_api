const { protect } = require('../middleware/auth');
const permissions = require('./permissions');

const routes = {
    // Auth routes
    auth: [
        {
            path: '/register',
            method: 'post',
            handler: 'register',
            middleware: []
        },
        {
            path: '/login',
            method: 'post',
            handler: 'login',
            middleware: []
        },
        {
            path: '/me',
            method: 'get',
            handler: 'getMe',
            middleware: [protect]
        },
        {
            path: '/logout',
            method: 'get',
            handler: 'logout',
            middleware: [protect]
        }
    ],

    // User routes
    users: [
        {
            path: '/',
            method: 'get',
            handler: 'getUsers',
            middleware: [protect]
        },
        {
            path: '/:id',
            method: 'get',
            handler: 'getUser',
            middleware: [protect]
        },
        {
            path: '/:id',
            method: 'put',
            handler: 'updateUser',
            middleware: [protect]
        },
        {
            path: '/:id',
            method: 'delete',
            handler: 'deleteUser',
            middleware: [protect]
        }
    ],

    // Menu routes
    menu: [
        {
            path: '/',
            method: 'get',
            handler: 'getMenuItems',
            middleware: []
        },
        {
            path: '/',
            method: 'post',
            handler: 'createMenuItem',
            middleware: [protect]
        },
        {
            path: '/:id',
            method: 'put',
            handler: 'updateMenuItem',
            middleware: [protect]
        },
        {
            path: '/:id',
            method: 'delete',
            handler: 'deleteMenuItem',
            middleware: [protect]
        }
    ],

    // Order routes
    orders: [
        {
            path: '/',
            method: 'get',
            handler: 'getOrders',
            middleware: [protect]
        },
        {
            path: '/',
            method: 'post',
            handler: 'createOrder',
            middleware: [protect]
        },
        {
            path: '/:id',
            method: 'get',
            handler: 'getOrder',
            middleware: [protect]
        }
    ],

    // Room routes
    rooms: [
        {
            path: '/',
            method: 'get',
            handler: 'getRooms',
            middleware: []
        },
        {
            path: '/',
            method: 'post',
            handler: 'createRoom',
            middleware: [protect]
        },
        {
            path: '/:id',
            method: 'put',
            handler: 'updateRoom',
            middleware: [protect]
        },
        {
            path: '/:id',
            method: 'delete',
            handler: 'deleteRoom',
            middleware: [protect]
        }
    ],

    // Room Booking routes
    bookings: [
        {
            path: '/',
            method: 'get',
            handler: 'getBookings',
            middleware: [protect]
        },
        {
            path: '/',
            method: 'post',
            handler: 'createBooking',
            middleware: [protect]
        },
        {
            path: '/:id',
            method: 'put',
            handler: 'updateBooking',
            middleware: [protect]
        },
        {
            path: '/:id',
            method: 'delete',
            handler: 'deleteBooking',
            middleware: [protect]
        }
    ],

    // Feedback routes
    feedback: [
        {
            path: '/',
            method: 'get',
            handler: 'getFeedbacks',
            middleware: []
        },
        {
            path: '/',
            method: 'post',
            handler: 'createFeedback',
            middleware: [protect]
        }
    ],

    // Admin routes
    admin: [
        {
            path: '/dashboard',
            method: 'get',
            handler: 'getDashboardStats',
            middleware: [protect]
        },
        {
            path: '/recent-orders',
            method: 'get',
            handler: 'getRecentOrders',
            middleware: [protect]
        },
        {
            path: '/recent-bookings',
            method: 'get',
            handler: 'getRecentBookings',
            middleware: [protect]
        },
        {
            path: '/recent-feedbacks',
            method: 'get',
            handler: 'getRecentFeedbacks',
            middleware: [protect]
        },
        {
            path: '/revenue',
            method: 'get',
            handler: 'getRevenue',
            middleware: [protect]
        },
        {
            path: '/popular-items',
            method: 'get',
            handler: 'getPopularItems',
            middleware: [protect]
        },
        {
            path: '/busy-slots',
            method: 'get',
            handler: 'getBusySlots',
            middleware: [protect]
        },
        {
            path: '/settings',
            method: 'get',
            handler: 'getSettings',
            middleware: [protect]
        }
    ]
};

module.exports = routes; 