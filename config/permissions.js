module.exports = {
    roles: {
        superadmin: ['superadmin', 'admin', 'user'],
        admin: ['admin', 'user'],
        user: ['user']
    },

    // Define which roles can access which features
    features: {
        auth: {
            register: ['user'],
            login: ['user'],
            getMe: ['superadmin', 'admin', 'user'],
            logout: ['superadmin', 'admin', 'user']
        },
        users: {
            getUsers: ['superadmin', 'admin'],
            getUser: ['superadmin', 'admin', 'user'],
            updateUser: {
                user: ['name', 'email', 'password'],
                admin: ['*'],
                superadmin: ['*']
            },
            deleteUser: ['superadmin', 'admin']
        },
        menu: {
            getMenuItems: ['superadmin', 'admin', 'user'],
            createMenuItem: ['superadmin', 'admin'],
            updateMenuItem: ['superadmin', 'admin'],
            deleteMenuItem: ['superadmin', 'admin']
        },
        orders: {
            getOrders: {
                user: ['own'],
                admin: ['all'],
                superadmin: ['all']
            },
            createOrder: ['superadmin', 'admin', 'user'],
            getOrder: {
                user: ['own'],
                admin: ['all'],
                superadmin: ['all']
            },
            updateOrder: {
                user: ['own'],
                admin: ['all'],
                superadmin: ['all']
            }
        },
        rooms: {
            getRooms: ['superadmin', 'admin', 'user'],
            createRoom: ['superadmin', 'admin'],
            updateRoom: ['superadmin', 'admin'],
            deleteRoom: ['superadmin', 'admin']
        },
        bookings: {
            getBookings: {
                user: ['own'],
                admin: ['all'],
                superadmin: ['all']
            },
            createBooking: ['superadmin', 'admin', 'user'],
            getBooking: {
                user: ['own'],
                admin: ['all'],
                superadmin: ['all']
            },
            updateBooking: {
                user: ['own'],
                admin: ['all'],
                superadmin: ['all']
            },
            deleteBooking: {
                user: ['own'],
                admin: ['all'],
                superadmin: ['all']
            }
        },
        feedback: {
            getFeedbacks: ['superadmin', 'admin'],
            createFeedback: ['superadmin', 'admin', 'user'],
            deleteFeedback: ['superadmin', 'admin']
        },
        admin: {
            getDashboardStats: ['superadmin', 'admin'],
            getRecentOrders: ['superadmin', 'admin'],
            getRecentBookings: ['superadmin', 'admin'],
            getRecentFeedbacks: ['superadmin', 'admin'],
            getRevenue: ['superadmin', 'admin'],
            getPopularItems: ['superadmin', 'admin'],
            getBusySlots: ['superadmin', 'admin'],
            getSettings: ['superadmin', 'admin']
        }
    }
}; 