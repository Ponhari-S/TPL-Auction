const nodemailer = require('nodemailer');
const dns = require('dns');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD
  },
  lookup: (hostname, options, callback) => {
    dns.lookup(hostname, { family: 4 }, callback);
  }
});

const sendResetEmail = async (to,resetUrl) => {
    const info = await transporter.sendMail({
        from: `TPL Auction <${process.env.EMAIL_USER}>`,
        to,
        subject: 'Reset your TPL Auction password',
        html: `
      <p>You requested a password reset.</p>
      <p><a href="${resetUrl}">Click here to reset your password</a></p>
      <p>This link expires in 15 minutes. If you didn't request this, ignore this email.</p>
    `
    });
    console.log('Email sent:', info.messageId, info.response);
};

module.exports = {sendResetEmail};