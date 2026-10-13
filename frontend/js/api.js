// MoneyVault Frontend API Utility
// This file provides a centralized way to interact with the backend API

class MoneyVaultAPI {
  constructor() {
    this.baseURL = 'http://localhost:3001/api';
    this.token = localStorage.getItem('moneyvault_token') || localStorage.getItem('savii_token'); // Support migration
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
    localStorage.setItem('moneyvault_token', token);
    // Remove old savii tokens for migration
    localStorage.removeItem('savii_token');
  }

  // Remove authentication token
  removeToken() {
    this.token = null;
    localStorage.removeItem('moneyvault_token');
    localStorage.removeItem('moneyvault_user');
    localStorage.removeItem('moneyvault_loggedIn');
    // Also remove old savii tokens for migration
    localStorage.removeItem('savii_token');
    localStorage.removeItem('savii_user');
    localStorage.removeItem('savii_loggedIn');
  }

  // Get authentication headers
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Generic API request method
  async request(endpoint, options = {}) {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const config = {
        headers: this.getHeaders(),
        ...options
      };

      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Request Error:', error);
      
      // Handle authentication errors
      if (error.message.includes('token') || error.message.includes('Unauthorized')) {
        this.removeToken();
        window.location.href = 'login.html';
      }
      
      throw error;
    }
  }

  // Authentication methods
  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async login(credentials) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });

    if (response.success && response.data.token) {
      this.setToken(response.data.token);
      localStorage.setItem('moneyvault_user', JSON.stringify(response.data.user));
      localStorage.setItem('moneyvault_loggedIn', 'true');
      // Remove old savii data for migration
      localStorage.removeItem('savii_user');
      localStorage.removeItem('savii_loggedIn');
    }

    return response;
  }

  async sendOTP(email) {
    return this.request('/auth/forgot-password/send-otp', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  }

  async resetPassword(resetData) {
    return this.request('/auth/forgot-password/reset', {
      method: 'POST',
      body: JSON.stringify(resetData)
    });
  }

  async getProfile() {
    return this.request('/auth/profile');
  }

  // Dashboard methods
  async getDashboardData() {
    return this.request('/dashboard');
  }

  async getFinancialOverview(period = 'month') {
    return this.request(`/dashboard/overview?period=${period}`);
  }

  // Account methods
  async getAccounts() {
    return this.request('/accounts');
  }

  async getAccount(id) {
    return this.request(`/accounts/${id}`);
  }

  async createAccount(accountData) {
    return this.request('/accounts', {
      method: 'POST',
      body: JSON.stringify(accountData)
    });
  }

  async updateAccount(id, accountData) {
    return this.request(`/accounts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(accountData)
    });
  }

  async deleteAccount(id) {
    return this.request(`/accounts/${id}`, {
      method: 'DELETE'
    });
  }

  async getAccountSummary() {
    return this.request('/accounts/summary');
  }

  // Transaction methods
  async getTransactions(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/transactions?${params}`);
  }

  async getTransaction(id) {
    return this.request(`/transactions/${id}`);
  }

  async createTransaction(transactionData) {
    return this.request('/transactions', {
      method: 'POST',
      body: JSON.stringify(transactionData)
    });
  }

  async updateTransaction(id, transactionData) {
    return this.request(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(transactionData)
    });
  }

  async deleteTransaction(id) {
    return this.request(`/transactions/${id}`, {
      method: 'DELETE'
    });
  }

  async getTransactionSummary(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/transactions/summary?${params}`);
  }

  // Budget methods
  async getBudgets() {
    return this.request('/budgets');
  }

  async getBudget(id) {
    return this.request(`/budgets/${id}`);
  }

  async createBudget(budgetData) {
    return this.request('/budgets', {
      method: 'POST',
      body: JSON.stringify(budgetData)
    });
  }

  async updateBudget(id, budgetData) {
    return this.request(`/budgets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(budgetData)
    });
  }

  async deleteBudget(id) {
    return this.request(`/budgets/${id}`, {
      method: 'DELETE'
    });
  }

  async getBudgetSummary() {
    return this.request('/budgets/summary');
  }

  async resetBudgets() {
    return this.request('/budgets/reset', {
      method: 'POST'
    });
  }

  // Bill methods
  async getBills(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/bills?${params}`);
  }

  async getBill(id) {
    return this.request(`/bills/${id}`);
  }

  async createBill(billData) {
    return this.request('/bills', {
      method: 'POST',
      body: JSON.stringify(billData)
    });
  }

  async updateBill(id, billData) {
    return this.request(`/bills/${id}`, {
      method: 'PUT',
      body: JSON.stringify(billData)
    });
  }

  async deleteBill(id) {
    return this.request(`/bills/${id}`, {
      method: 'DELETE'
    });
  }

  async payBill(id, accountId) {
    return this.request(`/bills/${id}/pay`, {
      method: 'PATCH',
      body: JSON.stringify({ account_id: accountId })
    });
  }

  async markBillAsPaid(id) {
    return this.request(`/bills/${id}/mark-paid`, {
      method: 'PATCH'
    });
  }

  async getBillsSummary() {
    return this.request('/bills/summary');
  }

  // EMI methods
  async getEMIs() {
    return this.request('/emis');
  }

  async getEMI(id) {
    return this.request(`/emis/${id}`);
  }

  async createEMI(emiData) {
    return this.request('/emis', {
      method: 'POST',
      body: JSON.stringify(emiData)
    });
  }

  async updateEMI(id, emiData) {
    return this.request(`/emis/${id}`, {
      method: 'PUT',
      body: JSON.stringify(emiData)
    });
  }

  async deleteEMI(id) {
    return this.request(`/emis/${id}`, {
      method: 'DELETE'
    });
  }

  async getEMISummary() {
    return this.request('/emis/summary');
  }

  // Utility methods
  isAuthenticated() {
    return !!this.token && (localStorage.getItem('moneyvault_loggedIn') === 'true' || localStorage.getItem('savii_loggedIn') === 'true');
  }

  logout() {
    this.removeToken();
    window.location.href = 'login.html';
  }
}

// Create global API instance
const api = new MoneyVaultAPI();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MoneyVaultAPI;
}
