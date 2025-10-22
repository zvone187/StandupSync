# StandupSync

A modern, team-based daily standup tracking application with Slack integration. Keep your team aligned with easy-to-use standup reports, real-time Slack updates, and comprehensive team management.

## Features

- 📝 **Daily Standup Tracking** - Create and manage daily standups with yesterday's work, today's plan, and blockers
- 👥 **Team Collaboration** - View and track your entire team's standups in one place
- 💬 **Slack Integration** - Submit standups and real-time updates directly from Slack
- 📅 **Week Navigation** - Easy navigation through standup history with visual indicators
- 🔐 **Role-Based Access** - Admin and user roles with proper permissions
- 🌓 **Dark Mode** - Beautiful UI with light and dark theme support
- 📧 **Email Invitations** - Invite team members via email with automatic credential generation

## Tech Stack

**Frontend:**
- React 18 with TypeScript
- Vite for fast development and building
- Tailwind CSS for styling
- Shadcn UI components
- React Hook Form for form management
- Date-fns for date handling

**Backend:**
- Node.js with Express
- TypeScript
- MongoDB with Mongoose
- JWT authentication
- Slack Web API integration
- Postmark for email delivery

## Prerequisites

- Node.js 18+ and npm
- MongoDB 4.4+
- Slack App (for Slack integration)
- Postmark account (for email invitations)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/standupsync.git
cd standupsync
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..

# Install server dependencies
cd server
npm install
cd ..
```

### 3. Environment Configuration

Create a `.env` file in the `server` directory:

```bash
cd server
cp .env.example .env
```

Edit `server/.env` with your configuration:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/standupsync

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# Frontend URL (for CORS and email links)
FRONTEND_URL=http://localhost:5173

# Postmark (Email Service)
POSTMARK_API_KEY=your-postmark-api-key
POSTMARK_FROM_EMAIL=noreply@yourdomain.com

# Slack (Optional - for Slack integration)
SLACK_SIGNING_SECRET=your-slack-signing-secret
```

### 4. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# macOS (via Homebrew)
brew services start mongodb-community

# Linux (systemd)
sudo systemctl start mongod

# Or run directly
mongod --dbpath /path/to/your/data/directory
```

### 5. Run the Application

**Development mode (recommended):**

```bash
# From the root directory
npm start
```

This starts both the client (http://localhost:5173) and server (http://localhost:3000) concurrently.

**Or run separately:**

```bash
# Terminal 1 - Start server
cd server
npm run dev

# Terminal 2 - Start client
cd client
npm run dev
```

### 6. Create Your First Admin Account

1. Navigate to http://localhost:5173
2. Click "Register"
3. Create your account (first user automatically becomes admin)
4. Login with your credentials

## Slack Integration Setup

### 1. Create a Slack App

1. Go to https://api.slack.com/apps
2. Click "Create New App" → "From scratch"
3. Name your app (e.g., "StandupSync") and select your workspace
4. Click "Create App"

### 2. Configure OAuth Scopes

Navigate to "OAuth & Permissions" and add these **Bot Token Scopes**:

- `channels:read` - View basic channel information
- `chat:write` - Send messages
- `chat:write.public` - Send messages to public channels without joining
- `channels:join` - Join public channels automatically

### 3. Enable Slash Commands

Navigate to "Slash Commands" and create two commands:

**Command 1: Submit Standup**
- Command: `/standup`
- Request URL: `https://your-domain.com/api/slack/command`
- Description: `Submit your daily standup`
- Usage Hint: `yesterday: tasks | today: tasks | blockers: issues`

**Command 2: Real-time Updates**
- Command: `/standup-update`
- Request URL: `https://your-domain.com/api/slack/update`
- Description: `Add work to your next standup`
- Usage Hint: `I completed the user authentication`

### 4. Install to Workspace

1. Go to "OAuth & Permissions"
2. Click "Install to Workspace"
3. Authorize the app
4. Copy the "Bot User OAuth Token"

