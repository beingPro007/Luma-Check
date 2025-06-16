// mailTemplates/forgotPassword.ts
import { generateEmailTemplate } from './emailTemplateGenerator';

export const forgotPasswordMailContent = {
  generate: (firstName: string, resetLink: string) =>
    generateEmailTemplate({
      firstName,
      title: 'Reset Your Password',
      messageLines: [
        'You recently requested to reset your password.',
        'Click the link below to reset it:',
      ],
      actionText: 'Reset Password',
      actionUrl: resetLink,
    }),
};

export const inviteUserMailTemplate = {
  generate: (firstName: string, inviteLink: string, organizationName: string) =>
    generateEmailTemplate({
      firstName,
      title: `You've been invited to join ${organizationName}`,
      messageLines: [
        `${organizationName} has invited you to join their workspace.`,
        'Click the button below to accept the invitation and get started.',
      ],
      actionText: 'Accept Invitation',
      actionUrl: inviteLink,
    }),
};
