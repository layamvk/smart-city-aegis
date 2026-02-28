const mongoSanitize = require('express-mongo-sanitize');
const Joi = require('joi');

// NoSQL Injection Protection Middleware
const nosqlSanitizer = mongoSanitize();

// Centralized Validation Schema Definitions
const schemas = {
    login: Joi.object({
        username: Joi.alternatives().try(
            Joi.string().email({ tlds: { allow: false } }),
            Joi.string().alphanum().min(3).max(30)
        ).required(),
        password: Joi.string().min(6).required(),
        deviceId: Joi.string().optional()
    }),
    register: Joi.object({
        username: Joi.alternatives().try(
            Joi.string().email({ tlds: { allow: false } }),
            Joi.string().alphanum().min(3).max(30)
        ).required(),
        password: Joi.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required(),
        phoneNumber: Joi.string().pattern(/^\d{10,15}$/).required(),
        role: Joi.string().valid('Admin', 'TrafficOperator', 'EmergencyAuthority', 'SecurityAnalyst', 'TrafficAdmin', 'ElectricityAdmin', 'WaterAdmin', 'LightingAdmin', 'CCTVOperator', 'Viewer').optional(),
        zone: Joi.string().optional()
    }),
    verifyPhone: Joi.object({
        username: Joi.string().required(),
        code: Joi.string().length(6).required()
    }),
    trafficOverride: Joi.object({
        signalId: Joi.string().required(),
        status: Joi.string().valid('RED', 'YELLOW', 'GREEN').required()
    }),
    zoneAction: Joi.object({
        zone: Joi.string().required()
    }),
    waterValve: Joi.object({
        zone: Joi.string().required(),
        flowRate: Joi.number().min(0).max(1000).required()
    }),
    powerOverride: Joi.object({
        substationId: Joi.string().required(),
        action: Joi.string().valid('ISOLATE', 'REBALANCE', 'LOAD_SHED', 'BACKUP_ACTIVATE').required(),
        value: Joi.number().optional()
    }),
    incident: Joi.object({
        type: Joi.string().valid('Fire', 'Medical', 'Crime', 'Infrastructure', 'Other').required(),
        zone: Joi.string().required(),
        severity: Joi.string().valid('Low', 'Medium', 'High', 'Critical').required(),
        coordinates: Joi.array().items(Joi.number()).length(2).required()
    }),
    lightUpdate: Joi.object({
        zone: Joi.string().required(),
        brightness: Joi.number().min(0).max(100).required()
    })
};

const validateBody = (schemaKey) => {
    return (req, res, next) => {
        const schema = schemas[schemaKey];
        if (!schema) return next();

        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({
                message: 'Invalid input data',
                details: process.env.NODE_ENV === 'development' ? error.details : undefined
            });
        }
        next();
    };
};

module.exports = {
    nosqlSanitizer,
    validateBody
};
