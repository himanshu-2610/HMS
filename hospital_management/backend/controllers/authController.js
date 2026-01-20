const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');

dotenv.config();

const authController = {
  registerPatient: async (req, res) => {
    try {
      const { 
        username, 
        password, 
        email,
        firstName, 
        lastName, 
        dob, 
        gender, 
        address, 
        phone, 
        emergencyContact, 
        bloodType, 
        allergies 
      } = req.body;
      
      // Validate required fields
      if (!username || !password || !email || !firstName || !lastName || !dob || !gender) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      // Check if username exists
      const existingUser = await User.findByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
      }

      // Create user
      const userId = await User.create({
        username,
        password,
        role: 'patient',
        email
      });

      // Create patient profile
      await Patient.create({
        userId,
        firstName,
        lastName,
        dob,
        gender,
        address,
        phone,
        emergencyContact,
        bloodType,
        allergies
      });

      res.status(201).json({ message: 'Patient registered successfully' });
    } catch (err) {
      console.error('Patient registration error:', err);
      res.status(500).json({ 
        message: 'Server error during patient registration',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  },

  login: async (req, res) => {
    try {
      const { username, password } = req.body;

      // Validate input
      if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
      }

      // Find user
      const user = await User.findByUsername(username);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Check password
      const isMatch = await User.verifyPassword(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Check if user is active
      if (!user.is_active) {
        return res.status(401).json({ message: 'Account is inactive' });
      }

      // Generate token
      const token = jwt.sign(
        { user: { id: user.id, role: user.role } },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          email: user.email
        }
      });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ 
        message: 'Server error during login',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  },

  getProfile: async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Remove sensitive data
      delete user.password;
      
      res.json(user);
    } catch (err) {
      console.error('Get profile error:', err);
      res.status(500).json({ 
        message: 'Server error while fetching profile',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  },

  changePassword: async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;

      // Validate input
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Current and new passwords are required' });
      }

      // Get user
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Verify current password
      const isMatch = await User.verifyPassword(currentPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }

      // Update password
      await User.updatePassword(req.user.id, newPassword);

      res.json({ message: 'Password updated successfully' });
    } catch (err) {
      console.error('Change password error:', err);
      res.status(500).json({ 
        message: 'Server error while changing password',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  },

  resetPassword: async (req, res) => {
    try {
      const { userId, newPassword } = req.body;

      // Validate input
      if (!userId || !newPassword) {
        return res.status(400).json({ message: 'User ID and new password are required' });
      }

      // Update password
      await User.updatePassword(userId, newPassword);

      res.json({ message: 'Password reset successfully' });
    } catch (err) {
      console.error('Reset password error:', err);
      res.status(500).json({ 
        message: 'Server error while resetting password',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  }
};

module.exports = authController;