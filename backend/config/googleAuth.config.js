const {google} = require('googleapis');
const dotenv = require('dotenv');


dotenv.config();

// console.log('->',process.env.MONGO_URI, process.env.CLIENT_SECRET);
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;



exports.oauth2client = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    'http://localhost:5000/social-login-test.html'
);