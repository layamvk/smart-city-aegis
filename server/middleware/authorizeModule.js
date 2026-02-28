const permissions = require('../config/permissions');

const authorizeModule = (moduleName, requiredAction = 'read') => {
    return (req, res, next) => {
        try {
            if (!req.user || !req.user.role) {
                return res.status(401).json({ message: 'Authentication required' });
            }

            const userRole = req.user.role;
            const rolePerms = permissions[userRole];

            if (!rolePerms) {
                return res.status(403).json({ message: 'Role not recognized' });
            }

            if (!rolePerms.modules.includes(moduleName)) {
                return res.status(403).json({ message: `Access denied to module: ${moduleName}` });
            }

            if (!rolePerms.actions.includes(requiredAction)) {
                return res.status(403).json({ message: `Access denied: action '${requiredAction}' not allowed in module '${moduleName}'` });
            }

            next();
        } catch (err) {
            return res.status(500).json({ message: 'Authorization error' });
        }
    };
};

module.exports = authorizeModule;
