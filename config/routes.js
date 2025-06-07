const { protect } = require('../middleware/auth');
const { verifyFirebaseToken } = require('../middleware/firebaseAuth');
const permissions = require('./permissions');

const routes = {
    // Auth routes
    auth: [
        {
            path: '/verify',
            method: 'post',
            handler: 'verifyFirebaseToken',
            middleware: []
        },
        {
            path: '/complete-profile',
            method: 'put',
            handler: 'completeProfile',
            middleware: ['verifyFirebaseToken']
        },
        {
            path: '/me',
            method: 'get',
            handler: 'getMe',
            middleware: ['verifyFirebaseToken']
        }
    ],

    // User routes
    users: [
        {
            path: '/profile',
            method: 'get',
            handler: 'getProfile',
            middleware: ['verifyFirebaseToken']
        },
        {
            path: '/profile',
            method: 'put',
            handler: 'updateProfile',
            middleware: ['verifyFirebaseToken']
        },
        {
            path: '/addresses',
            method: 'post',
            handler: 'addAddress',
            middleware: ['verifyFirebaseToken']
        },
        {
            path: '/addresses/:id',
            method: 'put',
            handler: 'updateAddress',
            middleware: ['verifyFirebaseToken']
        },
        {
            path: '/addresses/:id',
            method: 'delete',
            handler: 'deleteAddress',
            middleware: ['verifyFirebaseToken']
        },
        {
            path: '/payment-methods',
            method: 'post',
            handler: 'addPaymentMethod',
            middleware: ['verifyFirebaseToken']
        },
        {
            path: '/payment-methods/:id',
            method: 'put',
            handler: 'updatePaymentMethod',
            middleware: ['verifyFirebaseToken']
        },
        {
            path: '/payment-methods/:id',
            method: 'delete',
            handler: 'deletePaymentMethod',
            middleware: ['verifyFirebaseToken']
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
            path: '/categories',
            method: 'get',
            handler: 'getCategories',
            middleware: []
        },
        {
            path: '/categories/:id',
            method: 'get',
            handler: 'getCategoryItems',
            middleware: []
        },
        {
            path: '/search',
            method: 'get',
            handler: 'searchItems',
            middleware: []
        }
    ],

    // Order routes
    orders: [
        {
            path: '/',
            method: 'get',
            handler: 'getOrders',
            middleware: ['verifyFirebaseToken']
        },
        {
            path: '/',
            method: 'post',
            handler: 'createOrder',
            middleware: ['verifyFirebaseToken']
        },
        {
            path: '/:id',
            method: 'get',
            handler: 'getOrder',
            middleware: ['verifyFirebaseToken']
        },
        {
            path: '/:id/cancel',
            method: 'post',
            handler: 'cancelOrder',
            middleware: ['verifyFirebaseToken']
        },
        {
            path: '/:id/status',
            method: 'get',
            handler: 'getOrderStatus',
            middleware: ['verifyFirebaseToken']
        },
        {
            path: '/:id/payment',
            method: 'post',
            handler: 'processPayment',
            middleware: ['verifyFirebaseToken']
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
    ],

    // Category routes
    categorey: [
        {
            path: '/',
            method: 'get',
            handler: 'getCategories',
            middleware: []
        },
        {
            path: '/:id',
            method: 'get',
            handler: 'getCategory',
            middleware: []
        },
        {
            path: '/',
            method: 'post',
            handler: 'createCategory',
            middleware: [protect]
        },
        {
            path: '/:id',
            method: 'put',
            handler: 'updateCategory',
            middleware: [protect]
        },
        {
            path: '/:id',
            method: 'delete',
            handler: 'deleteCategory',
            middleware: [protect]
        }
    ],

    // Payment routes
    payment: [
        {
            path: '/create',
            method: 'post',
            handler: 'initiatePayment',
            middleware: ['verifyFirebaseToken']
        },
        {
            path: '/verify/:paymentId',
            method: 'get',
            handler: 'verifyPayment',
            middleware: ['verifyFirebaseToken']
        },
        {
            path: '/webhook',
            method: 'post',
            handler: 'handleWebhook',
            middleware: []
        }
    ]
};

module.exports = routes; 