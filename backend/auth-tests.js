const fetch = require('node-fetch');
const prompt = require('prompt-sync')({ sigint: true });

// Configuration
const BASE_URL = 'http://localhost:5000';
const TEST_EMAIL = '0011abhinav@gmail.com'; // Use a real email you can access
let savedOTP = null;
let userToken = null;

// Helper function for API requests
async function apiRequest(endpoint, method, body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  if (userToken) {
    options.headers['Authorization'] = `Bearer ${userToken}`;
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    console.error(`Error with ${method} ${endpoint}:`, error);
    return { status: 500, data: { error: error.message } };
  }
}

// Test functions
async function testSendOTP() {
  console.log('\n🔹 TESTING: Send OTP');
  const result = await apiRequest('/api/users/otp/send', 'POST', {
    email: TEST_EMAIL
  });
  
  console.log(`Status: ${result.status}`);
  console.log('Response:', result.data);
  
  if (result.data.otp) {
    savedOTP = result.data.otp;
    console.log(`✅ OTP received: ${savedOTP}`);
  } else {
    console.log('⚠️ No OTP in response (expected in production)');
    savedOTP = prompt('Please check your email and enter the OTP: ');
  }
}

async function testVerifyOTP() {
  console.log('\n🔹 TESTING: Verify OTP');
  if (!savedOTP) {
    console.log('❌ No OTP available to verify');
    return;
  }
  
  const result = await apiRequest('/api/users/otp/verify', 'POST', {
    email: TEST_EMAIL,
    otp: savedOTP
  });
  
  console.log(`Status: ${result.status}`);
  console.log('Response:', result.data);
  
  if (result.data.token) {
    userToken = result.data.token;
    console.log('✅ Successfully verified OTP and received token');
  } else {
    console.log('❌ Failed to verify OTP');
  }
}

async function testForgotPassword() {
  console.log('\n🔹 TESTING: Forgot Password');
  const result = await apiRequest('/api/users/forgot-password', 'POST', {
    email: TEST_EMAIL
  });
  
  console.log(`Status: ${result.status}`);
  console.log('Response:', result.data);
  console.log('✅ Check your email for the reset link');
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting Auth Flow Tests');
  
  // Test OTP flow
  await testSendOTP();
  await testVerifyOTP();
  
  // Test password reset flow
  await testForgotPassword();
  
  console.log('\n🏁 Tests completed!');
}

// Run the tests
runTests();