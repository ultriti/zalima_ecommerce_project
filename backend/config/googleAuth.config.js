const { OAuth2Client } = require('google-auth-library');
const dotenv = require('dotenv');

dotenv.config();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  throw new Error('Google Client ID or Secret is missing in environment variables');
}

const createOAuth2Client = (redirectUri) => {
    console.log('Exact redirect URI being sent to Google:', redirectUri);

  if (!redirectUri || !/^https?:\/\/[^\s$.?#].[^\s]*$/.test(redirectUri)) {
    throw new Error('Invalid or missing redirect URI');
  }
  console.log('Exact redirect URI being sent to Google:', redirectUri);

  const normalizedUri = redirectUri.replace(/\/$/, ''); // Remove trailing slash
  console.log('Creating OAuth2 client with redirect URI:', normalizedUri);
  
  return new OAuth2Client(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    normalizedUri
  );
};

module.exports = { createOAuth2Client };