const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { validateEMI } = require('../middleware/validation');
const {
  getEMIs,
  getEMI,
  createEMI,
  updateEMI,
  deleteEMI,
  getEMISummary
} = require('../controllers/emisController');

// All routes require authentication
router.use(authenticateToken);

// Routes
router.get('/', getEMIs);
router.get('/summary', getEMISummary);
router.get('/:id', getEMI);
router.post('/', validateEMI, createEMI);
router.put('/:id', validateEMI, updateEMI);
router.delete('/:id', deleteEMI);

module.exports = router;
