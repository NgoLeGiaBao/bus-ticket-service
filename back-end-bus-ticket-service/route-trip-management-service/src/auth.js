const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '../.env' });

// Middleware to authenticate the JWT token
function verifyToken(req, res, next) {
    // Get the token from the Authorization header
    const token = req.headers['authorization']?.split(' ')[1]; // Token format "Bearer <token>"
    if (!token) {
        return res.status(403).send({ message: 'Token is required' });
    }

    // Authenticate the token
    jwt.verify(token, process.env.JWT_SECRET, { 
        issuer: process.env.JWT_ISSUER,   
        audience: process.env.JWT_AUDIENCE 
    }, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: 'Invalid or expired token' });
        }

        // Save the user information into the request object
        req.user = decoded;  // Contains user information, including the role
        next();
    });
}

// Middleware to check user role
function verifyRole(requiredRole) {
    return (req, res, next) => {
        // Check if user or role information is missing from the token
        if (!req.user || !req.user.role) {
            return res.status(403).send({ message: 'Access denied, role is missing' });
        }

        // Check if the user's role matches the required role
        if (req.user.role !== requiredRole) {
            return res.status(403).send({ message: 'Forbidden: You do not have the required role' });
        }

        next();
    };
}

module.exports = { verifyToken, verifyRole };
