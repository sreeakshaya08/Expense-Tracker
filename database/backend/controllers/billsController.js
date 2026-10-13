const { pool } = require('../config/database');

// Get all bills for user
const getBills = async (req, res) => {
  try {
    const { status, upcoming_days } = req.query;

    let query = 'SELECT id, name, amount, due_date, status, created_at FROM bills WHERE user_id = ?';
    const params = [req.user.id];

    // Add filters
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (upcoming_days) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + parseInt(upcoming_days));
      query += ' AND due_date <= ? AND due_date >= CURDATE()';
      params.push(futureDate.toISOString().split('T')[0]);
    }

    query += ' ORDER BY due_date ASC';

    const [bills] = await pool.execute(query, params);

    res.json({
      success: true,
      data: {
        bills
      }
    });
  } catch (error) {
    console.error('Get bills error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bills'
    });
  }
};

// Get single bill
const getBill = async (req, res) => {
  try {
    const { id } = req.params;

    const [bills] = await pool.execute(
      'SELECT id, name, amount, due_date, status, created_at FROM bills WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (bills.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }

    res.json({
      success: true,
      data: {
        bill: bills[0]
      }
    });
  } catch (error) {
    console.error('Get bill error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bill'
    });
  }
};

// Create new bill
const createBill = async (req, res) => {
  try {
    const { name, amount, due_date, status = 'pending' } = req.body;

    const [result] = await pool.execute(
      'INSERT INTO bills (user_id, name, amount, due_date, status) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, name, parseFloat(amount), due_date, status]
    );

    const [newBill] = await pool.execute(
      'SELECT id, name, amount, due_date, status, created_at FROM bills WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Bill created successfully',
      data: {
        bill: newBill[0]
      }
    });
  } catch (error) {
    console.error('Create bill error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create bill'
    });
  }
};

// Update bill
const updateBill = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, amount, due_date, status } = req.body;

    // Check if bill exists and belongs to user
    const [existingBills] = await pool.execute(
      'SELECT id FROM bills WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (existingBills.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }

    // Build update query dynamically
    const updates = [];
    const params = [];

    if (name !== undefined) {
      updates.push('name = ?');
      params.push(name);
    }
    if (amount !== undefined) {
      updates.push('amount = ?');
      params.push(parseFloat(amount));
    }
    if (due_date !== undefined) {
      updates.push('due_date = ?');
      params.push(due_date);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      params.push(status);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    params.push(id, req.user.id);

    await pool.execute(
      `UPDATE bills SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`,
      params
    );

    const [updatedBill] = await pool.execute(
      'SELECT id, name, amount, due_date, status, created_at FROM bills WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Bill updated successfully',
      data: {
        bill: updatedBill[0]
      }
    });
  } catch (error) {
    console.error('Update bill error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update bill'
    });
  }
};

// Delete bill
const deleteBill = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if bill exists and belongs to user
    const [existingBills] = await pool.execute(
      'SELECT id FROM bills WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (existingBills.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }

    await pool.execute(
      'DELETE FROM bills WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    res.json({
      success: true,
      message: 'Bill deleted successfully'
    });
  } catch (error) {
    console.error('Delete bill error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete bill'
    });
  }
};

