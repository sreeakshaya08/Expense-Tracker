const { pool } = require('../config/database');

// Get all EMIs for user
const getEMIs = async (req, res) => {
  try {
    const [emis] = await pool.execute(
      'SELECT id, name, amount, created_at FROM emis WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );

    res.json({
      success: true,
      data: {
        emis
      }
    });
  } catch (error) {
    console.error('Get EMIs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch EMIs'
    });
  }
};

// Get single EMI
const getEMI = async (req, res) => {
  try {
    const { id } = req.params;

    const [emis] = await pool.execute(
      'SELECT id, name, amount, created_at FROM emis WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (emis.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'EMI not found'
      });
    }

    res.json({
      success: true,
      data: {
        emi: emis[0]
      }
    });
  } catch (error) {
    console.error('Get EMI error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch EMI'
    });
  }
};

// Create new EMI
const createEMI = async (req, res) => {
  try {
    const { name, amount } = req.body;

    const [result] = await pool.execute(
      'INSERT INTO emis (user_id, name, amount) VALUES (?, ?, ?)',
      [req.user.id, name, parseFloat(amount)]
    );

    const [newEMI] = await pool.execute(
      'SELECT id, name, amount, created_at FROM emis WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'EMI created successfully',
      data: {
        emi: newEMI[0]
      }
    });
  } catch (error) {
    console.error('Create EMI error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create EMI'
    });
  }
};

// Update EMI
const updateEMI = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, amount } = req.body;

    // Check if EMI exists and belongs to user
    const [existingEMIs] = await pool.execute(
      'SELECT id FROM emis WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (existingEMIs.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'EMI not found'
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

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    params.push(id, req.user.id);

    await pool.execute(
      `UPDATE emis SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`,
      params
    );

    const [updatedEMI] = await pool.execute(
      'SELECT id, name, amount, created_at FROM emis WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'EMI updated successfully',
      data: {
        emi: updatedEMI[0]
      }
    });
  } catch (error) {
    console.error('Update EMI error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update EMI'
    });
  }
};

// Delete EMI
const deleteEMI = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if EMI exists and belongs to user
    const [existingEMIs] = await pool.execute(
      'SELECT id FROM emis WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (existingEMIs.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'EMI not found'
      });
    }

    await pool.execute(
      'DELETE FROM emis WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    res.json({
      success: true,
      message: 'EMI deleted successfully'
    });
  } catch (error) {
    console.error('Delete EMI error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete EMI'
    });
  }
};

// Get EMI summary
const getEMISummary = async (req, res) => {
  try {
    const [summary] = await pool.execute(
      `SELECT 
        COUNT(*) as total_emis,
        SUM(amount) as total_monthly_amount
       FROM emis 
       WHERE user_id = ?`,
      [req.user.id]
    );

    res.json({
      success: true,
      data: {
        summary: summary[0]
      }
    });
  } catch (error) {
    console.error('Get EMI summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch EMI summary'
    });
  }
};

module.exports = {
  getEMIs,
  getEMI,
  createEMI,
  updateEMI,
  deleteEMI,
  getEMISummary
};
