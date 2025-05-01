# Plan B Cafe API

A robust RESTful API for Plan B Cafe management system, handling user authentication, menu management, orders, room bookings, and admin functionalities.

## Table of Contents
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Environment Variables](#environment-variables)
- [Security](#security)
- [Testing](#testing)
- [Deployment](#deployment)
- [Maintenance](#maintenance)

## Features
- User Authentication (Register, Login, Logout)
- Role-based Access Control (Admin/User)
- Menu Management
- Order Processing
- Room Booking System
- Feedback Management
- Admin Dashboard with Analytics
- Secure API with JWT Authentication
- Rate Limiting and Security Measures

## Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- Yarn package manager
- Git

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/planb_api.git
cd planb_api
```

2. Install dependencies:
```bash
yarn install
```

3. Create environment files:
```bash
cp .env.example .env
cp .env.example .env.test
```

4. Start the development server:
```bash
yarn dev
```

## Configuration

### Environment Variables
Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/planb_cafe

# JWT Configuration
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d
JWT_COOKIE_EXPIRES_IN=1

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_WINDOW_MS=3600000
AUTH_RATE_LIMIT_MAX_REQUESTS=5

# Email Configuration (if needed)
SMTP_HOST=your_smtp_host
SMTP_PORT=your_smtp_port
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_pass
EMAIL_FROM=your_email
```

## API Documentation

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Password@123",
    "phone": "1234567890",
    "address": "123 Main St"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
    "email": "john@example.com",
    "password": "Password@123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Menu Management

#### Get Menu Items
```http
GET /api/menu
```

#### Create Menu Item (Admin)
```http
POST /api/menu
Authorization: Bearer <token>
Content-Type: application/json

{
    "name": "Cappuccino",
    "description": "Classic Italian coffee",
    "price": 4.99,
    "category": "Hot Drinks"
}
```

### Order Management

#### Create Order
```http
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
    "items": [
        {
            "menuItemId": "item_id",
            "quantity": 2
        }
    ],
    "total": 9.98
}
```

### Room Booking

#### Book a Room
```http
POST /api/bookings
Authorization: Bearer <token>
Content-Type: application/json

{
    "roomId": "room_id",
    "startTime": "2024-04-25T10:00:00Z",
    "endTime": "2024-04-25T12:00:00Z",
    "guests": 4
}
```

### Admin Dashboard

#### Get Dashboard Statistics
```http
GET /api/admin/dashboard
Authorization: Bearer <token>
```

## Security

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

### Rate Limiting
- General API: 100 requests per 15 minutes
- Authentication: 5 requests per hour

### JWT Token
- Stored in HTTP-only cookies
- Expires in 1 day
- Required for protected routes

## Testing

Run tests:
```bash
yarn test
```

Run tests with coverage:
```bash
yarn test:coverage
```

## Deployment

1. Set up production environment variables
2. Build the application:
```bash
yarn build
```

3. Start the production server:
```bash
yarn start
```

## Maintenance

### Database Migrations
To add new database migrations:
1. Create a new migration file in `database/migrations`
2. Update the schema in the respective model
3. Run the migration:
```bash
yarn migrate
```

### Adding New Features
1. Create new route in `config/routes.js`
2. Add controller in `controllers/`
3. Add model in `models/` if needed
4. Add middleware in `middleware/` if needed
5. Update documentation

### Updating Dependencies
```bash
yarn upgrade-interactive
```

## Contributing
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License
This project is licensed under the MIT License.

## Support
For support, email support@planbcafe.com or create an issue in the repository. 