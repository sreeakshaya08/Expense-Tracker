const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { validateTransaction } = require('../middleware/validation');
const {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionSummary
} = require('../controllers/transactionsController');

// All routes require authentication
router.use(authenticateToken);

// Routes
router.get('/', getTransactions);
router.get('/summary', getTransactionSummary);
router.get('/:id', getTransaction);
router.post('/', validateTransaction, createTransaction);
router.put('/:id', validateTransaction, updateTransaction);
router.delete('/:id', deleteTransaction);

module.exports = router;
