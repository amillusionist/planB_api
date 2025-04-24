module.exports = {
    // Auth messages
    auth: {
        register: {
            success: 'User registered successfully',
            missingFields: 'Please provide all required fields',
            userExists: 'User already exists with this email',
            error: 'Error registering user'
        },
        login: {
            success: 'User logged in successfully',
            missingCredentials: 'Please provide an email and password',
            invalidCredentials: 'Invalid credentials',
            error: 'Error logging in'
        },
        logout: {
            success: 'Logged out successfully',
            error: 'Error logging out'
        },
        getMe: {
            success: 'User retrieved successfully',
            error: 'Error retrieving user'
        },
        token: {
            error: 'Error generating authentication token'
        }
    },

    // Common messages
    common: {
        success: 'Operation successful',
        error: 'Operation failed',
        notFound: 'Resource not found',
        unauthorized: 'Not authorized to access this resource',
        serverError: 'Server error occurred',
        validationError: 'Validation error',
        invalidId: 'Invalid ID format'
    },

    // User messages
    user: {
        notFound: 'User not found',
        updateSuccess: 'User updated successfully',
        deleteSuccess: 'User deleted successfully',
        error: 'Error processing user request'
    },

    // Menu messages
    menu: {
        notFound: 'Menu item not found',
        createSuccess: 'Menu item created successfully',
        updateSuccess: 'Menu item updated successfully',
        deleteSuccess: 'Menu item deleted successfully',
        error: 'Error processing menu request'
    },

    // Order messages
    order: {
        notFound: 'Order not found',
        createSuccess: 'Order created successfully',
        updateSuccess: 'Order updated successfully',
        deleteSuccess: 'Order deleted successfully',
        error: 'Error processing order request'
    },

    // Room messages
    room: {
        notFound: 'Room not found',
        createSuccess: 'Room created successfully',
        updateSuccess: 'Room updated successfully',
        deleteSuccess: 'Room deleted successfully',
        error: 'Error processing room request'
    },

    // Room Booking messages
    roomBooking: {
        notFound: 'Room booking not found',
        createSuccess: 'Room booking created successfully',
        updateSuccess: 'Room booking updated successfully',
        deleteSuccess: 'Room booking deleted successfully',
        error: 'Error processing room booking request'
    },

    // Feedback messages
    feedback: {
        notFound: 'Feedback not found',
        createSuccess: 'Feedback submitted successfully',
        updateSuccess: 'Feedback updated successfully',
        deleteSuccess: 'Feedback deleted successfully',
        error: 'Error processing feedback request'
    }
}; 