const axios = require('axios');

const sendResetEmail = async (to, resetUrl) => {
    console.log('========== SENDLIB EMAIL ==========');
    console.log('Recipient:', to);

    try {
        const response = await axios.post(
            'https://sendlib.samueltuoyo.com/api/send',
            {
                from: process.env.EMAIL_USER,
                to: to,
                subject: 'Reset your TPL Auction password',

                html: `
                    <h2>TPL Auction - Password Reset</h2>

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
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.SENDLIB_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('✅ EMAIL SENT THROUGH SENDLIB');
        console.log('Response:', response.data);

        return response.data;

    } catch (error) {

        console.error('❌ SENDLIB EMAIL ERROR');

        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error('Message:', error.message);
        }

        throw error;
    }
};

module.exports = { sendResetEmail };