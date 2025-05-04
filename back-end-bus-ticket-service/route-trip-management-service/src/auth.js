const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.docker') });


if (process.env.NODE_ENV !== 'production') {
  console.log('JWT Config:', {
    SECRET: process.env.JWT_SECRET ? '***' : 'MISSING',
    ISSUER: process.env.JWT_ISSUER,
    AUDIENCE: process.env.JWT_AUDIENCE
  });
}

function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(403).json({ 
      message: 'Authorization header must be in format: Bearer <token>' 
    });
  }

  const token = authHeader.split(' ')[1];

  if (process.env.NODE_ENV !== 'production') {
    console.log('--- JWT Decode Debug ---');
    console.log('Token:', token);
  }

  try {
    const decoded = jwt.decode(token); 

    if (!decoded) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Gán user vào request
    req.user = decoded;
    next();
  } catch (error) {
    console.error('JWT Decode Error:', error);
    return res.status(401).json({ message: 'Failed to decode token' });
  }
}

function verifyRole(requiredRole) {
  return (req, res, next) => {
    if (!req.user?.role) {
      return res.status(403).json({ message: 'Access denied, role information missing' });
    }

    if (req.user.role !== requiredRole) {
      return res.status(403).json({ 
        message: `Forbidden: Required role '${requiredRole}'`,
        yourRole: req.user.role
      });
    }

    next();
  };
}

module.exports = { verifyToken, verifyRole };
