const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth:{
        user:process.env.EMAIL_USER,
        pass:process.env.EMAIL_APP_PASSWORD
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000

});

const sendResetEmail = async (to,resetUrl) => {
    transporter.sendMail({
        from: `TPL Auction <${process.env.EMAIL_USER}>`,
        to,
        subject: 'Reset your TPL Auction password',
        html: `
      <p>You requested a password reset.</p>
      <p><a href="${resetUrl}">Click here to reset your password</a></p>
      <p>This link expires in 15 minutes. If you didn't request this, ignore this email.</p>
    `
    });
};

module.exports = {sendResetEmail};