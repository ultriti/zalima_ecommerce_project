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
  const result = await apiRequest('/api/users/otp/send', 'POST', {
    email: TEST_EMAIL
  });

  if (result.data.otp) {
    savedOTP = result.data.otp;
  } else {
    savedOTP = prompt('Please check your email and enter the OTP: ');
  }
}


async function testVerifyOTP() {
  if (!savedOTP) {
    res.status(400).json({message:"No OTP available to verify"})
    return;
  }
  const result = await apiRequest('/api/users/otp/verify', 'POST', {
    email: TEST_EMAIL,
    otp: savedOTP
  });

  if (result.data.token) {
    userToken = result.data.token;
    res.status(200).json({message:'✅ Successfully verified OTP and received token'})
  } else {
    res.status(400).json({message:"❌ Failed to verify OTP"})
  }
}


async function testForgotPassword() {
  const result = await apiRequest('/api/users/forgot-password', 'POST', {
    email: TEST_EMAIL
  });



  res.status(200).json({message:'✅ Check your email for the reset link'})
}


// Main test runner
async function runTests() {
  // Test OTP flow
  await testSendOTP();
  await testVerifyOTP();


  // Test password reset flow
  await testForgotPassword();
}


// Run the tests
runTests();