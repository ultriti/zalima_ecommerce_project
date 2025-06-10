const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;

// Exchange authorization code for access token
exports.getAccessToken = async (code, redirectUri) => {
  try {
    console.log(`Exchanging code for token with redirect URI: ${redirectUri}`);

    const tokenUrl = `https://graph.facebook.com/v16.0/oauth/access_token?client_id=${FACEBOOK_APP_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${FACEBOOK_APP_SECRET}&code=${code}`;

    const response = await axios.get(tokenUrl);
    console.log('Token exchange successful');
    return response.data.access_token;
  } catch (error) {
    console.error('Facebook token exchange error:', error.response?.data || error.message);
    console.error('Request details:', {
      appId: FACEBOOK_APP_ID ? 'Set' : 'Not set',
      appSecret: FACEBOOK_APP_SECRET ? 'Set' : 'Not set',
      redirectUri: redirectUri
    });
    throw new Error('Failed to exchange Facebook authorization code for access token');
  }
};

// Get user profile information
exports.getUserProfile = async (accessToken) => {
  try {
    const profileUrl = `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${accessToken}`;

    const response = await axios.get(profileUrl);
    console.log('Profile fetch successful:', response.data.name);
    return response.data;
  } catch (error) {
    console.error('Facebook profile fetch error:', error.response?.data || error.message);
    throw new Error('Failed to fetch Facebook user profile');
  }
};