import * as postmark from 'postmark';
/**
 * Get or create Postmark client
 */
function getPostmarkClient() {
    if (!process.env.POSTMARK_API_KEY || process.env.POSTMARK_API_KEY === 'your-postmark-api-key-here') {
        return null;
    }
    return new postmark.ServerClient(process.env.POSTMARK_API_KEY);
}
/**
 * Send invitation email to a new user
 */
export async function sendInvitationEmail(data) {
    console.log(`📧 Sending invitation email to ${data.toEmail}`);
    const client = getPostmarkClient();
    if (!client) {
        console.warn('⚠️ POSTMARK_API_KEY not configured, skipping email send');
        return;
    }
    const htmlBody = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(to right, #4f46e5, #7c3aed); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .credentials { background: white; padding: 20px; border-left: 4px solid #4f46e5; margin: 20px 0; }
          .button { display: inline-block; background: #4f46e5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 20px; }
          code { background: #e5e7eb; padding: 2px 6px; border-radius: 4px; font-family: monospace; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 You're Invited to StandupSync!</h1>
          </div>
          <div class="content">
            <p>Hi ${data.toName || 'there'},</p>
            <p><strong>${data.inviterName}</strong> has invited you to join their team on StandupSync - a platform for managing daily stand-ups and team collaboration.</p>

            <div class="credentials">
              <h3>Your Login Credentials</h3>
              <p><strong>Email:</strong> ${data.toEmail}</p>
              <p><strong>Temporary Password:</strong> <code>${data.tempPassword}</code></p>
            </div>

            <p>Click the button below to log in and get started:</p>
            <a href="${data.loginUrl}" class="button">Log In to StandupSync</a>

            <p><strong>Important:</strong> Please change your password after your first login for security.</p>

            <div class="footer">
              <p>If you didn't expect this invitation, you can safely ignore this email.</p>
              <p>&copy; ${new Date().getFullYear()} StandupSync. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
    const textBody = `
You're Invited to StandupSync!

Hi ${data.toName || 'there'},

${data.inviterName} has invited you to join their team on StandupSync - a platform for managing daily stand-ups and team collaboration.

Your Login Credentials:
Email: ${data.toEmail}
Temporary Password: ${data.tempPassword}

Log in here: ${data.loginUrl}

Important: Please change your password after your first login for security.

If you didn't expect this invitation, you can safely ignore this email.

© ${new Date().getFullYear()} StandupSync. All rights reserved.
  `;
    try {
        const result = await client.sendEmail({
            From: process.env.POSTMARK_FROM_EMAIL || 'noreply@standupsync.com',
            To: data.toEmail,
            Subject: `You've been invited to join ${data.inviterName}'s team on StandupSync`,
            HtmlBody: htmlBody,
            TextBody: textBody,
            MessageStream: 'outbound',
        });
        console.log(`✅ Invitation email sent successfully to ${data.toEmail}, MessageID: ${result.MessageID}`);
    }
    catch (error) {
        console.error(`❌ Failed to send invitation email to ${data.toEmail}:`, error);
        throw new Error(`Failed to send invitation email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
/**
 * Send welcome email to the first admin user
 */
export async function sendWelcomeEmail(email, name) {
    console.log(`📧 Sending welcome email to ${email}`);
    const client = getPostmarkClient();
    if (!client) {
        console.warn('⚠️ POSTMARK_API_KEY not configured, skipping email send');
        return;
    }
    const htmlBody = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(to right, #4f46e5, #7c3aed); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚀 Welcome to StandupSync!</h1>
          </div>
          <div class="content">
            <p>Hi ${name},</p>
            <p>Welcome to StandupSync! Your account has been created successfully.</p>
            <p>As an admin, you can now invite team members and manage your team's daily stand-ups.</p>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} StandupSync. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
    try {
        await client.sendEmail({
            From: process.env.POSTMARK_FROM_EMAIL || 'noreply@standupsync.com',
            To: email,
            Subject: 'Welcome to StandupSync!',
            HtmlBody: htmlBody,
            MessageStream: 'outbound',
        });
        console.log(`✅ Welcome email sent successfully to ${email}`);
    }
    catch (error) {
        console.error(`❌ Failed to send welcome email to ${email}:`, error);
        // Don't throw error for welcome emails as it's not critical
    }
}
//# sourceMappingURL=emailService.js.map