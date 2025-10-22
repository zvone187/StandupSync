# Email Setup Guide - Postmark Integration

## Overview

StandupSync uses Postmark to send invitation emails to new team members. When you invite a user, they receive a professional email with:
- Welcome message
- Temporary login password
- Direct link to login page
- Your name as the inviter

## Current Status

If you see this warning in the backend logs:
```
⚠️ POSTMARK_API_KEY not configured, skipping email send
```

This means:
- ✅ Users are still created successfully
- ❌ No email is sent
- ⚠️ You must manually share login credentials with invited users

## Setup Instructions

### Step 1: Create Postmark Account

1. Go to https://postmarkapp.com/
2. Click "Start Free Trial" or "Sign Up"
3. Create your account (free plan available)
4. Verify your email address

### Step 2: Add Sender Signature

1. Log in to your Postmark account
2. Go to "Sender Signatures" in the sidebar
3. Click "Add Sender Signature"
4. Enter your email address (e.g., `noreply@yourdomain.com`)
5. Click "Send Verification Email"
6. Check your email and click the verification link

**Note:** For development, you can use your personal email. For production, use a domain email.

### Step 3: Get API Key

1. In your Postmark dashboard, go to "Servers"
2. Select your server (or create a new one)
3. Click "API Tokens" in the sidebar
4. Copy the "Server API token"
5. Keep this secure - you'll need it in the next step

### Step 4: Configure Environment Variables

1. Open `server/.env` file
2. Update these values:

```bash
# Postmark Configuration
POSTMARK_API_KEY=your-actual-postmark-api-key-here
POSTMARK_FROM_EMAIL=noreply@yourdomain.com

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:5173
```

**Important:**
- Replace `your-actual-postmark-api-key-here` with your actual API key from Step 3
- Replace `noreply@yourdomain.com` with the verified email from Step 2
- For production, update `FRONTEND_URL` to your actual domain

### Step 5: Restart Server

```bash
# The server will automatically restart if using tsx watch
# Or manually restart:
cd server
npm run dev
```

### Step 6: Test Email Sending

1. Go to "Manage Users" page
2. Click "Invite User"
3. Enter an email address
4. Click "Send Invitation"
5. Check the backend logs - you should see:
   ```
   📧 Sending invitation email to user@example.com
   ✅ Invitation email sent successfully
   ```
6. Check the recipient's inbox

## Email Template

The invitation email includes:

**Subject:** "You've been invited to join StandupSync"

**Content:**
- Greeting with inviter's name
- Welcome message
- Email address (username)
- Temporary password
- Login button/link
- Instructions

**Example:**
```
Hello John Doe,

You've been invited by Jane Smith to join their team on StandupSync!

Your login credentials:
Email: john@example.com
Temporary Password: Abc123Xyz789

Click below to log in and get started:
[Login to StandupSync]

Please change your password after your first login.
```

## Troubleshooting

### Issue: Still seeing "POSTMARK_API_KEY not configured"

**Solution:**
1. Check that `.env` file exists in `server/` directory
2. Verify no typos in variable names
3. Ensure no extra spaces around the `=` sign
4. Restart the server after making changes
5. Check that `.env` is not in `.gitignore` (it should be, but make sure you have a local copy)

### Issue: "Invalid API key" error

**Solution:**
1. Double-check you copied the full API key
2. Make sure you're using the "Server API token", not other tokens
3. Verify the key has no extra spaces or quotes
4. Generate a new API key if needed

### Issue: "Sender signature not verified"

**Solution:**
1. Check your email for Postmark verification link
2. Click the link to verify your sender email
3. Wait a few minutes for DNS propagation
4. Try sending again

### Issue: Emails going to spam

**Solution:**
1. Use a proper domain email (not gmail, yahoo, etc.)
2. Set up SPF and DKIM records (Postmark provides these)
3. Warm up your sender reputation by sending gradually
4. Avoid spam trigger words in templates

### Issue: "Inactive recipient" error

