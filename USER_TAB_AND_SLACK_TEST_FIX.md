# User Tab Auto-Selection & Slack Test Feature

## Issues Fixed

### 1. ✅ Auto-select today's date when switching users

**Problem:**
When clicking on another user's tab, the page showed "No stand-ups to display" until manually clicking on today's date.

**Root Cause:**
The code only auto-selected today's date for the current user:
```typescript
// Before - only for own standups
if (activeTab === currentUserId && !selectedDate) {
  setSelectedDate(new Date());
}
```

**Solution:**
Changed to auto-select today's date for ALL users:
```typescript
// After - for all users
if (!selectedDate) {
  setSelectedDate(new Date());
}
```

**Files Changed:**
- `client/src/pages/HomePage.tsx` (line 99)

**Impact:**
✅ When switching to any user's tab, today's date is automatically selected
✅ Their today's standup (if it exists) is immediately visible
✅ No need to manually click on today's date

---

### 2. ✅ Added Slack Test Message Feature

**Problem:**
No easy way to verify if Slack integration is working correctly.

**Solution:**
Created a complete Settings page with Slack test functionality.

#### Backend Changes

**New Endpoint:** `POST /api/slack/test`

**File:** `server/routes/slackRoutes.ts`

**Functionality:**
- Checks if Slack is configured for the team
- Sends a formatted test message to the configured Slack channel
- Returns success/failure status

**Test Message Format:**
```
🧪 *Test Message from StandupSync*

This is a test message to verify your Slack integration is working correctly!

✅ If you can see this message, your Slack integration is configured properly.

_Sent by John Doe at 10/21/2025, 3:45:23 PM_
```

#### Frontend Changes

**New Page:** `client/src/pages/SettingsPage.tsx`

**Features:**
1. View Slack connection status
2. Configure Slack integration (token, channel)
3. **Send test messages** to verify configuration
4. Disconnect Slack integration
5. Fetch available Slack channels

**New Route:** `/settings`

**Navigation:** Added "Settings" button in Header (admin only)

#### API Functions

**New Function:** `testSlackMessage()`

**File:** `client/src/api/slack.ts`

```typescript
export const testSlackMessage = async () => {
  try {
    const response = await api.post('/api/slack/test');
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};
```

---

## How to Use

### Testing Slack Integration

1. **Navigate to Settings**
   - Click "Settings" button in the header (admin only)

2. **If Slack is NOT connected:**
   - Enter your Slack Bot Token (starts with `xoxb-`)
   - Click "Fetch Channels" to load available channels
   - Select your channel from the dropdown
   - Click "Connect Slack"

3. **If Slack IS connected:**
   - You'll see a green status indicator
   - Click "Send Test Message" button
   - Check your Slack channel for the test message
   - If successful, you'll see: "Test message sent successfully! Check your Slack channel."

### Viewing Team Member Standups

1. **Click on any team member's tab**
   - Today's date is automatically selected
   - Their today's standup is immediately visible (if it exists)
   - No need to manually click on dates

---

## Files Modified

### Backend
| File | Change | Lines |
|------|--------|-------|
| `server/routes/slackRoutes.ts` | Added test endpoint | 285-340 |

### Frontend
| File | Change | Lines |
|------|--------|-------|
| `client/src/pages/HomePage.tsx` | Auto-select today for all users | 98-101 |
| `client/src/api/slack.ts` | Added testSlackMessage function | 46-57 |
| `client/src/App.tsx` | Added Settings route | 12, 25 |
| `client/src/components/Header.tsx` | Added Settings button | 1, 58-66 |

### New Files
| File | Purpose |
|------|---------|
| `client/src/pages/SettingsPage.tsx` | Complete settings UI with Slack test |

---

## Testing Checklist

### User Tab Switching
- [ ] Click on your own tab → Today's standup shows immediately
- [ ] Click on another user's tab → Today's standup shows immediately
- [ ] Navigate to past weeks → Correct week is shown
- [ ] Switch between users while viewing past weeks → Works correctly

### Slack Test Message
- [ ] Navigate to Settings page
- [ ] If Slack connected: Click "Send Test Message"
- [ ] Verify test message appears in Slack channel
- [ ] Verify toast notification shows success
- [ ] If Slack not connected: Verify error message shows

### Settings Page Features
- [ ] View connection status (connected/not connected)
- [ ] Configure Slack integration (token + channel)
- [ ] Fetch available channels
- [ ] Send test message
- [ ] Disconnect Slack

---

## Error Handling

### Slack Not Configured
**Error Message:**
```
Slack is not configured for this team. Please configure Slack integration first.
```

**Solution:** Go to Settings → Configure Slack with token and channel

### Invalid Slack Token
**Error Message:**
```
Invalid Slack access token
```

**Solution:** Verify token starts with `xoxb-` and has correct permissions

### Channel Not Found
**Error Message:**
```
channel_not_found
```

**Solution:**
1. Verify Channel ID is correct
2. Ensure bot is invited to the channel
3. Check bot has `chat:write` permission

---

## Security Notes

1. **Admin Only:** Settings page is only accessible to admin users
2. **Token Protection:** Access tokens are stored securely in database
3. **Authorization:** Test endpoint requires admin role
4. **Validation:** All inputs are validated before processing

---

## Additional Features in Settings Page

### Slack Configuration
- ✅ Connect/disconnect Slack
- ✅ View connection status
- ✅ Select channel from dropdown
- ✅ Manual channel ID entry
- ✅ Optional channel name

### User Experience
- ✅ Loading states for all actions
- ✅ Toast notifications for success/error
- ✅ Helpful error messages
- ✅ Link to setup guide
- ✅ Confirmation dialog for disconnect

---

## API Endpoints Summary

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/slack/settings` | GET | Admin | Get Slack settings |
| `/api/slack/configure` | POST | Admin | Configure Slack |
| `/api/slack/test` | POST | Admin | Send test message |
| `/api/slack/disconnect` | POST | Admin | Disconnect Slack |
| `/api/slack/channels` | POST | Admin | Fetch channels |

---

## Next Steps

### After Testing

1. **If test message works:**
   - ✅ Slack is configured correctly
   - ✅ Standups will automatically post to Slack
   - ✅ Team members can use slash command (if configured)

2. **If test message fails:**
   - Check backend logs for detailed error
   - Verify token permissions
   - Ensure bot is in the channel
   - Review `SLACK_SETUP_GUIDE.md`

---

## Status

✅ **Both issues are FIXED**

1. ✅ User tabs auto-select today's date
2. ✅ Slack test message feature implemented
3. ✅ Complete Settings page created
4. ✅ Navigation updated

**Ready for testing!**

---

**Last Updated:** October 21, 2025
**Features:** User tab auto-selection, Slack test messaging
**Status:** Complete ✅
