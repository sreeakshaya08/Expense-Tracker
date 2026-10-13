// Test bill payment functionality
const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3001/api';
let authToken = '';

async function testBillPayment() {
  console.log('🧪 Testing MoneyVault Bill Payment...');
  
  try {
    // 1. Login first
    console.log('1. Logging in...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@moneyvault.com',
        password: 'password123'
      })
    });
    
    const loginData = await loginResponse.json();
    if (!loginData.success) {
      throw new Error('Login failed: ' + loginData.message);
    }
    
    authToken = loginData.data.token;
    console.log('✅ Login successful');
    
    // 2. Create a test account
    console.log('2. Creating test account...');
    const accountResponse = await fetch(`${API_BASE}/accounts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        name: 'Test Savings',
        bank_name: 'Test Bank',
        balance: 5000
      })
    });
    
    const accountData = await accountResponse.json();
    if (!accountData.success) {
      console.log('⚠️ Account creation failed (might already exist):', accountData.message);
    } else {
      console.log('✅ Test account created');
    }
    
    // 3. Get accounts to find one with balance
    console.log('3. Getting accounts...');
    const getAccountsResponse = await fetch(`${API_BASE}/accounts`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    const accountsData = await getAccountsResponse.json();
    if (!accountsData.success || accountsData.data.accounts.length === 0) {
      throw new Error('No accounts found');
    }
    
    const testAccount = accountsData.data.accounts.find(acc => parseFloat(acc.balance) >= 100);
    if (!testAccount) {
      throw new Error('No account with sufficient balance found');
    }
    
    console.log(`✅ Found account: ${testAccount.name} with balance ₹${testAccount.balance}`);
    
    // 4. Create a test bill
    console.log('4. Creating test bill...');
    const billResponse = await fetch(`${API_BASE}/bills`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        name: 'Test Electricity Bill',
        amount: 150,
        due_date: '2025-06-20'
      })
    });
    
    const billData = await billResponse.json();
    if (!billData.success) {
      throw new Error('Bill creation failed: ' + billData.message);
    }
    
    const testBill = billData.data.bill;
    console.log(`✅ Test bill created: ${testBill.name} - ₹${testBill.amount}`);
    
    // 5. Get transactions before payment
    console.log('5. Getting transactions before payment...');
    const transactionsBefore = await fetch(`${API_BASE}/transactions`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    const transactionsBeforeData = await transactionsBefore.json();
    const countBefore = transactionsBeforeData.success ? transactionsBeforeData.data.transactions.length : 0;
    console.log(`📊 Transactions before payment: ${countBefore}`);
    
    // 6. Pay the bill
    console.log('6. Paying the bill...');
    const paymentResponse = await fetch(`${API_BASE}/bills/${testBill.id}/pay`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        account_id: testAccount.id
      })
    });
    
    const paymentData = await paymentResponse.json();
    if (!paymentData.success) {
      throw new Error('Bill payment failed: ' + paymentData.message);
    }
    
    console.log('✅ Bill payment successful');
    
    // 7. Check transactions after payment
    console.log('7. Checking transactions after payment...');
    const transactionsAfter = await fetch(`${API_BASE}/transactions`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    const transactionsAfterData = await transactionsAfter.json();
    if (transactionsAfterData.success) {
      const countAfter = transactionsAfterData.data.transactions.length;
      console.log(`📊 Transactions after payment: ${countAfter}`);
      
      if (countAfter > countBefore) {
        console.log('✅ New transaction created for bill payment!');
        
        // Find the bill payment transaction
        const billTransaction = transactionsAfterData.data.transactions.find(t => 
          t.description.includes('Bill Payment') && t.description.includes(testBill.name)
        );
        
        if (billTransaction) {
          console.log(`💰 Bill payment transaction found:`);
          console.log(`   Description: ${billTransaction.description}`);
          console.log(`   Amount: ₹${billTransaction.amount}`);
          console.log(`   Type: ${billTransaction.type}`);
          console.log(`   Category: ${billTransaction.category}`);
          console.log(`   Date: ${billTransaction.date}`);
        }
      } else {
        console.log('❌ No new transaction was created for bill payment');
      }
    }
    
    // 8. Check account balance
    console.log('8. Checking updated account balance...');
    const updatedAccountResponse = await fetch(`${API_BASE}/accounts`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    const updatedAccountsData = await updatedAccountResponse.json();
    if (updatedAccountsData.success) {
      const updatedAccount = updatedAccountsData.data.accounts.find(acc => acc.id === testAccount.id);
      if (updatedAccount) {
        const oldBalance = parseFloat(testAccount.balance);
        const newBalance = parseFloat(updatedAccount.balance);
        const difference = oldBalance - newBalance;
        
        console.log(`💳 Account balance updated:`);
        console.log(`   Old balance: ₹${oldBalance}`);
        console.log(`   New balance: ₹${newBalance}`);
        console.log(`   Difference: ₹${difference}`);
        
        if (Math.abs(difference - testBill.amount) < 0.01) {
          console.log('✅ Account balance correctly deducted!');
        } else {
          console.log('❌ Account balance deduction incorrect');
        }
      }
    }
    
    console.log('\n🎉 Bill payment test completed successfully!');
    
  } catch (error) {
    console.error('❌ Bill payment test failed:', error.message);
  }
}

testBillPayment();
