const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const routes = require('../config/routes');
const registerRoutes = require('../utils/routeRegister');

registerRoutes(router, routes.auth, authController);

module.exports = router; 