// Pay bill (with account selection and transaction creation)
const payBill = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const { account_id } = req.body;

    // Check if bill exists and belongs to user
    const [existingBills] = await connection.execute(
      'SELECT id, name, amount, status FROM bills WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (existingBills.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }

    const bill = existingBills[0];

    if (bill.status === 'paid') {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Bill is already paid'
      });
    }

    const billAmount = parseFloat(bill.amount);

    // If account_id is provided, update account balance and create transaction
    if (account_id) {
      // Check if account exists and belongs to user
      const [accounts] = await connection.execute(
        'SELECT id, account_name, current_balance FROM accounts WHERE id = ? AND user_id = ?',
        [account_id, req.user.id]
      );

      if (accounts.length === 0) {
        await connection.rollback();
        return res.status(404).json({
          success: false,
          message: 'Account not found'
        });
      }

      const account = accounts[0];
      const currentBalance = parseFloat(account.current_balance);

      if (currentBalance < billAmount) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: 'Insufficient balance in selected account'
        });
      }

      // Update account balance
      const newBalance = currentBalance - billAmount;
      await connection.execute(
        'UPDATE accounts SET current_balance = ? WHERE id = ?',
        [newBalance, account_id]
      );

      // Create transaction record
      await connection.execute(
        'INSERT INTO transactions (user_id, account_id, transaction_date, description, transaction_type, amount, category, payment_method) VALUES (?, ?, CURDATE(), ?, ?, ?, ?, ?)',
        [req.user.id, account_id, `Bill Payment: ${bill.name}`, 'Expense', billAmount, 'Bills', 'Bank Transfer']
      );
    }

    // Update bill status to paid
    await connection.execute(
      'UPDATE bills SET status = ? WHERE id = ? AND user_id = ?',
      ['paid', id, req.user.id]
    );

    await connection.commit();

    // Fetch updated bill
    const [updatedBill] = await pool.execute(
      'SELECT id, name, amount, due_date, status, created_at FROM bills WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Bill paid successfully',
      data: {
        bill: updatedBill[0]
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Pay bill error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to pay bill'
    });
  } finally {
    connection.release();
  }
};

// Mark bill as paid (without account deduction - for manual marking)
const markBillAsPaid = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if bill exists and belongs to user
    const [existingBills] = await pool.execute(
      'SELECT id, status FROM bills WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (existingBills.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }

    await pool.execute(
      'UPDATE bills SET status = ? WHERE id = ? AND user_id = ?',
      ['paid', id, req.user.id]
    );

    const [updatedBill] = await pool.execute(
      'SELECT id, name, amount, due_date, status, created_at FROM bills WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Bill marked as paid',
      data: {
        bill: updatedBill[0]
      }
    });
  } catch (error) {
    console.error('Mark bill as paid error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark bill as paid'
    });
  }
};

// Get bills summary
const getBillsSummary = async (req, res) => {
  try {
    // Get overall summary
    const [summary] = await pool.execute(
      `SELECT 
        COUNT(*) as total_bills,
        SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as pending_amount,
        SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as paid_amount,
        SUM(CASE WHEN status = 'overdue' THEN amount ELSE 0 END) as overdue_amount
       FROM bills 
       WHERE user_id = ?`,
      [req.user.id]
    );

    // Get upcoming bills (next 7 days)
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);

    const [upcomingBills] = await pool.execute(
      'SELECT name, amount, due_date FROM bills WHERE user_id = ? AND due_date <= ? AND due_date >= CURDATE() AND status = ? ORDER BY due_date ASC',
      [req.user.id, futureDate.toISOString().split('T')[0], 'pending']
    );

    // Get overdue bills
    const [overdueBills] = await pool.execute(
      'SELECT name, amount, due_date FROM bills WHERE user_id = ? AND due_date < CURDATE() AND status = ? ORDER BY due_date ASC',
      [req.user.id, 'pending']
    );

    res.json({
      success: true,
      data: {
        summary: summary[0],
        upcoming_bills: upcomingBills,
        overdue_bills: overdueBills
      }
    });
  } catch (error) {
    console.error('Get bills summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bills summary'
    });
  }
};

// Update overdue bills (should be run periodically)
const updateOverdueBills = async (req, res) => {
  try {
    await pool.execute(
      'UPDATE bills SET status = ? WHERE due_date < CURDATE() AND status = ?',
      ['overdue', 'pending']
    );

    res.json({
      success: true,
      message: 'Overdue bills updated successfully'
    });
  } catch (error) {
    console.error('Update overdue bills error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update overdue bills'
    });
  }
};

module.exports = {
  getBills,
  getBill,
  createBill,
  updateBill,
  deleteBill,
  payBill,
  markBillAsPaid,
  getBillsSummary,
  updateOverdueBills
};
