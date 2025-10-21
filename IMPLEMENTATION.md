# StandupSync - Backend Implementation Documentation

## Overview

This document describes the complete backend implementation for StandupSync, including user management, team collaboration, Slack integration, and email invitations via Postmark.

## Features Implemented

### 1. User Management System

#### Admin Auto-Assignment
- **First registered user** automatically becomes an admin with their own team
- **Self-registered users** (non-invited) also become admins with their own teams
- **Invited users** join the team of the admin who invited them

#### User Roles
- **Admin**: Can manage users, invite team members, change roles, and configure integrations
- **User**: Regular team member with access to standups and team features

#### Team Structure
- Each admin has their own `teamId` (which is their own user ID)
- Team members share the same `teamId` as their admin
- Users can only see and interact with members of their own team

### 2. Email Invitations (Postmark)

#### Features
- Admins can invite users via email
- System generates a secure temporary password
- Beautiful HTML email template with:
  - Invitation message with inviter's name
  - Login credentials (email + temporary password)
  - Direct login link
  - Security reminder to change password
- Emails are sent via Postmark API

#### Configuration
Set these environment variables in `server/.env`:
```
POSTMARK_API_KEY=your-postmark-api-key-here
POSTMARK_FROM_EMAIL=noreply@yourdomain.com
FRONTEND_URL=http://localhost:5173
```

### 3. Slack Integration

#### Features
- Admins can configure Slack for their team
- Standups are automatically posted to configured Slack channel
- Standups can be updated (Slack message is also updated)
- Support for listing available Slack channels
- Connection testing before saving configuration

#### Slack Message Format
```
*Daily Standup from [User Name]*

*✅ Yesterday:*
• Task 1
• Task 2

*📋 Today:*
• Task 1
• Task 2

*🚧 Blockers:*
• Blocker 1
```

#### Configuration
Set these environment variables (optional, for OAuth flow):
```
SLACK_CLIENT_ID=your-slack-client-id
SLACK_CLIENT_SECRET=your-slack-client-secret
SLACK_SIGNING_SECRET=your-slack-signing-secret
```

## Database Models

### User Model
```typescript
{
  email: string;              // User's email (unique)
  password: string;           // Hashed password
  name?: string;              // User's display name
  role: 'admin' | 'user';     // User role
  teamId: ObjectId;           // Team reference (admin's ID)
  invitedBy?: ObjectId;       // Who invited this user
  invitedAt?: Date;           // When user was invited
  isInvited: boolean;         // Whether user was invited
  isActive: boolean;          // Account status
  createdAt: Date;            // Account creation date
  lastLoginAt: Date;          // Last login timestamp
  refreshToken: string;       // JWT refresh token
}
```

### Standup Model
```typescript
{
  userId: ObjectId;           // User who created standup
  teamId: ObjectId;           // Team reference
  date: Date;                 // Standup date
  yesterdayWork: string[];    // Array of yesterday's tasks
  todayPlan: string[];        // Array of today's tasks
  blockers: string[];         // Array of blockers
  submittedAt: Date;          // Submission timestamp
  updatedAt: Date;            // Last update timestamp
  slackMessageId?: string;    // Slack message ID (if posted)
}
```

### TeamSettings Model
```typescript
{
  teamId: ObjectId;           // Team reference (unique)
  slackAccessToken?: string;  // Slack OAuth token
  slackChannelId?: string;    // Selected Slack channel ID
  slackChannelName?: string;  // Selected Slack channel name
  slackTeamId?: string;       // Slack workspace ID
  slackTeamName?: string;     // Slack workspace name
  slackBotUserId?: string;    // Slack bot user ID
  slackWebhookUrl?: string;   // Slack webhook URL
  isSlackConnected: boolean;  // Connection status
  createdAt: Date;
  updatedAt: Date;
}
```

## API Endpoints

### Authentication Routes (`/api/auth`)

#### POST /api/auth/register
- Create new user account
- First user becomes admin automatically
- Non-invited users become admins with their own teams

#### POST /api/auth/login
- Authenticate with email and password
- Returns access and refresh tokens

#### POST /api/auth/logout
- Invalidate refresh token

