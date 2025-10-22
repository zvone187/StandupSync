# Slack Integration Setup Guide

## Overview

StandupSync can post daily standups to your Slack workspace automatically. This guide will walk you through setting up the Slack integration.

## Features

Once configured, your team will get:
- 📬 Automatic Slack messages when standups are submitted
- 💬 Formatted standup summaries in your chosen channel
- ⚡ Real-time notifications to keep everyone updated
- 📱 Slash command support (`/standup`) for submitting standups directly from Slack

---

## Prerequisites

- Admin access to your Slack workspace
- A Slack channel where you want standups posted (e.g., `#daily-standups`)
- Your StandupSync account with admin privileges

---

## Step 1: Create a Slack App

1. **Go to Slack API Dashboard**
   - Visit: https://api.slack.com/apps
   - Click **"Create New App"**

2. **Choose "From scratch"**
   - App Name: `StandupSync` (or your preferred name)
   - Workspace: Select your workspace
   - Click **"Create App"**

---

## Step 2: Configure Bot Permissions

1. **Navigate to "OAuth & Permissions"**
   - In the left sidebar, click **"OAuth & Permissions"**

2. **Add Bot Token Scopes**
   - Scroll down to **"Scopes"** → **"Bot Token Scopes"**
   - Click **"Add an OAuth Scope"** and add these scopes:

   Required scopes:
   - `chat:write` - Post messages to channels
   - `chat:write.public` - Post to public channels without joining
   - `commands` - Create slash commands
   - `channels:read` - View basic channel information

3. **Install App to Workspace**
   - Scroll to top of page
   - Click **"Install to Workspace"**
   - Review permissions and click **"Allow"**

4. **Copy Bot Token**
   - After installation, you'll see **"Bot User OAuth Token"**
   - Starts with `xoxb-`
   - Click **"Copy"**
   - **Save this token** - you'll need it for Step 4

---

## Step 3: Get Your Channel ID

### Method 1: From Slack App (Easiest)

1. **Open Slack** and go to the channel where you want standups posted
2. **Click the channel name** at the top
3. **Scroll down** in the popup
4. **Copy the Channel ID** (looks like `C01234ABCDE`)

### Method 2: From Channel URL

1. Open your channel in Slack
2. Look at the URL in your browser:
   ```
   https://app.slack.com/client/T01234ABCDE/C01234ABCDE
                                         ^^^^^^^^^^^
                                         This is your Channel ID
   ```
3. Copy the part after the last `/`

---

## Step 4: Configure StandupSync

### Option A: Through Settings Page (Recommended)

1. **Login to StandupSync** as an admin
2. **Go to Settings** page
3. **Navigate to "Slack Integration" section**
4. **Fill in the form:**
   - **Slack Access Token**: Paste your Bot Token from Step 2 (starts with `xoxb-`)
   - **Slack Channel ID**: Paste your Channel ID from Step 3 (starts with `C`)
5. **Click "Save"**
6. **Test the connection** by clicking "Send Test Message"

### Option B: Through Database (If Settings Page Not Available)

Connect to your MongoDB database and update your team's settings:

```javascript
db.teamsettings.updateOne(
  { teamId: "YOUR_TEAM_ID" },
  {
    $set: {
      slackAccessToken: "xoxb-your-token-here",
      slackChannelId: "C01234ABCDE"
    }
  },
  { upsert: true }
);
```

---

## Step 5: Set Up Slash Command (Optional)

If you want to submit standups directly from Slack using `/standup`:

1. **Go back to Slack API Dashboard**
   - Visit: https://api.slack.com/apps
   - Click on your StandupSync app

2. **Navigate to "Slash Commands"**
   - In the left sidebar, click **"Slash Commands"**
   - Click **"Create New Command"**

3. **Configure the Command**
   - **Command**: `/standup`
   - **Request URL**: `https://your-domain.com/api/slack/command`
     - Replace `your-domain.com` with your actual domain
     - If testing locally: `http://localhost:5000/api/slack/command`
   - **Short Description**: `Submit your daily standup`
   - **Usage Hint**: `yesterday: tasks | today: tasks | blockers: none`
   - Click **"Save"**

4. **Reinstall Your App**
   - Go to **"Install App"** in the left sidebar
   - Click **"Reinstall to Workspace"**
   - Click **"Allow"**

---

## Step 6: Test the Integration

### Test 1: Submit a Standup from Web

1. **Login to StandupSync**
2. **Create a new standup** for today
3. **Check your Slack channel** - you should see a message like:

```
📝 Daily Standup - John Doe

📅 October 22, 2025

Yesterday:
• Completed API integration
• Fixed bug in user authentication

Today:
• Implement Slack notifications
• Review pull requests

Blockers:
• None
```

### Test 2: Use Slash Command (If Configured)

In any Slack channel, type:
```
/standup yesterday: Fixed bugs, Updated docs | today: Write tests, Deploy | blockers: None
```

You should get a confirmation message and the standup should appear in both Slack and StandupSync.

---

## Troubleshooting

### Issue: "Slack not connected for this team"

**Cause**: Slack credentials not configured for your team

**Solution**:
1. Verify you've saved the Bot Token and Channel ID (Step 4)
2. Check backend logs for errors
3. Ensure token starts with `xoxb-`
4. Verify Channel ID format (starts with `C`)

### Issue: "channel_not_found" error

**Cause**: Invalid Channel ID or bot doesn't have access