### 5. Configure in StandupSync

1. Login as admin
2. Go to "Settings"
3. Paste your Bot Token
4. Select your channel
5. Click "Connect Slack"
6. Test the connection

### 6. Link Users to Slack

1. Go to "Manage Users"
2. For each user, select their Slack account from the dropdown
3. This enables them to use `/standup-update` command

## Email Integration Setup

### 1. Create Postmark Account

1. Sign up at https://postmarkapp.com
2. Create a server
3. Add and verify your sender signature/domain
4. Copy your Server API Token

### 2. Configure Environment

Add to `server/.env`:

```env
POSTMARK_API_KEY=your-server-api-token
POSTMARK_FROM_EMAIL=noreply@yourdomain.com
```

### 3. Test Email Invitations

1. Login as admin
2. Go to "Manage Users"
3. Click "Invite User"
4. Enter email and details
5. User receives invitation email with temporary password

## Project Structure

```
StandupSync/
├── client/                 # React frontend
│   ├── src/
│   │   ├── api/           # API client functions
│   │   ├── components/    # React components
│   │   ├── contexts/      # React contexts
│   │   ├── hooks/         # Custom hooks
│   │   ├── pages/         # Page components
│   │   ├── types/         # TypeScript types
│   │   └── utils/         # Utility functions
│   └── package.json
├── server/                # Express backend
│   ├── config/           # Configuration files
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   ├── utils/            # Utility functions
│   └── package.json
├── shared/               # Shared types and config
│   ├── config/          # Shared configuration
│   └── types/           # Shared TypeScript types
└── package.json         # Root package.json
```

## Available Scripts

### Root Directory

- `npm start` - Start both client and server in development mode
- `npm run client` - Start only the client
- `npm run server` - Start only the server

### Client Directory

- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Server Directory

- `npm run dev` - Start server with hot reload
- `npm run build` - Compile TypeScript
- `npm start` - Run compiled JavaScript

## Usage

### Daily Standup Workflow

1. **View Today's Standup**
   - App automatically shows today's date
   - Click "Create Standup" if not created

2. **Fill In Your Standup**
   - What you worked on yesterday
   - What you plan to work on today
   - Any blockers

3. **Submit**
   - Click "Save" to submit your standup
   - View team members' standups by clicking their tabs

### Using Slack Commands

**Submit Complete Standup:**
```
/standup yesterday: Completed user auth | today: Work on API | blockers: Need DB access
```

**Add Real-time Updates:**
```
/standup-update Completed the payment integration
```

Updates are added to your next standup's "What you worked on yesterday" section.

### Admin Features

- **Invite Users** - Add team members via email
- **Manage Roles** - Assign admin or user roles
- **Activate/Deactivate** - Control user access
- **Link Slack Accounts** - Connect users to Slack for commands
- **Configure Slack** - Set up Slack integration

## Troubleshooting

### MongoDB Connection Failed

```bash
# Check if MongoDB is running
mongosh

# Start MongoDB
brew services start mongodb-community  # macOS
sudo systemctl start mongod           # Linux
```

### Port Already in Use

```bash
# Find and kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or change port in server/.env
PORT=3001
```

### Slack Commands Not Working

1. Check Slack app has correct scopes
2. Verify Request URLs are publicly accessible
3. Ensure users are linked in "Manage Users"
4. Check server logs for errors

### Email Not Sending

1. Verify Postmark API key is correct
2. Check sender email is verified in Postmark
3. Review Postmark dashboard for bounces
4. Check server logs for errors

## Security Considerations

- Change all default secrets in production
- Use HTTPS in production
- Keep dependencies updated
- Never commit `.env` files
- Use strong passwords
- Enable MongoDB authentication
- Set up proper CORS configuration
- Use environment-specific configs

## License

MIT License - see [LICENSE](LICENSE) file for details

## Support

For issues, questions, or contributions, please visit the [GitHub repository](https://github.com/yourusername/standupsync).

---

Built with ❤️ for better team collaboration