#### POST /api/auth/refresh
- Refresh access token

#### GET /api/auth/me
- Get current user profile

### User Management Routes (`/api/users`)

#### GET /api/users/team
- Get all team members
- Returns users with same teamId as current user

#### GET /api/users/me
- Get current user's profile

#### GET /api/users (Admin only)
- Get all users across all teams
- For super admin functionality

#### POST /api/users/invite (Admin only)
- Invite new user to team
- Generates temporary password
- Sends invitation email via Postmark
- Body: `{ email, name?, role? }`

#### PUT /api/users/:id/role (Admin only)
- Update user's role
- Cannot change own role
- Can only modify users in same team
- Body: `{ role: 'admin' | 'user' }`

#### PUT /api/users/:id/status (Admin only)
- Activate or deactivate user account
- Cannot deactivate self
- Can only modify users in same team
- Body: `{ isActive: boolean }`

#### DELETE /api/users/:id (Admin only)
- Delete user account
- Cannot delete self
- Can only delete users in same team

### Standup Routes (`/api/standups`)

#### GET /api/standups
- Get standups for current user or specific date
- Query params: `date?`, `userId?`
- Defaults to current user's standups

#### GET /api/standups/range
- Get standups for a date range
- Query params: `startDate`, `endDate`, `userId?`
- Returns all standups in range

#### GET /api/standups/team/:date
- Get all team standups for a specific date
- Returns standups from all team members

#### POST /api/standups
- Create new standup
- Automatically posts to Slack if configured
- Body: `{ date, yesterdayWork[], todayPlan[], blockers[] }`

#### PUT /api/standups/:id
- Update existing standup
- Updates Slack message if exists
- Body: `{ yesterdayWork[]?, todayPlan[]?, blockers[]? }`

#### DELETE /api/standups/:id
- Delete standup
- Can only delete own standups

### Slack Integration Routes (`/api/slack`)

#### GET /api/slack/settings (Admin only)
- Get Slack configuration for team
- Excludes sensitive tokens in response

#### POST /api/slack/configure (Admin only)
- Configure Slack integration
- Tests connection before saving
- Body: `{ accessToken, channelId, channelName }`

#### POST /api/slack/channels (Admin only)
- Get list of available Slack channels
- Body: `{ accessToken }`

#### POST /api/slack/disconnect (Admin only)
- Disconnect Slack integration
- Removes all Slack tokens and settings

## Services

### User Service (`services/userService.ts`)
- User CRUD operations
- Authentication and password management
- Team management methods
- Auto-admin assignment logic

### Email Service (`services/emailService.ts`)
- Postmark integration
- Send invitation emails with credentials
- Send welcome emails
- HTML email templates

### Slack Service (`services/slackService.ts`)
- Post standups to Slack channels
- Update existing Slack messages
- Test Slack connections
- Get available channels
- Format standup data for Slack

## Scripts

### Seed Script (`npm run seed`)
Creates test data in the database:
- 2 admin users (with separate teams)
- 3 team members (invited by first admin)
- 6 sample standups
- Team settings

**Test Credentials:**
```
Admin 1: admin@standupsync.com / Admin123!
User 1:  john@standupsync.com / Password123!
User 2:  jane@standupsync.com / Password123!
User 3:  bob@standupsync.com / Password123!
Admin 2: alice@standupsync.com / Admin123!
```

### Cleanup Script (`npm run cleanup`)
Deletes all data from the database:
- All users
- All standups
- All team settings

**Warning:** This action cannot be undone!

## Environment Variables

### Required
```
PORT=3000
DATABASE_URL=mongodb://localhost/StandupSync
JWT_SECRET=your-jwt-secret
REFRESH_TOKEN_SECRET=your-refresh-token-secret
FRONTEND_URL=http://localhost:5173
```

### Optional (for Email)
```
POSTMARK_API_KEY=your-postmark-api-key
POSTMARK_FROM_EMAIL=noreply@yourdomain.com
```

### Optional (for Slack OAuth)
```
SLACK_CLIENT_ID=your-slack-client-id
SLACK_CLIENT_SECRET=your-slack-client-secret
SLACK_SIGNING_SECRET=your-slack-signing-secret
```

