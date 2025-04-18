// Your Google Client ID
const GOOGLE_CLIENT_ID = '655188747640-6n6gku3eotrfjff45qpfv3en1i9h8kge.apps.googleusercontent.com';
// Use a hardcoded redirect URI to ensure it matches exactly what's in Google Cloud Console
const REDIRECT_URI = 'http://localhost:5000/social-login-test.html';
const BACKEND_URL = 'http://localhost:5000';

// Facebook App ID - You'll need to create this in Facebook Developer Console
const FACEBOOK_APP_ID = '3931105830487499'; // Replace with your Facebook App ID

// Debug function
function debug(message) {
  const debugElement = document.getElementById('debugInfo');
  const timestamp = new Date().toISOString().substr(11, 8);
  debugElement.innerHTML += `<p>[${timestamp}] ${message}</p>`;
  console.log(`[${timestamp}] ${message}`);
}

debug('Page loaded');

// Check for auth code in URL (after redirect)
window.onload = function() {
  debug('Window loaded, checking for code parameter');
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  const error = urlParams.get('error');
  
  // Check if this is a Facebook redirect
  const state = urlParams.get('state');
  const isFacebookRedirect = state && state.startsWith('fb_');
  
  if (error) {
    debug(`OAuth error: ${error}`);
    document.getElementById('response').textContent = 'OAuth Error: ' + error;
    return;
  }
  
  if (code) {
    debug(`Code found in URL: ${code.substring(0, 10)}...`);
    document.getElementById('response').textContent = 'Received code: ' + code.substring(0, 10) + '...';
    
    // Determine which endpoint to call based on the state parameter
    const endpoint = isFacebookRedirect ? 'facebook' : 'google';
    debug(`Detected ${endpoint} authentication flow`);
    
    // Send code to backend
    debug(`Sending code to backend (${endpoint})...`);
    fetch(`${BACKEND_URL}/api/users/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        code: code,
        redirectUri: REDIRECT_URI 
      })
    })
    .then(response => {
      debug(`Response status: ${response.status}`);
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      debug('Response data received');
      document.getElementById('response').textContent = JSON.stringify(data, null, 2);
      // Clear the URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    })
    .catch(error => {
      debug(`Error: ${error.message}`);
      document.getElementById('response').textContent = 'Error: ' + error.message;
    });
  } else {
    debug('No code parameter found in URL');
  }
};

// Google login button
document.getElementById('googleLogin').addEventListener('click', function() {
  debug('Google login button clicked');
  
  // Add state parameter for security
  const state = Math.random().toString(36).substring(2, 15);
  localStorage.setItem('oauth_state', state);
  
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=email%20profile&prompt=consent&state=${state}&access_type=offline`;
  
  debug(`Redirecting to: ${googleAuthUrl.substring(0, 100)}...`);
  window.location.href = googleAuthUrl;
});

// Facebook login button
document.getElementById('facebookLogin').addEventListener('click', function() {
  debug('Facebook login button clicked');
  
  // Add state parameter for security (prefix with fb_ to identify Facebook flow)
  const state = 'fb_' + Math.random().toString(36).substring(2, 15);
  localStorage.setItem('oauth_state', state);
  
  const facebookAuthUrl = `https://www.facebook.com/v16.0/dialog/oauth?client_id=${FACEBOOK_APP_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&state=${state}&scope=email,public_profile`;
  
  debug(`Redirecting to: ${facebookAuthUrl.substring(0, 100)}...`);
  window.location.href = facebookAuthUrl;
});