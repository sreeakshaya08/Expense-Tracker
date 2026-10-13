const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { validateRegistration, validateLogin } = require('../middleware/validation');
const {
  register,
  login,
  resetPassword,
  sendOTP,
  getProfile
} = require('../controllers/authController');

// Public routes
router.post('/register', validateRegistration, register);
router.post('/login', validateLogin, login);
router.post('/forgot-password/send-otp', sendOTP);
router.post('/forgot-password/reset', resetPassword);

// Protected routes
router.get('/profile', authenticateToken, getProfile);

module.exports = router;
