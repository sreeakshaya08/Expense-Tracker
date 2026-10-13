const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  getDashboardData,
  getFinancialOverview
} = require('../controllers/dashboardController');

// All routes require authentication
router.use(authenticateToken);

// Routes
router.get('/', getDashboardData);
router.get('/overview', getFinancialOverview);

module.exports = router;
