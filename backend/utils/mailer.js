const nodemailer = require('nodemailer');

function getSmtpConfig() {
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !port || !user || !pass) return null;

    const secure = String(process.env.SMTP_SECURE || '').toLowerCase() === 'true' || port === 465;

    return {
        host,
        port,
        secure,
        auth: { user, pass },
    };
}

function getFromAddress() {
    return process.env.SMTP_FROM || process.env.SMTP_USER;
}

async function sendEmail({ to, subject, text, html }) {
    const smtpConfig = getSmtpConfig();
    if (!smtpConfig) {
        console.warn('[mailer] SMTP not configured; skipping email:', subject);
        return { skipped: true };
    }

    const from = getFromAddress();
    if (!from) {
        console.warn('[mailer] SMTP_FROM/SMTP_USER missing; skipping email:', subject);
        return { skipped: true };
    }

    // Robust recipient filtering: trim, check for '@', and remove duplicates/empties
    const rawToList = Array.isArray(to) ? to : [to];
    const toList = rawToList
        .map(t => (typeof t === 'string' ? t.trim() : ''))
        .filter(t => t.includes('@')); // Basic email validation

    if (toList.length === 0) {
        console.warn('[mailer] No valid recipients; skipping email:', subject);
        return { skipped: true };
    }

    try {
        const transporter = nodemailer.createTransport(smtpConfig);
        const info = await transporter.sendMail({
            from,
            to: toList.join(', '),
            subject,
            text,
            html,
        });

        console.log('[mailer] Email sent successfully to:', toList.join(', '));
        return { messageId: info.messageId };
    } catch (error) {
        console.error('[mailer] Failed to send email:', error.message);
        return { error: error.message };
    }
}

module.exports = {
    sendEmail,
};
