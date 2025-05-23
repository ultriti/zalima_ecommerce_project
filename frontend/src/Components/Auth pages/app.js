import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_BASE_URI || "http://localhost:5000",
    withCredentials: true
});

export const googleAuth = async (code, redirectUri) => {
  try {
    console.log('Using exact redirect URI:', redirectUri);
    
    const response = await axios.post(
      `${import.meta.env.VITE_BASE_URI}/api/users/google`,
      {
        code,
        redirectUri
      },
      { withCredentials: true }
    );
    
    console.log('Google auth response:', response.data);
    
    if (!response.data) {
      throw new Error('Empty response from server');
    }
    
    return {
      token: response.data.token,
      user_data: {
        _id: response.data._id || response.data.user_data?._id,
        name: response.data.name || response.data.user_data?.name,
        email: response.data.email || response.data.user_data?.email,
        role: response.data.role || response.data.user_data?.role || 'user'
      }
    };
  } catch (error) {
    console.error('Google auth error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw error;
  }
};

// Function to initiate Google OAuth flow with full page redirect
export const initiateGoogleAuth = (redirectUri) => {
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  
  // Add state parameter for security
  const state = Math.random().toString(36).substring(2, 15);
  localStorage.setItem('oauth_state', state);
  
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=email%20profile&prompt=consent&state=${state}&access_type=offline`;
  
  console.log(`Redirecting to: ${googleAuthUrl.substring(0, 100)}...`);
  window.location.href = googleAuthUrl;
};

// Function for Facebook authentication
export const facebookAuth = async (code, redirectUri) => {
  try {
    console.log('Using Facebook redirect URI:', redirectUri);
    
    const response = await axios.post(
      `${import.meta.env.VITE_BASE_URI}/api/users/facebook`,
      {
        code,
        redirectUri
      },
      { withCredentials: true }
    );
    
    console.log('Facebook auth response:', response.data);
    
    if (!response.data) {
      throw new Error('Empty response from server');
    }
    
    return {
      token: response.data.token,
      user_data: {
        _id: response.data._id || response.data.user_data?._id,
        name: response.data.name || response.data.user_data?.name,
        email: response.data.email || response.data.user_data?.email,
        role: response.data.role || response.data.user_data?.role || 'user'
      }
    };
  } catch (error) {
    console.error('Facebook auth error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw error;
  }
};

// Function to initiate Facebook OAuth flow
export const initiateFacebookAuth = (redirectUri) => {
  const FACEBOOK_APP_ID = import.meta.env.VITE_FACEBOOK_APP_ID;
  
  // Add state parameter for security
  const state = Math.random().toString(36).substring(2, 15);
  localStorage.setItem('oauth_state', state);
  
  const facebookAuthUrl = `https://www.facebook.com/v16.0/dialog/oauth?client_id=${FACEBOOK_APP_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=email,public_profile`;
  
  console.log(`Redirecting to Facebook: ${facebookAuthUrl.substring(0, 100)}...`);
  window.location.href = facebookAuthUrl;
};

// Function to handle admin login
export const adminLogin = async (credentials) => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_BASE_URI}/api/users/admin-login`,
      credentials,
      { withCredentials: true }
    );
    
    console.log('Admin login response:', response.data);
    
    if (!response.data) {
      throw new Error('Empty response from server');
    }
    
    return {
      token: response.data.token,
      user: response.data.user
    };
  } catch (error) {
    console.error('Admin login error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw error;
  }
};