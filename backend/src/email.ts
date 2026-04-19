import nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

let devTransporter: Transporter | null = null;

async function getTransporter(): Promise<Transporter> {
    if (process.env.SMTP_HOST) {
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 587,
            secure: Number(process.env.SMTP_PORT) === 465,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }

    // Dev fallback: use Ethereal (fake SMTP — emails are captured and previewable in browser)
    if (!devTransporter) {
        const testAccount = await nodemailer.createTestAccount();
        devTransporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
        console.log('[DEV] Ethereal test account created:', testAccount.user);
    }

    return devTransporter;
}

export async function sendVerificationEmail(
    to: string,
    username: string,
    token: string
): Promise<void> {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const verifyUrl = `${frontendUrl}/verify.html?token=${token}`;
    const from = process.env.SMTP_FROM || 'Memory Game <noreply@memorygame.com>';

    const html = `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f0f4f8;border-radius:12px;">
            <h2 style="color:#d84315;margin-bottom:8px;">Memory Game</h2>
            <p style="color:#333;">Hi <strong>${username}</strong>,</p>
            <p style="color:#555;">Thanks for registering! Please confirm your email address by clicking the button below.</p>
            <a href="${verifyUrl}"
               style="display:inline-block;margin:24px 0;padding:12px 28px;background:#d84315;color:#fff;border-radius:8px;text-decoration:none;font-size:16px;">
                Confirm Email
            </a>
            <p style="color:#888;font-size:13px;">If you did not create an account, you can ignore this email.</p>
        </div>
    `;

    const transporter = await getTransporter();
    const info = await transporter.sendMail({
        from,
        to,
        subject: 'Confirm your Memory Game registration',
        html,
    });

    // In dev (Ethereal), print the preview URL to the console
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
        console.log('\n--- [DEV] Email sent! Open preview in browser ---');
        console.log(previewUrl);
        console.log('-------------------------------------------------\n');
    }
}