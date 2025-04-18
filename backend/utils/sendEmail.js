const nodemailer = require("nodemailer");
require('dotenv').config();

const sendEmail = async ({ email, subject, text }) => {
    const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: process.env.SMTP_MAIL,   // your Gmail email
            pass: process.env.SMTP_PASSWORD // your Gmail App Password
        }
    });
    console.log("SMTP_USER:", process.env.SMTP_MAIL);
    console.log("SMTP_PASS:", process.env.SMTP_PASSWORD);

    const mailOptions = {
        from: `"E-commerce Support" <${process.env.SMTP_MAIL}>`,
        to: email,
        subject: subject,
        text: text
    };

    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
