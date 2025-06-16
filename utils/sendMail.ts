import { Resend } from 'resend';
import { ApiError } from './apiError';
import { configDotenv } from 'dotenv';
configDotenv()

const resend = new Resend(process.env.RESEND_EMAIL_API_KEY);

/**
 * Sends an email using the Resend API.
 *
 * @param {Object} options - The email options.
 * @param {string} options.from - Sender email in the format "Name <email>".
 * @param {string[]} options.to - Recipient email addresses.
 * @param {string} options.subject - Email subject.
 * @param {string} options.html - Email HTML content.
 * @returns {Promise<void>}
 */
export async function sendEmail({
  from,
  to,
  subject,
  html,
}: {
  from: string;
  to: string[];
  subject: string;
  html: string;
}): Promise<void> {
  try {
    const data = await resend.emails.send({ from, to, subject, html });
    console.log('Email sent:', data);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}
