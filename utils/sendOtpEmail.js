// utils/sendOtpEmail.js
const nodemailer = require("nodemailer");
require('dotenv').config();

const sendOtpEmail = async (email, name, otp) => {
  const transporter = nodemailer.createTransport({
    service: 'Gmail', // Or use a custom SMTP config
    auth: {
      user: process.env.SMTP_MAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const mailOptions = {
    from: `"Your App Name" <${process.env.SMTP_MAIL}>`,
    to: email,
    subject: 'Your OTP for Login',
    html: `
      <div style="font-family:sans-serif;">
        <h2>Hello ${name || ''},</h2>
        <p>Your OTP for login is:</p>
        <h3 style="color:blue;">${otp}</h3>
        <p>This OTP is valid for 10 minutes.</p>
        <br/>
        <p>Thank you,<br/>Team</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports=sendOtpEmail;
