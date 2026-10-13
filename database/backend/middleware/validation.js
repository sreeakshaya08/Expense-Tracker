const { body, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User registration validation
const validateRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('firstname')
    .trim()
    .isLength({ min: 1 })
    .withMessage('First name is required'),
  body('lastname')
    .optional()
    .trim(),
  handleValidationErrors
];

// User login validation
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Account validation
const validateAccount = [
  body('name')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Account name is required'),
  body('bank_name')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Bank name is required'),
  body('balance')
    .isNumeric()
    .withMessage('Balance must be a number'),
  handleValidationErrors
];

// Transaction validation
const validateTransaction = [
  body('date')
    .isISO8601()
    .withMessage('Please provide a valid date'),
  body('description')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Description is required'),
  body('type')
    .isIn(['Income', 'Expense', 'Transfer', 'Investment'])
    .withMessage('Type must be Income, Expense, Transfer, or Investment'),
  body('amount')
    .isNumeric()
    .isFloat({ gt: 0 })
    .withMessage('Amount must be a positive number'),
  body('category')
    .optional()
    .trim(),
  body('account_id')
    .optional({ nullable: true })
    .custom((value) => {
      if (value === null || value === undefined || value === '') {
        return true;
      }
      if (!Number.isInteger(Number(value))) {
        throw new Error('Account ID must be an integer');
      }
      return true;
    }),
  handleValidationErrors
];

// Budget validation
const validateBudget = [
  body('category_name')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Category name is required'),
  body('limit_amount')
    .isNumeric()
    .isFloat({ gte: 0 })
    .withMessage('Limit amount must be a non-negative number'),
  body('spent_amount')
    .optional()
    .isNumeric()
    .isFloat({ gte: 0 })
    .withMessage('Spent amount must be a non-negative number'),
  handleValidationErrors
];

// Bill validation
const validateBill = [
  body('name')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Bill name is required'),
  body('amount')
    .isNumeric()
    .isFloat({ gt: 0 })
    .withMessage('Amount must be a positive number'),
  body('due_date')
    .isISO8601()
    .withMessage('Please provide a valid due date'),
  body('status')
    .optional()
    .isIn(['pending', 'paid', 'overdue'])
    .withMessage('Status must be pending, paid, or overdue'),
  handleValidationErrors
];

// EMI validation
const validateEMI = [
  body('name')
    .trim()
    .isLength({ min: 1 })
    .withMessage('EMI name is required'),
  body('amount')
    .isNumeric()
    .isFloat({ gt: 0 })
    .withMessage('Amount must be a positive number'),
  handleValidationErrors
];

module.exports = {
  validateRegistration,
  validateLogin,
  validateAccount,
  validateTransaction,
  validateBudget,
  validateBill,
  validateEMI,
  handleValidationErrors
};
