const { pool } = require('../config/database');

// Get dashboard data
const getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    // Get total balance across all accounts
    const [accountSummary] = await pool.execute(
      'SELECT COALESCE(SUM(current_balance), 0) as total_balance FROM accounts WHERE user_id = ?',
      [userId]
    );

    // Get monthly income and expenses
    const [transactionSummary] = await pool.execute(
      `SELECT
        transaction_type as type,
        SUM(amount) as total
       FROM transactions
       WHERE user_id = ? AND transaction_date >= ? AND transaction_date <= ?
       GROUP BY transaction_type`,
      [userId, firstDayOfMonth.toISOString().split('T')[0], lastDayOfMonth.toISOString().split('T')[0]]
    );

    let monthlyIncome = 0;
    let monthlyExpenses = 0;

    transactionSummary.forEach(item => {
      if (item.type === 'Income') {
        monthlyIncome = parseFloat(item.total);
      } else if (item.type === 'Expense') {
        monthlyExpenses = parseFloat(item.total);
      }
    });

    // Get recent transactions (last 5)
    const [recentTransactions] = await pool.execute(
      `SELECT t.id, t.transaction_date as date, t.description, t.transaction_type as type, t.amount, t.category, a.account_name as account_name
       FROM transactions t
       LEFT JOIN accounts a ON t.account_id = a.id
       WHERE t.user_id = ?
       ORDER BY t.transaction_date DESC, t.created_at DESC
       LIMIT 5`,
      [userId]
    );

    // Get budget overview
    const [budgetSummary] = await pool.execute(
      `SELECT 
        SUM(limit_amount) as total_budget,
        SUM(spent_amount) as total_spent
       FROM budgets 
       WHERE user_id = ?`,
      [userId]
    );

    const totalBudget = parseFloat(budgetSummary[0]?.total_budget || 0);
    const totalSpent = parseFloat(budgetSummary[0]?.total_spent || 0);
    const budgetUsedPercent = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0;

    // Get upcoming bills (next 7 days)
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);

    const [upcomingBills] = await pool.execute(
      'SELECT name, amount, due_date FROM bills WHERE user_id = ? AND due_date <= ? AND due_date >= CURDATE() AND status = ? ORDER BY due_date ASC LIMIT 3',
      [userId, futureDate.toISOString().split('T')[0], 'pending']
    );

    // Get total EMI amount
    const [emiSummary] = await pool.execute(
      'SELECT COALESCE(SUM(amount), 0) as total_emi FROM emis WHERE user_id = ?',
      [userId]
    );

    // Get accounts count
    const [accountCount] = await pool.execute(
      'SELECT COUNT(*) as count FROM accounts WHERE user_id = ?',
      [userId]
    );

    // Financial tips
    const financialTips = [
      "Track your spending daily to stay on budget!",
      "Save before you spend - pay yourself first.",
      "Create an emergency fund for unexpected expenses.",
      "Invest in your future today for long-term wealth.",
      "Review and cancel unused subscriptions regularly.",
      "Set specific financial goals and track your progress.",
      "Compare prices before making large purchases.",
      "Use the 50/30/20 rule: 50% needs, 30% wants, 20% savings.",
      "Automate your savings to build wealth consistently.",
      "Review your budget monthly and adjust as needed."
    ];

    const randomTip = financialTips[Math.floor(Math.random() * financialTips.length)];

    res.json({
      success: true,
      data: {
        summary: {
          total_balance: parseFloat(accountSummary[0].total_balance),
          monthly_income: monthlyIncome,
          monthly_expenses: monthlyExpenses,
          total_budget: totalBudget,
          total_spent: totalSpent,
          budget_used_percent: budgetUsedPercent,
          total_emi: parseFloat(emiSummary[0].total_emi),
          accounts_count: accountCount[0].count
        },
        recent_transactions: recentTransactions,
        upcoming_bills: upcomingBills,
        financial_tip: randomTip
      }
    });
  } catch (error) {
    console.error('Get dashboard data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data'
    });
  }
};

// Get financial overview for charts/graphs
const getFinancialOverview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = 'month' } = req.query; // month, quarter, year

    let startDate, endDate;
    const currentDate = new Date();

    switch (period) {
      case 'quarter':
        const quarterStart = new Date(currentDate.getFullYear(), Math.floor(currentDate.getMonth() / 3) * 3, 1);
        startDate = quarterStart;
        endDate = new Date(quarterStart.getFullYear(), quarterStart.getMonth() + 3, 0);
        break;
      case 'year':
        startDate = new Date(currentDate.getFullYear(), 0, 1);
        endDate = new Date(currentDate.getFullYear(), 11, 31);
        break;
      default: // month
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    }

    // Get income vs expenses by month
    const [monthlyData] = await pool.execute(
      `SELECT
        DATE_FORMAT(transaction_date, '%Y-%m') as month,
        transaction_type as type,
        SUM(amount) as total
       FROM transactions
       WHERE user_id = ? AND transaction_date >= ? AND transaction_date <= ?
       GROUP BY DATE_FORMAT(transaction_date, '%Y-%m'), transaction_type
       ORDER BY month`,
      [userId, startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]]
    );

    // Get expenses by category
    const [categoryData] = await pool.execute(
      `SELECT
        COALESCE(category, 'Uncategorized') as category,
        SUM(amount) as total
       FROM transactions
       WHERE user_id = ? AND transaction_type = 'Expense' AND transaction_date >= ? AND transaction_date <= ?
       GROUP BY category
       ORDER BY total DESC`,
      [userId, startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]]
    );

    // Get budget vs actual spending
    const [budgetComparison] = await pool.execute(
      `SELECT 
        category_name,
        limit_amount,
        spent_amount
       FROM budgets 
       WHERE user_id = ?
       ORDER BY category_name`,
      [userId]
    );

    res.json({
      success: true,
      data: {
        period,
        monthly_data: monthlyData,
        category_data: categoryData,
        budget_comparison: budgetComparison
      }
    });
  } catch (error) {
    console.error('Get financial overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch financial overview'
    });
  }
};

module.exports = {
  getDashboardData,
  getFinancialOverview
};
