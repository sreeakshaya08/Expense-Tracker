// Simple API test script for Savii Backend
// Run this script to test if the backend is working correctly
// Usage: node test-api.js

const https = require('http');

const BASE_URL = 'http://localhost:3000';

// Helper function to make HTTP requests
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({
            status: res.statusCode,
            data: jsonBody
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: body
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Test functions
async function testHealthEndpoint() {
  console.log('🔍 Testing health endpoint...');
  try {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/health',
      method: 'GET'
    };

    const response = await makeRequest(options);
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ Health endpoint working');
      return true;
    } else {
      console.log('❌ Health endpoint failed:', response);
      return false;
    }
  } catch (error) {
    console.log('❌ Health endpoint error:', error.message);
    return false;
  }
}

async function testUserRegistration() {
  console.log('🔍 Testing user registration...');
  try {
    const testUser = {
      email: `test${Date.now()}@example.com`,
      password: 'password123',
      firstname: 'Test',
      lastname: 'User'
    };

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/register',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const response = await makeRequest(options, testUser);
    
    if (response.status === 201 && response.data.success) {
      console.log('✅ User registration working');
      return { success: true, token: response.data.data.token };
    } else {
      console.log('❌ User registration failed:', response.data);
      return { success: false };
    }
  } catch (error) {
    console.log('❌ User registration error:', error.message);
    return { success: false };
  }
}

async function testUserLogin() {
  console.log('🔍 Testing user login...');
  try {
    // First register a user
    const testUser = {
      email: `login${Date.now()}@example.com`,
      password: 'password123',
      firstname: 'Login',
      lastname: 'Test'
    };

    // Register
    const registerOptions = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/register',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    await makeRequest(registerOptions, testUser);

    // Now try to login
    const loginOptions = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const loginData = {
      email: testUser.email,
      password: testUser.password
    };

    const response = await makeRequest(loginOptions, loginData);
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ User login working');
      return { success: true, token: response.data.data.token };
    } else {
      console.log('❌ User login failed:', response.data);
      return { success: false };
    }
  } catch (error) {
    console.log('❌ User login error:', error.message);
    return { success: false };
  }
}

async function testProtectedEndpoint(token) {
  console.log('🔍 Testing protected endpoint...');
  try {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/dashboard',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    const response = await makeRequest(options);
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ Protected endpoint working');
      return true;
    } else {
      console.log('❌ Protected endpoint failed:', response.data);
      return false;
    }
  } catch (error) {
    console.log('❌ Protected endpoint error:', error.message);
    return false;
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Savii Backend API Tests\n');

  let allTestsPassed = true;

  // Test 1: Health endpoint
  const healthTest = await testHealthEndpoint();
  allTestsPassed = allTestsPassed && healthTest;

  console.log('');

  // Test 2: User registration
  const registrationTest = await testUserRegistration();
  allTestsPassed = allTestsPassed && registrationTest.success;

  console.log('');

  // Test 3: User login
  const loginTest = await testUserLogin();
  allTestsPassed = allTestsPassed && loginTest.success;

  console.log('');

  // Test 4: Protected endpoint (if login was successful)
  if (loginTest.success && loginTest.token) {
    const protectedTest = await testProtectedEndpoint(loginTest.token);
    allTestsPassed = allTestsPassed && protectedTest;
  } else {
    console.log('⏭️  Skipping protected endpoint test (login failed)');
    allTestsPassed = false;
  }

  console.log('\n' + '='.repeat(50));
  
  if (allTestsPassed) {
    console.log('🎉 All tests passed! Backend is working correctly.');
  } else {
    console.log('❌ Some tests failed. Please check the backend configuration.');
  }

  console.log('='.repeat(50));
}

// Check if server is running before starting tests
async function checkServerRunning() {
  try {
    await testHealthEndpoint();
    return true;
  } catch (error) {
    return false;
  }
}

// Start tests
(async () => {
  const serverRunning = await checkServerRunning();
  
  if (!serverRunning) {
    console.log('❌ Backend server is not running!');
    console.log('Please start the server first: npm run dev');
    process.exit(1);
  }

  await runTests();
})();
