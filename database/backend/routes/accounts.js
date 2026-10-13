const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { validateAccount } = require('../middleware/validation');
const {
  getAccounts,
  getAccount,
  createAccount,
  updateAccount,
  deleteAccount,
  getAccountSummary
} = require('../controllers/accountsController');

// All routes require authentication
router.use(authenticateToken);

// Routes
router.get('/', getAccounts);
router.get('/summary', getAccountSummary);
router.get('/:id', getAccount);
router.post('/', validateAccount, createAccount);
router.put('/:id', validateAccount, updateAccount);
router.delete('/:id', deleteAccount);

module.exports = router;