## Frontend API Updates

All frontend API files have been updated to remove mocks and use real endpoints:

### `client/src/api/users.ts`
- `getTeamMembers()` - Get team members
- `getCurrentUser()` - Get current user
- `getAllUsers()` - Get all users (admin)
- `inviteUser(data)` - Invite new user (admin)
- `updateUserRole(userId, role)` - Update role (admin)
- `updateUserStatus(userId, isActive)` - Update status (admin)
- `deleteUser(userId)` - Delete user (admin)

### `client/src/api/standups.ts`
- `getStandups(params?)` - Get standups
- `getStandupsRange(params)` - Get date range
- `getTeamStandups(date)` - Get team standups
- `createStandup(data)` - Create standup
- `updateStandup(id, data)` - Update standup
- `deleteStandup(id)` - Delete standup

### `client/src/api/slack.ts`
- `getSlackSettings()` - Get Slack config
- `configureSlack(data)` - Configure Slack
- `getSlackChannels(accessToken)` - List channels
- `disconnectSlack()` - Disconnect Slack

## Testing

### 1. Start the Server
```bash
cd server
npm run dev
```

### 2. Seed the Database
```bash
npm run seed
```

### 3. Test Endpoints

#### Register First User (Becomes Admin)
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "name": "Test User"
  }'
```

#### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@standupsync.com",
    "password": "Admin123!"
  }'
```

#### Get Team Members (with auth token)
```bash
curl http://localhost:3000/api/users/team \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Invite User (Admin only)
```bash
curl -X POST http://localhost:3000/api/users/invite \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "name": "New User",
    "role": "user"
  }'
```

#### Create Standup
```bash
curl -X POST http://localhost:3000/api/standups \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2024-01-15",
    "yesterdayWork": ["Task 1", "Task 2"],
    "todayPlan": ["Task 3", "Task 4"],
    "blockers": []
  }'
```

## Security Features

1. **Password Hashing**: bcrypt with salt rounds
2. **JWT Authentication**: Access and refresh tokens
3. **Role-Based Access Control**: Admin-only endpoints
4. **Team Isolation**: Users can only access their team data
5. **Self-Protection**: Users cannot delete/deactivate themselves
6. **Token Validation**: All protected routes validate JWT
7. **Sensitive Data Filtering**: Passwords and tokens excluded from responses

## Error Handling

All endpoints include comprehensive error handling:
- Validation errors (400)
- Authentication errors (401)
- Authorization errors (403)
- Not found errors (404)
- Server errors (500)

All errors include descriptive messages in the response:
```json
{
  "error": "Error message here"
}
```

## Logging

Meaningful logs are added throughout the codebase:
- ✅ Success operations (green checkmark)
- ❌ Error operations (red X)
- ⚠️ Warnings (warning sign)
- 📧 Email operations (mail icon)
- 📤 Slack operations (outbox icon)
- 👥 User operations (people icon)
- 📝 Standup operations (memo icon)

Example:
```
✅ Created user john@standupsync.com with role user
📧 Sending invitation email to john@standupsync.com
📤 Posting standup to Slack for team 123456
```

## Next Steps

To use this implementation:

1. **Setup Postmark** (for emails)
   - Sign up at https://postmarkapp.com/
   - Create a server and get API key
   - Add verified sender signature
   - Update `POSTMARK_API_KEY` and `POSTMARK_FROM_EMAIL` in .env

2. **Setup Slack** (optional)
   - Create Slack app at https://api.slack.com/apps
   - Enable bot features and permissions
   - Install app to workspace
   - Get bot token and add to team settings via API

3. **Test the Application**
   - Run `npm run seed` to create test data
   - Start the server with `npm run dev`
   - Test all endpoints with the provided credentials
   - Try inviting users, creating standups, etc.

4. **Deploy**
   - Update environment variables for production
   - Deploy server to your hosting platform
   - Update CORS configuration if needed
   - Set up production MongoDB database

## Support

For issues or questions, check:
- Server logs for detailed error messages
- Database connection status
- Environment variables configuration
- API endpoint documentation above
