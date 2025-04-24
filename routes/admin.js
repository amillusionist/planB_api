const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin');
const routes = require('../config/routes');
const registerRoutes = require('../utils/routeRegister');

registerRoutes(router, routes.admin, adminController);

module.exports = router; 