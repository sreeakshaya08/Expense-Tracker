const { pool } = require('../config/database');

// Get all accounts for user
const getAccounts = async (req, res) => {
  try {
    const [accounts] = await pool.execute(
      'SELECT id, account_name as name, bank_name, current_balance as balance, created_at FROM accounts WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );

    res.json({
      success: true,
      data: {
        accounts
      }
    });
  } catch (error) {
    console.error('Get accounts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch accounts'
    });
  }
};

// Get single account
const getAccount = async (req, res) => {
  try {
    const { id } = req.params;

    const [accounts] = await pool.execute(
      'SELECT id, account_name as name, bank_name, current_balance as balance, created_at FROM accounts WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (accounts.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Account not found'
      });
    }

    res.json({
      success: true,
      data: {
        account: accounts[0]
      }
    });
  } catch (error) {
    console.error('Get account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch account'
    });
  }
};

// Create new account
const createAccount = async (req, res) => {
  try {
    const { name, bank_name, balance } = req.body;

    const [result] = await pool.execute(
      'INSERT INTO accounts (user_id, account_name, bank_name, current_balance) VALUES (?, ?, ?, ?)',
      [req.user.id, name, bank_name, parseFloat(balance) || 0]
    );

    const [newAccount] = await pool.execute(
      'SELECT id, account_name as name, bank_name, current_balance as balance, created_at FROM accounts WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        account: newAccount[0]
      }
    });
  } catch (error) {
    console.error('Create account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create account'
    });
  }
};

// Update account
const updateAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, bank_name, balance } = req.body;

    // Check if account exists and belongs to user
    const [existingAccounts] = await pool.execute(
      'SELECT id FROM accounts WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (existingAccounts.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Account not found'
      });
    }

    await pool.execute(
      'UPDATE accounts SET account_name = ?, bank_name = ?, current_balance = ? WHERE id = ? AND user_id = ?',
      [name, bank_name, parseFloat(balance) || 0, id, req.user.id]
    );

    const [updatedAccount] = await pool.execute(
      'SELECT id, account_name as name, bank_name, current_balance as balance, created_at FROM accounts WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Account updated successfully',
      data: {
        account: updatedAccount[0]
      }
    });
  } catch (error) {
    console.error('Update account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update account'
    });
  }
};

// Delete account
const deleteAccount = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if account exists and belongs to user
    const [existingAccounts] = await pool.execute(
      'SELECT id FROM accounts WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (existingAccounts.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Account not found'
      });
    }

    await pool.execute(
      'DELETE FROM accounts WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete account'
    });
  }
};

// Get account summary (total balance across all accounts)
const getAccountSummary = async (req, res) => {
  try {
    const [summary] = await pool.execute(
      'SELECT COUNT(*) as total_accounts, COALESCE(SUM(current_balance), 0) as total_balance FROM accounts WHERE user_id = ?',
      [req.user.id]
    );

    res.json({
      success: true,
      data: {
        summary: summary[0]
      }
    });
  } catch (error) {
    console.error('Get account summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch account summary'
    });
  }
};

module.exports = {
  getAccounts,
  getAccount,
  createAccount,
  updateAccount,
  deleteAccount,
  getAccountSummary
};
