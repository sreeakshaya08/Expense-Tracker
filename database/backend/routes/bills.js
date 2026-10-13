const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { validateBill } = require('../middleware/validation');
const {
  getBills,
  getBill,
  createBill,
  updateBill,
  deleteBill,
  payBill,
  markBillAsPaid,
  getBillsSummary,
  updateOverdueBills
} = require('../controllers/billsController');

// All routes require authentication
router.use(authenticateToken);

// Routes
router.get('/', getBills);
router.get('/summary', getBillsSummary);
router.post('/update-overdue', updateOverdueBills);
router.get('/:id', getBill);
router.post('/', validateBill, createBill);
router.put('/:id', validateBill, updateBill);
router.patch('/:id/pay', payBill);
router.patch('/:id/mark-paid', markBillAsPaid);
router.delete('/:id', deleteBill);

module.exports = router;
