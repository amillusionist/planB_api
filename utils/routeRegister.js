const permissions = require('../config/permissions');

// Cache for storing processed permissions
const permissionCache = new Map();

// Cache for storing route configurations
const routeCache = new Map();

// Helper function to get cached permission
const getCachedPermission = (feature, handler, role) => {
    const cacheKey = `${feature}:${handler}:${role}`;
    if (permissionCache.has(cacheKey)) {
        return permissionCache.get(cacheKey);
    }
    return null;
};

// Helper function to set cached permission
const setCachedPermission = (feature, handler, role, permission) => {
    const cacheKey = `${feature}:${handler}:${role}`;
    permissionCache.set(cacheKey, permission);
};

// Helper function to process permissions
const processPermission = async (feature, handler, role) => {
    const cachedPermission = getCachedPermission(feature, handler, role);
    if (cachedPermission) {
        return cachedPermission;
    }

    const permission = permissions.features[feature]?.[handler] || ['user'];
    setCachedPermission(feature, handler, role, permission);
    return permission;
};

// Helper function to check resource ownership
const checkResourceOwnership = async (req, userId) => {
    if (req.params.id && req.params.id !== userId) {
        return false;
    }
    return true;
};

// Helper function to filter allowed fields
const filterAllowedFields = (body, allowedFields) => {
    if (allowedFields.includes('*')) {
        return body;
    }
    return Object.keys(body).reduce((filtered, field) => {
        if (allowedFields.includes(field)) {
            filtered[field] = body[field];
        }
        return filtered;
    }, {});
};

const registerRoutes = (router, routes, controller) => {
    routes.forEach(route => {
        const middleware = route.middleware || [];
        const feature = route.path.split('/')[1] || 'root';
        
        // Add async middleware for permission checking
        middleware.push(async (req, res, next) => {
            try {
                const userRole = req.user?.role || 'user';
                const userId = req.user?.id;
                
                // Get permissions from cache or process them
                const permission = await processPermission(feature, route.handler, userRole);
                
                if (Array.isArray(permission)) {
                    if (!permission.includes(userRole)) {
                        return res.status(403).json({
                            success: false,
                            message: 'Access denied'
                        });
                    }
                    return next();
                }

                const rolePermission = permission[userRole];
                if (!rolePermission) {
                    return res.status(403).json({
                        success: false,
                        message: 'Access denied'
                    });
                }

                // Handle resource ownership
                if (rolePermission === 'own') {
                    const isOwner = await checkResourceOwnership(req, userId);
                    if (!isOwner) {
                        return res.status(403).json({
                            success: false,
                            message: 'You can only access your own resources'
                        });
                    }
                    
                    // Filter list queries
                    if (route.handler.startsWith('get') && !route.handler.endsWith('ById')) {
                        req.query.userId = userId;
                    }
                }

                // Handle field-level permissions
                if (Array.isArray(rolePermission) && (route.method === 'put' || route.method === 'patch')) {
                    req.body = filterAllowedFields(req.body, rolePermission);
                }

                next();
            } catch (error) {
                console.error('Permission check error:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Internal server error'
                });
            }
        });

        // Cache route configuration
        const routeKey = `${route.method}:${route.path}`;
        if (!routeCache.has(routeKey)) {
            routeCache.set(routeKey, {
                method: route.method,
                path: route.path,
                middleware,
                handler: controller[route.handler]
            });
        }

        // Register route using cached configuration
        const cachedRoute = routeCache.get(routeKey);
        router[cachedRoute.method](
            cachedRoute.path,
            ...cachedRoute.middleware,
            cachedRoute.handler
        );
    });
};

// Clear cache periodically to prevent memory leaks
setInterval(() => {
    permissionCache.clear();
    routeCache.clear();
}, 3600000); // Clear cache every hour

module.exports = registerRoutes; 