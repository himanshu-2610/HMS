const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const dotenv = require('dotenv');

dotenv.config();

const auth = (roles = []) => {
  return async (req, res, next) => {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
      }

      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ message: 'Token has expired' });
        }
        return res.status(401).json({ message: 'Invalid token' });
      }
      
      // Check if user still exists
      const [user] = await pool.query('SELECT * FROM users WHERE id = ?', [decoded.user.id]);
      
      if (!user.length) {
        return res.status(401).json({ message: 'User not found' });
      }

      if (!user[0].is_active) {
        return res.status(401).json({ message: 'User account is inactive' });
      }

      // Check role authorization
      if (roles.length && !roles.includes(user[0].role)) {
        // Log unauthorized access attempt
        await pool.query(
          'INSERT INTO security_logs (user_id, action, ip_address) VALUES (?, ?, ?)',
          [user[0].id, 'Unauthorized role access attempt', req.ip]
        ).catch(err => console.error('Security log error:', err));
        
        return res.status(403).json({ message: 'Unauthorized access' });
      }

      // Attach user to request
      req.user = user[0];
      next();
    } catch (err) {
      console.error('Auth middleware error:', err);
      res.status(500).json({ message: 'Internal server error during authentication' });
    }
  };
};

module.exports = auth;