**Solution:**
1. Postmark tracks bounced/inactive emails
2. The recipient address was previously bounced
3. Contact Postmark support to reactivate
4. Or use a different email address

## Development vs Production

### Development (Local)
```bash
POSTMARK_API_KEY=your-dev-api-key
POSTMARK_FROM_EMAIL=dev@youremail.com
FRONTEND_URL=http://localhost:5173
```

**Notes:**
- Can use personal email for sender
- Test emails only go to verified addresses
- Free tier is usually sufficient

### Production
```bash
POSTMARK_API_KEY=your-prod-api-key
POSTMARK_FROM_EMAIL=noreply@yourdomain.com
FRONTEND_URL=https://yourdomain.com
```

**Notes:**
- **Must** use domain email for professionalism
- Set up SPF, DKIM, DMARC records
- Monitor delivery rates in Postmark dashboard
- Consider paid plan for higher volume

## Security Best Practices

1. **Never commit API keys to git**
   - `.env` should be in `.gitignore`
   - Use environment variables in production
   - Rotate keys periodically

2. **Use separate keys for dev/prod**
   - Different keys for different environments
   - Easy to revoke if compromised
   - Better tracking and monitoring

3. **Limit API key permissions**
   - Only give "Send Email" permission
   - Don't use "Full Access" tokens
   - Use server-specific tokens

4. **Monitor usage**
   - Check Postmark dashboard regularly
   - Set up alerts for suspicious activity
   - Review bounce/spam rates

## Alternative: Manual Invitation

If you don't want to set up email, you can:

1. Invite user (creates account without email)
2. Backend logs show temporary password:
   ```
   ✅ Created user test@example.com with temporary password: Abc123Xyz789
   ```
3. Manually share these credentials with the user
4. User logs in and changes password

## Cost

**Postmark Pricing:**
- **Free Tier:** 100 emails/month
- **Paid Plans:** Start at $15/month for 10,000 emails
- **Pay-as-you-go:** $1.25 per 1,000 emails

For a team of 10-50 people:
- Invitations: ~50 emails (one-time)
- Notifications: ~1,000/month (if implemented)
- **Total:** Free tier is sufficient for most teams

## Support

### Postmark Support:
- Documentation: https://postmarkapp.com/support
- Email: support@postmarkapp.com
- Status: https://status.postmarkapp.com/

### StandupSync Support:
- Check backend logs for detailed errors
- Verify email service is configured correctly
- Test with curl/Postman to isolate issues
- Review this guide for common solutions

## Testing Email Templates

To test your email without inviting real users:

1. Use your own email address
2. Invite yourself with "Invite User" button
3. Check your inbox
4. Verify:
   - Email arrives within seconds
   - Template looks professional
   - Links work correctly
   - Temporary password is included

## Next Steps

After setting up Postmark:

1. ✅ Test invitation flow end-to-end
2. ✅ Customize email template if desired
3. ✅ Set up production environment
4. ✅ Configure DNS records (SPF, DKIM)
5. ✅ Monitor delivery rates
6. ✅ Consider adding password reset emails (future feature)

## Example Complete Configuration

```bash
# server/.env

# Server
PORT=3000

# Database
DATABASE_URL=mongodb://localhost/StandupSync

# JWT
JWT_SECRET=your-jwt-secret-here
REFRESH_TOKEN_SECRET=your-refresh-secret-here

# Email (Postmark)
POSTMARK_API_KEY=12345678-1234-1234-1234-123456789abc
POSTMARK_FROM_EMAIL=noreply@yourdomain.com

# Frontend
FRONTEND_URL=http://localhost:5173

# Slack (Optional)
SLACK_CLIENT_ID=your-slack-client-id
SLACK_CLIENT_SECRET=your-slack-client-secret
SLACK_SIGNING_SECRET=your-slack-signing-secret
```

---

**Ready to enable email invitations?**

Follow steps 1-5 above to get started. It takes about 10 minutes!
