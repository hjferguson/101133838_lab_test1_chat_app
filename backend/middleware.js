const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1]; // Assuming token is sent as "Bearer TOKEN"

    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.id; // Or however you have structured your token payload
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

module.exports = authMiddleware;
