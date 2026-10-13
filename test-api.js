// Test script to verify MoneyVault API is working
const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3001/api';

async function testAPI() {
  console.log('🧪 Testing MoneyVault API...');
  
  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch('http://localhost:3001/health');
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData.message);
    
    // Test registration
    console.log('2. Testing user registration...');
    const testUser = {
      firstname: 'Test',
      lastname: 'User',
      email: 'test@moneyvault.com',
      password: 'password123'
    };
    
    const registerResponse = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testUser)
    });
    
    const registerData = await registerResponse.json();
    
    if (registerData.success) {
      console.log('✅ Registration successful:', registerData.message);
      
      // Test login
      console.log('3. Testing user login...');
      const loginResponse = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: testUser.email,
          password: testUser.password
        })
      });
      
      const loginData = await loginResponse.json();
      
      if (loginData.success) {
        console.log('✅ Login successful');
        console.log('🎉 MoneyVault API is working perfectly!');
        console.log('🌐 You can now use the web interface at: file:///D:/cse-A-mini%20project/login.html');
      } else {
        console.log('❌ Login failed:', loginData.message);
      }
    } else {
      console.log('⚠️ Registration response:', registerData.message);
      // If user already exists, try login
      if (registerData.message && registerData.message.includes('already exists')) {
        console.log('3. User exists, testing login...');
        const loginResponse = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: testUser.email,
            password: testUser.password
          })
        });
        
        const loginData = await loginResponse.json();
        
        if (loginData.success) {
          console.log('✅ Login successful with existing user');
          console.log('🎉 MoneyVault API is working perfectly!');
        } else {
          console.log('❌ Login failed:', loginData.message);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
  }
}

testAPI();