**Solution**:
1. Double-check the Channel ID (Step 3)
2. Invite the bot to the channel:
   - In Slack, go to your channel
   - Click channel name → "Integrations" → "Add an app"
   - Select your StandupSync bot
3. Ensure bot has `chat:write` and `chat:write.public` scopes

### Issue: "invalid_auth" or "token_revoked"

**Cause**: Invalid or expired Bot Token

**Solution**:
1. Go to https://api.slack.com/apps
2. Select your app
3. Go to "OAuth & Permissions"
4. Copy the "Bot User OAuth Token" again
5. Update it in StandupSync settings

### Issue: Slash command returns error

**Cause**: Request URL incorrect or server not accessible

**Solution**:
1. Verify your Request URL is correct
2. Ensure your server is accessible from the internet
3. Check that URL includes `/api/slack/command`
4. Test the URL directly with curl:
   ```bash
   curl -X POST https://your-domain.com/api/slack/command \
     -d "user_email=test@example.com&text=yesterday: test | today: test | blockers: none"
   ```

### Issue: Messages post but formatting is broken

**Cause**: Slack message formatting issue

**Solution**:
- This is a known limitation of Slack's message formatting
- Ensure your standup items don't include special characters that break Slack's markdown
- The backend automatically formats messages - no action needed

---

## Message Format Examples

### Simple Standup
```
📝 Daily Standup - Jane Smith

📅 October 22, 2025

Yesterday:
• Fixed bug #123

Today:
• Code review

Blockers:
• None
```

### Multiple Items
```
📝 Daily Standup - Bob Johnson

📅 October 22, 2025

Yesterday:
• Completed feature A
• Fixed bugs in module B
• Updated documentation

Today:
• Start feature C
• Review PR #456
• Meeting with design team

Blockers:
• Waiting for API access
• Need feedback on design
```

---

## Security Best Practices

1. **Keep Your Bot Token Secret**
   - Never commit tokens to version control
   - Store in environment variables or secure settings
   - Rotate tokens if exposed

2. **Limit Bot Permissions**
   - Only add scopes you actually need
   - Review permissions regularly
   - Remove unused scopes

3. **Restrict Channel Access**
   - Only invite bot to necessary channels
   - Use private channels for sensitive teams
   - Consider separate bots for different teams

4. **Monitor Usage**
   - Check Slack API usage dashboard
   - Review backend logs for errors
   - Set up alerts for failures

---

## Backend Configuration Reference

The backend uses these environment variables (optional):

```env
# Slack Integration (can be configured per-team in database)
SLACK_ACCESS_TOKEN=xoxb-your-default-token
SLACK_CHANNEL_ID=C01234ABCDE
```

**Note**: Per-team settings in the database override these environment variables.

---

## API Endpoints

### Post Standup to Slack
```
POST /api/slack/post
Authorization: Bearer <access_token>

{
  "standupId": "68f8209bcb4ba88af8dc29cf"
}
```

### Submit Standup via Slash Command
```
POST /api/slack/command
Content-Type: application/x-www-form-urlencoded

user_email=user@example.com
&text=yesterday: tasks | today: tasks | blockers: none
```

---

## Feature Checklist

Once fully configured, you should have:

- ✅ Standups automatically posted to Slack
- ✅ Formatted messages with user name and date
- ✅ Three sections: Yesterday, Today, Blockers
- ✅ Bullet points for each item
- ✅ Emoji indicators (📝, 📅)
- ✅ Optional slash command for quick submission

---

## Support

### Getting Help

1. **Check Backend Logs**
   ```bash
   # Look for Slack-related messages
   grep -i "slack" logs/server.log
   ```

2. **Test Slack Connection**
   ```bash
   # From backend directory
   npx tsx scripts/test-slack.ts
   ```

3. **Review Slack API Docs**
   - https://api.slack.com/docs
   - https://api.slack.com/methods/chat.postMessage

### Common Log Messages

**Success**:
```
✅ Slack message posted successfully to channel C01234ABCDE
```

**Warning**:
```
⚠️ Slack not connected for this team, skipping post
```

**Error**:
```
❌ Failed to post to Slack: channel_not_found
❌ Failed to post to Slack: invalid_auth
```

---

## Advanced Configuration

### Multiple Teams

If you have multiple teams, each team needs its own configuration:

1. Each team gets its own Bot Token (or share one)
2. Each team can post to a different channel
3. Configure per-team in the database:

```javascript
// Team A - Engineering
db.teamsettings.updateOne(
  { teamId: "team_a_id" },
  { $set: {
    slackAccessToken: "xoxb-token-a",
    slackChannelId: "C_ENGINEERING"
  }}
);

// Team B - Design
db.teamsettings.updateOne(
  { teamId: "team_b_id" },
  { $set: {
    slackAccessToken: "xoxb-token-b",
    slackChannelId: "C_DESIGN"
  }}
);
```

### Custom Message Templates

To customize the Slack message format, edit:
```
server/services/slackService.ts
```

Look for the `postStandupToSlack` function and modify the message blocks.

---

## Next Steps

After setting up Slack integration:

1. ✅ Test with a real standup submission
2. ✅ Verify messages appear in correct channel
3. ✅ Train team on using the feature
4. ✅ Set up slash command if desired
5. ✅ Monitor for any errors in the first few days

---

## Conclusion

You now have Slack integration fully configured! Your team's standups will automatically appear in your chosen Slack channel, keeping everyone informed in real-time.

If you run into any issues, check the Troubleshooting section above or review your backend logs for detailed error messages.

Happy standup syncing! 📝✨
