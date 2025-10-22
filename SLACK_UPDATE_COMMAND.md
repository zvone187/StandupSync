# Slack `/standup-update` Command

## Overview

The `/standup-update` command allows you to add work updates throughout the day that will automatically be saved to tomorrow's standup. This helps you:

- **Track work in real-time** as you complete tasks
- **Never forget what you did** - capture accomplishments immediately
- **Build tomorrow's standup automatically** throughout the day
- **Reduce daily standup friction** - most of the work is already done!

---

## How It Works

### The Concept

When you use `/standup-update` today, the update is added to **tomorrow's standup** under "Today Plan".

**Tomorrow**, when you submit your standup:
- Today's updates become "Yesterday Work" (what you accomplished)
- You add new items to "Today Plan" (what you'll do)

### Example Timeline

**Monday 2:00 PM:**
```
/standup-update I completed the API integration
```
→ Saved to Tuesday's standup, "Today Plan" field

**Monday 4:30 PM:**
```
/standup-update I fixed the authentication bug
```
→ Added to Tuesday's standup, "Today Plan" field

**Tuesday morning** - when you open StandupSync:
- Your standup already shows:
  - **Yesterday Work:** (empty - you'll fill this in)
  - **Today Plan:**
    - ✅ I completed the API integration
    - ✅ I fixed the authentication bug
  - **Blockers:** (empty)

---

## Usage

### Basic Command

```
/standup-update <your update message>
```

### Examples

```
/standup-update I finished the user authentication feature
```

```
/standup-update Fixed bug #123 in the payment processing
```

```
/standup-update Completed code review for PR #456
```

```
/standup-update Deployed new version to staging
```

### Response

After each command, you'll see:

```
✅ Added to tomorrow's standup:
• I finished the user authentication feature

This will appear in tomorrow's standup under "What you did today"
```

---

## Setup Instructions

### Step 1: Create the Slack Command

1. **Go to your Slack App:**
   - Visit https://api.slack.com/apps
   - Click on your StandupSync app

2. **Navigate to "Slash Commands":**
   - Click "Slash Commands" in the left sidebar
   - Click "Create New Command"

3. **Configure the Command:**
   - **Command:** `/standup-update`
   - **Request URL:** `https://your-domain.com/api/slack/update`
     - Replace `your-domain.com` with your actual domain
     - For local testing: `http://localhost:5000/api/slack/update`
   - **Short Description:** `Add an update to tomorrow's standup`
   - **Usage Hint:** `I completed the API integration`
   - Click **"Save"**

4. **Reinstall Your App:**
   - Go to **"Install App"** in the left sidebar
   - Click **"Reinstall to Workspace"**
   - Click **"Allow"**

---

## Features

### ✅ Automatic Deduplication

If you try to add the same update twice, you'll see:

```
ℹ️ This update already exists in tomorrow's standup:
• I completed the API integration
```

### ✅ User Authentication

- The command uses your Slack email to identify you
- Your Slack email must match your StandupSync email
- If not found, you'll see: "User not found in StandupSync"

### ✅ Smart Date Handling

- Uses UTC timezone for consistency
- Tomorrow's standup is automatically created if it doesn't exist
- All updates are added to the "Today Plan" field

### ✅ Private Responses

- All command responses are **ephemeral** (only you see them)
- Your team won't be spammed with update notifications
- Updates are visible in the web app immediately

---

## Common Use Cases

### 1. **Throughout the Day** - Track as You Go

```
10:00 AM - /standup-update Started working on the dashboard redesign
02:00 PM - /standup-update Completed the new user flow mockups
04:30 PM - /standup-update Fixed CSS responsiveness issues
```

**Result:** Tomorrow's standup already has 3 items in "Today Plan"

### 2. **End of Day** - Quick Summary

```
05:00 PM - /standup-update Finished all tasks for the sprint
05:01 PM - /standup-update Prepared demo for tomorrow's meeting
```

**Result:** Tomorrow you'll remember what you accomplished today

### 3. **Immediate Capture** - Don't Forget

When you complete something important:
```
/standup-update Resolved critical production bug affecting 1000+ users
```

**Result:** You won't forget this achievement tomorrow

### 4. **Team Communication** - Async Updates

```
/standup-update Unblocked Sarah's PR by fixing the merge conflict
```

**Result:** Tomorrow's standup shows your collaboration

---

## Workflow Example

### Monday

**Throughout the day:**
```
10:00 AM - /standup-update Reviewed security audit findings
11:30 AM - /standup-update Implemented two-factor authentication
02:00 PM - /standup-update Updated API documentation
04:00 PM - /standup-update Fixed 5 bugs from QA testing
```

**Tuesday morning** - Open StandupSync web app:

Your standup form shows:

```
Yesterday Work:
[Your Sunday updates if any]

Today Plan:
• Reviewed security audit findings
• Implemented two-factor authentication
• Updated API documentation
• Fixed 5 bugs from QA testing

Blockers:
[Add any blockers]
```

**Click Submit** → Your standup is done in seconds!

---

## Error Messages

### User Not Found

```
❌ User not found in StandupSync. Please register at the web app first,
or make sure your Slack email matches your StandupSync email.
```

**Fix:**
1. Register at the StandupSync web app
2. Use the same email as your Slack account
3. Try the command again

### Empty Update

```
❌ Please provide an update. Usage: `/standup-update I completed the API integration`
```

**Fix:** Include a message after the command

### Server Error

```
❌ Failed to add update. Please try again or use the web app.
```

**Fix:**
1. Check your internet connection
2. Try again in a few seconds
3. If persists, use the web app to add updates manually

---

## Advanced Features

### Multiple Updates at Once

You can run the command multiple times in succession:

```
/standup-update Fixed bug A
/standup-update Fixed bug B
/standup-update Fixed bug C
```

All three will be added to tomorrow's standup.

### Integration with Web App

- Updates appear **immediately** in the web app
- View all your updates at `/` (home page)
- Navigate to tomorrow's date to see pending updates
- Edit or remove updates in the web app if needed

### Team Visibility

- Updates are stored privately
- Only visible when you submit tomorrow's standup
- Team members see your updates when you submit
- Maintains async communication workflow

---

## Comparison with `/standup` Command

| Feature | `/standup` | `/standup-update` |
|---------|------------|-------------------|
| Purpose | Submit complete standup | Add single update |
| Timing | Once per day (usually morning) | Throughout the day |
| Format | Structured (yesterday\|today\|blockers) | Freeform text |
| Target | Today's standup | Tomorrow's standup |
| Visibility | Posted to channel | Private until submitted |
| Use Case | Daily submission | Real-time tracking |

### When to Use Each

**Use `/standup`** when:
- Submitting your complete daily standup
- Need to report yesterday, today, and blockers
- Want immediate team visibility

**Use `/standup-update`** when:
- Completing tasks throughout the day
- Want to capture achievements in real-time
- Building tomorrow's standup progressively
- Don't want to interrupt the team

---

## Tips & Best Practices

### 1. **Be Specific**

❌ Bad:
```
/standup-update Worked on the project
```

✅ Good:
```
/standup-update Completed user authentication API endpoint
```

### 2. **Use Action Verbs**

Start with completed actions:
- ✅ "Completed..."
- ✅ "Fixed..."
- ✅ "Implemented..."
- ✅ "Deployed..."
- ✅ "Reviewed..."

### 3. **Include Context**

```
/standup-update Fixed authentication bug affecting mobile users (issue #234)
```

### 4. **Update After Completion**

Don't add tasks before you do them:
- ❌ "Will work on feature X"
- ✅ "Completed feature X"

### 5. **Regular Updates**

Update 3-5 times per day as you complete significant work:
- Morning: After first major task
- Midday: After lunch accomplishments
- Afternoon: Before end of day
- Evening: Final achievements

---

## Troubleshooting

### Command Not Found

**Problem:** `/standup-update` doesn't show in Slack autocomplete

**Solution:**
1. Verify command is created in Slack App settings
2. Check Request URL is correct
3. Reinstall the app to workspace
4. Refresh Slack (Cmd+R or Ctrl+R)

### Updates Not Showing in Web App

**Problem:** Added updates via Slack but don't see them in web app

**Solution:**
1. Navigate to tomorrow's date in the web app
2. Refresh the page (F5)
3. Check you're logged in with the correct account
4. Verify Slack email matches StandupSync email

### Wrong Date

**Problem:** Updates appearing under wrong date

**Solution:**
1. Check server timezone settings
2. Verify server date/time is correct
3. Updates always go to tomorrow (UTC)
4. Contact admin if timezone issues persist

---

## Technical Details

### Endpoint

```
POST /api/slack/update
```

### Request Format

```
application/x-www-form-urlencoded

user_email: user@example.com
text: I completed the API integration
user_id: U12345678
user_name: John Doe
```

### Response Format

```json
{
  "response_type": "ephemeral",
  "text": "✅ Added to tomorrow's standup:\n• I completed the API integration\n\n_This will appear in tomorrow's standup under \"What you did today\"_"
}
```

### Database Operations

1. **Find user** by Slack email
2. **Calculate tomorrow's date** (UTC midnight)
3. **Find or create** standup for tomorrow
4. **Add update** to `todayPlan` array
5. **Save** and respond to user

### Date Logic

```javascript
const now = new Date();
const tomorrow = new Date(Date.UTC(
  now.getFullYear(),
  now.getMonth(),
  now.getDate() + 1,
  0, 0, 0, 0
));
```

---

## Security

### Authentication

- Uses Slack email for user identification
- No password required (Slack handles auth)
- Only registered users can add updates

### Authorization

- Users can only add updates to their own standups
- Team isolation maintained
- Private responses (ephemeral)

### Rate Limiting

- No built-in rate limiting
- Consider adding if abuse occurs
- Slack has its own rate limits

---

## Support

### Getting Help

1. **Check this guide** for common issues
2. **View backend logs** for detailed errors
3. **Test in web app** to verify account setup
4. **Contact admin** if email mismatch

### Useful Commands

Check backend logs:
```bash
# In server directory
tail -f logs/server.log | grep "Slack update"
```

Test the endpoint:
```bash
curl -X POST http://localhost:5000/api/slack/update \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "user_email=test@example.com&text=Test update"
```

---

## Future Enhancements

### Potential Features

- [ ] `/standup-list` - View pending updates
- [ ] `/standup-remove` - Remove an update
- [ ] `/standup-clear` - Clear all pending updates
- [ ] Natural language parsing (AI-powered)
- [ ] Link detection and formatting
- [ ] Tag/category support
- [ ] Time tracking integration

---

## Conclusion

The `/standup-update` command transforms how you track daily work:

**Before:**
- Struggle to remember what you did yesterday
- Spend 10 minutes writing standup each morning
- Forget important accomplishments

**After:**
- Capture work as you complete it
- Standup takes 30 seconds to submit
- Never forget what you achieved

**Start using `/standup-update` today and make daily standups effortless!** 🚀

---

**Last Updated:** October 21, 2025
**Command:** `/standup-update`
**Endpoint:** `POST /api/slack/update`
**Status:** Production Ready ✅
