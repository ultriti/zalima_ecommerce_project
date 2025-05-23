require('dotenv').config();
const nodemailer = require('nodemailer');

// Email setup
const senderEmail = process.env.SMTP_MAIL;
const password = process.env.SMTP_PASSWORD;

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

// Function to send password reset email
const sendPasswordResetEmail = async (options) => {
  const { email, resetLink } = options;

  // Create email message with HTML content for better formatting
  const msg = {
    from: `Trendify Support <${senderEmail}>`, // Sender display name and email
    to: email, // Receiver email
    subject: 'Password Reset Request - Trendify',
    text: `
      Dear User,

      You have requested to reset your password for your Trendify account.

      Please click the following link to reset your password:
      ${resetLink}

      This link will expire in 1 hour. If you did not request a password reset, please ignore this email.

      Best regards,
      The Trendify Team
    `,
    html: `
      <h2>Password Reset Request</h2>
      <p>Dear User,</p>
      <p>You have requested to reset your password for your Trendify account.</p>
      <p>Please click the button below to reset your password:</p>
      <p>
        <a href="${resetLink}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Reset Password
        </a>
      </p>
      <p>This link will expire in 1 hour. If you did not request a password reset, please ignore this email.</p>
      <p>Best regards,<br>The Trendify Team</p>
    `,
  };

  try {
    await transporter.sendMail(msg);
    console.log(`Password reset email sent successfully to ${email}`);
  } catch (error) {
    console.error(`Failed to send password reset email to ${email}: ${error.message}`);
    throw error; // Re-throw the error to be caught by the caller
  }
};

module.exports = { sendPasswordResetEmail };