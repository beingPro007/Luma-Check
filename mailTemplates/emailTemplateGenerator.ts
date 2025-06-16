// utils/emailTemplateGenerator.ts
export const generateEmailTemplate = ({
  firstName,
  title,
  messageLines,
  actionText,
  actionUrl,
}: {
  firstName: string;
  title: string;
  messageLines: string[];
  actionText?: string;
  actionUrl?: string;
}) => {
  const actionButton =
    actionText && actionUrl
      ? `<p><a href="${actionUrl}" style="background: #007bff; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">${actionText}</a></p>`
      : '';

  const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <p>Hi ${firstName},</p>
        ${messageLines.map((line) => `<p>${line}</p>`).join('\n')}
        ${actionButton}
        <p>If you didn’t expect this, you can safely ignore this email.</p>
        <p>– Your Team</p>
      </div>
    `;

  return { subject: title, html };
};
