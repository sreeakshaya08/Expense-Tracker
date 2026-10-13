const { pool } = require('../config/database');

// Get all budgets for user
const getBudgets = async (req, res) => {
  try {
    const [budgets] = await pool.execute(
      'SELECT id, category_name, limit_amount, spent_amount, created_at FROM budgets WHERE user_id = ? ORDER BY category_name',
      [req.user.id]
    );

    res.json({
      success: true,
      data: {
        budgets
      }
    });
  } catch (error) {
    console.error('Get budgets error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch budgets'
    });
  }
};

// Get single budget
const getBudget = async (req, res) => {
  try {
    const { id } = req.params;

    const [budgets] = await pool.execute(
      'SELECT id, category_name, limit_amount, spent_amount, created_at FROM budgets WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (budgets.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    res.json({
      success: true,
      data: {
        budget: budgets[0]
      }
    });
  } catch (error) {
    console.error('Get budget error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch budget'
    });
  }
};

// Create new budget
const createBudget = async (req, res) => {
  try {
    const { category_name, limit_amount, spent_amount = 0 } = req.body;

    // Check if budget for this category already exists
    const [existingBudgets] = await pool.execute(
      'SELECT id FROM budgets WHERE user_id = ? AND category_name = ?',
      [req.user.id, category_name]
    );

    if (existingBudgets.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Budget for this category already exists'
      });
    }

    const [result] = await pool.execute(
      'INSERT INTO budgets (user_id, category_name, limit_amount, spent_amount) VALUES (?, ?, ?, ?)',
      [req.user.id, category_name, parseFloat(limit_amount), parseFloat(spent_amount)]
    );

    const [newBudget] = await pool.execute(
      'SELECT id, category_name, limit_amount, spent_amount, created_at FROM budgets WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Budget created successfully',
      data: {
        budget: newBudget[0]
      }
    });
  } catch (error) {
    console.error('Create budget error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create budget'
    });
  }
};

// Update budget
const updateBudget = async (req, res) => {
  try {
    const { id } = req.params;
    const { category_name, limit_amount, spent_amount } = req.body;

    // Check if budget exists and belongs to user
    const [existingBudgets] = await pool.execute(
      'SELECT id, category_name FROM budgets WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (existingBudgets.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    // If category name is being changed, check if new category already exists
    if (category_name && category_name !== existingBudgets[0].category_name) {
      const [duplicateBudgets] = await pool.execute(
        'SELECT id FROM budgets WHERE user_id = ? AND category_name = ? AND id != ?',
        [req.user.id, category_name, id]
      );

      if (duplicateBudgets.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Budget for this category already exists'
        });
      }
    }

    // Build update query dynamically
    const updates = [];
    const params = [];

    if (category_name !== undefined) {
      updates.push('category_name = ?');
      params.push(category_name);
    }
    if (limit_amount !== undefined) {
      updates.push('limit_amount = ?');
      params.push(parseFloat(limit_amount));
    }
    if (spent_amount !== undefined) {
      updates.push('spent_amount = ?');
      params.push(parseFloat(spent_amount));
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    params.push(id, req.user.id);

    await pool.execute(
      `UPDATE budgets SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`,
      params
    );

    const [updatedBudget] = await pool.execute(
      'SELECT id, category_name, limit_amount, spent_amount, created_at FROM budgets WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Budget updated successfully',
      data: {
        budget: updatedBudget[0]
      }
    });
  } catch (error) {
    console.error('Update budget error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update budget'
    });
  }
};

// Delete budget
const deleteBudget = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if budget exists and belongs to user
    const [existingBudgets] = await pool.execute(
      'SELECT id FROM budgets WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (existingBudgets.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    await pool.execute(
      'DELETE FROM budgets WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    res.json({
      success: true,
      message: 'Budget deleted successfully'
    });
  } catch (error) {
    console.error('Delete budget error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete budget'
    });
  }
};

// Get budget summary
const getBudgetSummary = async (req, res) => {
  try {
    const [summary] = await pool.execute(
      `SELECT 
        COUNT(*) as total_budgets,
        SUM(limit_amount) as total_limit,
        SUM(spent_amount) as total_spent,
        SUM(CASE WHEN spent_amount > limit_amount THEN 1 ELSE 0 END) as over_budget_count
       FROM budgets 
       WHERE user_id = ?`,
      [req.user.id]
    );

    // Get budgets that are over limit
    const [overBudgets] = await pool.execute(
      'SELECT category_name, limit_amount, spent_amount FROM budgets WHERE user_id = ? AND spent_amount > limit_amount',
      [req.user.id]
    );

    res.json({
      success: true,
      data: {
        summary: summary[0],
        over_budget_categories: overBudgets
      }
    });
  } catch (error) {
    console.error('Get budget summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch budget summary'
    });
  }
};

// Reset all budget spent amounts (useful for monthly reset)
const resetBudgets = async (req, res) => {
  try {
    await pool.execute(
      'UPDATE budgets SET spent_amount = 0 WHERE user_id = ?',
      [req.user.id]
    );

    res.json({
      success: true,
      message: 'All budgets reset successfully'
    });
  } catch (error) {
    console.error('Reset budgets error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset budgets'
    });
  }
};

module.exports = {
  getBudgets,
  getBudget,
  createBudget,
  updateBudget,
  deleteBudget,
  getBudgetSummary,
  resetBudgets
};
