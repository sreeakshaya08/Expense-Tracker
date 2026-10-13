const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { validateBudget } = require('../middleware/validation');
const {
  getBudgets,
  getBudget,
  createBudget,
  updateBudget,
  deleteBudget,
  getBudgetSummary,
  resetBudgets
} = require('../controllers/budgetsController');

// All routes require authentication
router.use(authenticateToken);

// Routes
router.get('/', getBudgets);
router.get('/summary', getBudgetSummary);
router.post('/reset', resetBudgets);
router.get('/:id', getBudget);
router.post('/', validateBudget, createBudget);
router.put('/:id', validateBudget, updateBudget);
router.delete('/:id', deleteBudget);

module.exports = router;
