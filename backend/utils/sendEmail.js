require('dotenv').config(); // Load environment variables from .env file
const nodemailer = require('nodemailer');

// Email setup
const senderEmail = process.env.SMTP_MAIL; // Use environment variable
const password = process.env.SMTP_PASSWORD; // Use environment variable

// Validate environment variables
if (!senderEmail || !password) {
  throw new Error('SMTP_MAIL and SMTP_PASSWORD must be set in the .env file');
}

// Create a transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // Use TLS
  auth: {
    user: senderEmail,
    pass: password,
  },
});

// Function to send email
const sendEmail = async (options) => {
  const { email, subject, text, from } = options;

  // Create email message
  const msg = {
    from: from || `Vendor Support <${senderEmail}>`, // Use provided 'from' or default to sender email
    to: email, // Dynamic receiver email
    subject: subject,
    text: text,
  };

  try {
    await transporter.sendMail(msg);
    console.log(`Email sent successfully to ${email}`);
  } catch (error) {
    console.error(`Failed to send email to ${email}: ${error.message}`);
    throw error; // Re-throw the error to be caught by the caller
  }
};

module.exports = { sendEmail };