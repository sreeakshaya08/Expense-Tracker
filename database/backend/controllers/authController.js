const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');
const { generateToken } = require('../middleware/auth');

// Register new user
const register = async (req, res) => {
  try {
    const { email, password, firstname, lastname } = req.body;

    // Check if user already exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const [result] = await pool.execute(
      'INSERT INTO users (email, password, firstname, lastname) VALUES (?, ?, ?, ?)',
      [email, hashedPassword, firstname, lastname || '']
    );

    const userId = result.insertId;

    // Create default budget categories for new user
    const defaultCategories = [
      'Food & Dining 🍽️',
      'Transportation 🚗',
      'Shopping 🛍️',
      'Entertainment 🎮'
    ];

    for (const category of defaultCategories) {
      await pool.execute(
        'INSERT INTO budgets (user_id, category_name, limit_amount, spent_amount) VALUES (?, ?, 0, 0)',
        [userId, category]
      );
    }

    // Generate token
    const token = generateToken(userId);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: userId,
          email,
          firstname,
          lastname
        },
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed'
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const [users] = await pool.execute(
      'SELECT id, email, password, firstname, lastname FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const user = users[0];

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken(user.id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstname: user.firstname,
          lastname: user.lastname
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
};

// Reset password
const resetPassword = async (req, res) => {
  try {
    const { email, newPassword, otp } = req.body;

    // In a real application, you would verify the OTP here
    // For this demo, we'll accept any 6-digit OTP
    if (!otp || otp.length !== 6) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    // Find user
    const [users] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await pool.execute(
      'UPDATE users SET password = ? WHERE email = ?',
      [hashedPassword, email]
    );

    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({
      success: false,
      message: 'Password reset failed'
    });
  }
};

// Send OTP (simulation)
const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const [users] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate OTP (6-digit number)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // In a real application, you would send this OTP via email/SMS
    // For demo purposes, we'll return it in the response
    res.json({
      success: true,
      message: 'OTP sent successfully',
      data: {
        otp // Remove this in production!
      }
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP'
    });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile'
    });
  }
};

module.exports = {
  register,
  login,
  resetPassword,
  sendOTP,
  getProfile
};
