import nodemailer from 'nodemailer';
import logger from '../logger';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || '127.0.0.1',
  port: Number(process.env.SMTP_PORT || 1025),
  auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined
});

export async function sendClaimEmail(to: string, payload: { cardId: string; claimId: string; token: string; pattern: string; sessionId: string }) {
  const { cardId, claimId, token, pattern, sessionId } = payload;
  const subject = 'Bingo Claim Token';
  const text = `Your bingo claim was accepted.

Card ID: ${cardId}
Claim ID: ${claimId}
Token: ${token}
Pattern: ${pattern}
Session ID: ${sessionId}

Keep this token safe.`;

  try {
    const info = await transporter.sendMail({
      from: process.env.ADMIN_EMAIL || 'no-reply@bingo.app',
      to,
      subject,
      text
    });
    logger.info('Sent claim email', info);
  } catch (err) {
    logger.error('Error sending email', err);
    throw err;
  }
}
