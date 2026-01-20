const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// Patient registration
router.post('/register/patient', authController.registerPatient);

// Login
router.post('/login', authController.login);

// Get profile (protected)
router.get('/profile', auth(), authController.getProfile);

// Change password (protected)
router.put('/change-password', auth(), authController.changePassword);

// forget password
router.post('/reset-password', auth(['admin']), authController.resetPassword);

module.exports = router;