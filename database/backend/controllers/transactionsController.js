const { pool } = require('../config/database');

// Get all transactions for user
const getTransactions = async (req, res) => {
  try {
    console.log('Getting transactions for user:', req.user.id);
    console.log('Query params:', req.query);

    // Simplified approach - get all transactions first
    const query = `
      SELECT t.id, t.transaction_date as date, t.description, t.transaction_type as type, t.amount, t.category,
             a.account_name as account_name, t.created_at
      FROM transactions t
      LEFT JOIN accounts a ON t.account_id = a.id
      WHERE t.user_id = ?
      ORDER BY t.transaction_date DESC, t.created_at DESC
    `;

    console.log('Executing query with user_id:', req.user.id);
    const [transactions] = await pool.execute(query, [req.user.id]);

    console.log('Found transactions:', transactions.length);

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          page: 1,
          limit: 50,
          total: transactions.length,
          pages: 1
        }
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transactions'
    });
  }
};

// Get single transaction
const getTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    const [transactions] = await pool.execute(
      `SELECT t.id, t.transaction_date as date, t.description, t.transaction_type as type, t.amount, t.category,
              t.account_id, a.account_name as account_name, t.created_at
       FROM transactions t
       LEFT JOIN accounts a ON t.account_id = a.id
       WHERE t.id = ? AND t.user_id = ?`,
      [id, req.user.id]
    );

    if (transactions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      data: {
        transaction: transactions[0]
      }
    });
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transaction'
    });
  }
};

