const User = require('../models/User');

const authorizeZoneAccess = (model) => {
    return async (req, res, next) => {
        try {
            const assetId = req.params.id || req.body.signalId || req.body.zone;
            if (!assetId) {
                return res.status(400).json({ message: 'Asset identifier missing for zone validation' });
            }

            if (req.user.role === 'SuperAdmin') {
                return next();
            }

            let asset;
            if (req.params.id) {
                asset = await model.findById(req.params.id);
            } else if (req.body.signalId) {
                asset = await model.findOne({ signalId: req.body.signalId });
            } else if (req.body.zone) {
                // Some assets are identified directly by their zone field in the payload
                asset = await model.findOne({ zone: req.body.zone });
            }

            if (!asset) {
                return res.status(404).json({ message: 'Infrastructure asset not found' });
            }

            const user = await User.findById(req.user.id);
            if (!user) return res.status(401).json({ message: 'User not found' });

            if (asset.zone !== user.zone) {
                return res.status(403).json({ message: `Cross-zone modification restricted. Asset belongs to ${asset.zone}, you are assigned to ${user.zone}.` });
            }

            next();
        } catch (error) {
            return res.status(500).json({ message: 'Zone authorization error', error: error.message });
        }
    };
};

module.exports = authorizeZoneAccess;
