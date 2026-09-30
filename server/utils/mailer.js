const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendResetEmail = async (to, resetUrl) => {
    console.log('========== RESEND EMAIL ==========');
    console.log('Recipient:', to);

    try {
        const { data, error } = await resend.emails.send({
            from: 'TPL Auction <onboarding@resend.dev>',
            to: [to],
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
        });

        if (error) {
            console.error('❌ Resend error:', error);
            throw new Error(error.message);
        }

        console.log('✅ Email sent through Resend');
        console.log('Resend ID:', data.id);

        return data;

    } catch (error) {
        console.error('❌ Email sending failed:', error);
        throw error;
    }
};

module.exports = { sendResetEmail };