// Create new transaction
const createTransaction = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const { date, description, type, amount, category, account_id } = req.body;
    const transactionAmount = parseFloat(amount);

    // Validate account if provided
    if (account_id) {
      const [accounts] = await connection.execute(
        'SELECT id, current_balance FROM accounts WHERE id = ? AND user_id = ?',
        [account_id, req.user.id]
      );

      if (accounts.length === 0) {
        await connection.rollback();
        return res.status(404).json({
          success: false,
          message: 'Account not found'
        });
      }

      // Update account balance
      const currentBalance = parseFloat(accounts[0].current_balance);
      const newBalance = type === 'Income'
        ? currentBalance + transactionAmount
        : currentBalance - transactionAmount;

      await connection.execute(
        'UPDATE accounts SET current_balance = ? WHERE id = ?',
        [newBalance, account_id]
      );
    }

    // Create transaction
    const [result] = await connection.execute(
      'INSERT INTO transactions (user_id, account_id, transaction_date, description, transaction_type, amount, category) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, account_id || null, date, description, type, transactionAmount, category || null]
    );

    // Update budget if it's an expense with category
    if (type === 'Expense' && category) {
      await connection.execute(
        'UPDATE budgets SET spent_amount = spent_amount + ? WHERE user_id = ? AND category_name = ?',
        [transactionAmount, req.user.id, category]
      );
    }

    await connection.commit();

    // Fetch the created transaction
    const [newTransaction] = await pool.execute(
      `SELECT t.id, t.transaction_date as date, t.description, t.transaction_type as type, t.amount, t.category,
              t.account_id, a.account_name as account_name, t.created_at
       FROM transactions t
       LEFT JOIN accounts a ON t.account_id = a.id
       WHERE t.id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: {
        transaction: newTransaction[0]
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Create transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create transaction'
    });
  } finally {
    connection.release();
  }
};

// Update transaction
const updateTransaction = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const { date, description, type, amount, category, account_id } = req.body;
    const newAmount = parseFloat(amount);

    // Get existing transaction
    const [existingTransactions] = await connection.execute(
      'SELECT * FROM transactions WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (existingTransactions.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    const oldTransaction = existingTransactions[0];
    const oldAmount = parseFloat(oldTransaction.amount);

    // Revert old account balance changes
    if (oldTransaction.account_id) {
      const [oldAccounts] = await connection.execute(
        'SELECT current_balance FROM accounts WHERE id = ?',
        [oldTransaction.account_id]
      );

      if (oldAccounts.length > 0) {
        const currentBalance = parseFloat(oldAccounts[0].current_balance);
        const revertedBalance = oldTransaction.type === 'Income'
          ? currentBalance - oldAmount
          : currentBalance + oldAmount;

        await connection.execute(
          'UPDATE accounts SET current_balance = ? WHERE id = ?',
          [revertedBalance, oldTransaction.account_id]
        );
      }
    }

    // Apply new account balance changes
    if (account_id) {
      const [accounts] = await connection.execute(
        'SELECT current_balance FROM accounts WHERE id = ? AND user_id = ?',
        [account_id, req.user.id]
      );

      if (accounts.length === 0) {
        await connection.rollback();
        return res.status(404).json({
          success: false,
          message: 'Account not found'
        });
      }

      const currentBalance = parseFloat(accounts[0].current_balance);
      const newBalance = type === 'Income'
        ? currentBalance + newAmount
        : currentBalance - newAmount;

      await connection.execute(
        'UPDATE accounts SET current_balance = ? WHERE id = ?',
        [newBalance, account_id]
      );
    }

    // Revert old budget changes
    if (oldTransaction.type === 'Expense' && oldTransaction.category) {
      await connection.execute(
        'UPDATE budgets SET spent_amount = spent_amount - ? WHERE user_id = ? AND category_name = ?',
        [oldAmount, req.user.id, oldTransaction.category]
      );
    }

    // Apply new budget changes
    if (type === 'Expense' && category) {
      await connection.execute(
        'UPDATE budgets SET spent_amount = spent_amount + ? WHERE user_id = ? AND category_name = ?',
        [newAmount, req.user.id, category]
      );
    }

    // Update transaction
    await connection.execute(
      'UPDATE transactions SET transaction_date = ?, description = ?, transaction_type = ?, amount = ?, category = ?, account_id = ? WHERE id = ? AND user_id = ?',
      [date, description, type, newAmount, category || null, account_id || null, id, req.user.id]
    );

    await connection.commit();

    // Fetch updated transaction
    const [updatedTransaction] = await pool.execute(
      `SELECT t.id, t.transaction_date as date, t.description, t.transaction_type as type, t.amount, t.category,
              t.account_id, a.account_name as account_name, t.created_at
       FROM transactions t
       LEFT JOIN accounts a ON t.account_id = a.id
       WHERE t.id = ?`,
      [id]
    );

    res.json({
      success: true,
      message: 'Transaction updated successfully',
      data: {
        transaction: updatedTransaction[0]
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Update transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update transaction'
    });
  } finally {
    connection.release();
  }
};

// Delete transaction
const deleteTransaction = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const { id } = req.params;

    // Get existing transaction
    const [existingTransactions] = await connection.execute(
      'SELECT * FROM transactions WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (existingTransactions.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    const transaction = existingTransactions[0];
    const amount = parseFloat(transaction.amount);

    // Revert account balance changes
    if (transaction.account_id) {
      const [accounts] = await connection.execute(
        'SELECT current_balance FROM accounts WHERE id = ?',
        [transaction.account_id]
      );

      if (accounts.length > 0) {
        const currentBalance = parseFloat(accounts[0].current_balance);
        const revertedBalance = transaction.type === 'Income'
          ? currentBalance - amount
          : currentBalance + amount;

        await connection.execute(
          'UPDATE accounts SET current_balance = ? WHERE id = ?',
          [revertedBalance, transaction.account_id]
        );
      }
    }

    // Revert budget changes
    if (transaction.type === 'Expense' && transaction.category) {
      await connection.execute(
        'UPDATE budgets SET spent_amount = spent_amount - ? WHERE user_id = ? AND category_name = ?',
        [amount, req.user.id, transaction.category]
      );
    }

    // Delete transaction
    await connection.execute(
      'DELETE FROM transactions WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    await connection.commit();

    res.json({
      success: true,
      message: 'Transaction deleted successfully'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Delete transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete transaction'
    });
  } finally {
    connection.release();
  }
};

// Get transaction summary
const getTransactionSummary = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    let query = `
      SELECT
        transaction_type as type,
        COUNT(*) as count,
        SUM(amount) as total
      FROM transactions
      WHERE user_id = ?
    `;
    const params = [req.user.id];

    if (start_date) {
      query += ' AND transaction_date >= ?';
      params.push(start_date);
    }
    if (end_date) {
      query += ' AND transaction_date <= ?';
      params.push(end_date);
    }

    query += ' GROUP BY transaction_type';

    const [summary] = await pool.execute(query, params);

    // Get monthly summary for current month
    const currentDate = new Date();
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const [monthlySummary] = await pool.execute(
      `SELECT
        transaction_type as type,
        SUM(amount) as total
       FROM transactions
       WHERE user_id = ? AND transaction_date >= ? AND transaction_date <= ?
       GROUP BY transaction_type`,
      [req.user.id, firstDay.toISOString().split('T')[0], lastDay.toISOString().split('T')[0]]
    );

    res.json({
      success: true,
      data: {
        summary,
        monthly_summary: monthlySummary
      }
    });
  } catch (error) {
    console.error('Get transaction summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transaction summary'
    });
  }
};

module.exports = {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionSummary
};
