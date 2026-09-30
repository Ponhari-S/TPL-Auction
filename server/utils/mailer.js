const nodemailer = require('nodemailer');
const dns = require('dns');

console.log('EMAIL_USER exists:', !!process.env.EMAIL_USER);
console.log('EMAIL_APP_PASSWORD exists:', !!process.env.EMAIL_APP_PASSWORD);

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,

    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
    },

    lookup: (hostname, options, callback) => {
        console.log('DNS lookup:', hostname);

        dns.lookup(hostname, { family: 4 }, (err, address, family) => {
            console.log('DNS result:', { err, address, family });

            callback(err, address, family);
        });
    }
});

const sendResetEmail = async (to, resetUrl) => {

    console.log('========== SEND EMAIL ==========');
    console.log('Recipient:', to);
    console.log('Reset URL:', resetUrl);
    console.log('Starting transporter.sendMail()...');

    try {

        const info = await transporter.sendMail({
            from: `TPL Auction <${process.env.EMAIL_USER}>`,
            to,
            subject: 'Reset your TPL Auction password',

            html: `
                <p>You requested a password reset.</p>

                <p>
                    <a href="${resetUrl}">
                        Click here to reset your password
                    </a>
                </p>

                <p>
                    This link expires in 15 minutes.
                    If you didn't request this, ignore this email.
                </p>
            `
        });

        console.log('✅ EMAIL SENT');
        console.log('Message ID:', info.messageId);
        console.log('Response:', info.response);

        return info;

    } catch (error) {

        console.error('❌ EMAIL SEND FAILED');
        console.error('Error message:', error.message);
        console.error('Error code:', error.code);
        console.error('Full error:', error);

        throw error;
    }
};

module.exports = { sendResetEmail };