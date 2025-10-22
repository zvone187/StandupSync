import express, { Request, Response } from 'express';
import { requireRole } from './middlewares/auth';
import TeamSettings from '../models/TeamSettings';
import { testSlackConnection, getSlackChannels, postStandupToSlack } from '../services/slackService';
import { ROLES } from 'shared';
import crypto from 'crypto';
import Standup from '../models/Standup';
import User from '../models/User';
import UserService from '../services/userService';

const router = express.Router();

// Helper function to verify Slack request signature
function verifySlackRequest(req: Request): boolean {
  const slackSignature = req.headers['x-slack-signature'] as string;
  const timestamp = req.headers['x-slack-request-timestamp'] as string;
  const signingSecret = process.env.SLACK_SIGNING_SECRET;

  if (!slackSignature || !timestamp || !signingSecret) {
    return false;
  }

  // Check if request is older than 5 minutes
  const time = Math.floor(new Date().getTime() / 1000);
  if (Math.abs(time - parseInt(timestamp)) > 300) {
    return false;
  }

  // Compute expected signature
  const sigBasestring = `v0:${timestamp}:${req.body}`;
  const mySignature = 'v0=' + crypto
    .createHmac('sha256', signingSecret)
    .update(sigBasestring, 'utf8')
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(mySignature, 'utf8'),
    Buffer.from(slackSignature, 'utf8')
  );
}

// Description: Get Slack settings for the team
// Endpoint: GET /api/slack/settings
// Request: {}
// Response: { settings: TeamSettings | null }
router.get('/settings', requireRole(ROLES.ADMIN), async (req: Request, res: Response) => {
  try {
    const currentUser = req.user;

    if (!currentUser) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log(`⚙️  Fetching Slack settings for team ${currentUser.teamId}`);
    const settings = await TeamSettings.findOne({ teamId: currentUser.teamId });

    res.status(200).json({ settings: settings || null });
  } catch (error) {
    console.error('❌ Error fetching Slack settings:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch Slack settings' });
  }
});

// Description: Configure Slack integration
// Endpoint: POST /api/slack/configure
// Request: { accessToken: string, channelId: string, channelName: string }
// Response: { settings: TeamSettings, message: string }
router.post('/configure', requireRole(ROLES.ADMIN), async (req: Request, res: Response) => {
  try {
    const currentUser = req.user;
    const { accessToken, channelId, channelName } = req.body;

    if (!currentUser) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!accessToken) {
      return res.status(400).json({ error: 'Access token is required' });
    }

    console.log(`⚙️  Configuring Slack for team ${currentUser.teamId}`);

    // Test the connection
    const isValid = await testSlackConnection(accessToken);
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid Slack access token' });
    }

    // Create or update settings
    let settings = await TeamSettings.findOne({ teamId: currentUser.teamId });

    if (settings) {
      settings.slackAccessToken = accessToken;
      settings.slackChannelId = channelId;
      settings.slackChannelName = channelName;
      settings.isSlackConnected = true;
      await settings.save();
    } else {
      settings = new TeamSettings({
        teamId: currentUser.teamId,
        slackAccessToken: accessToken,
        slackChannelId: channelId,
        slackChannelName: channelName,
        isSlackConnected: true,
      });
      await settings.save();
    }

    console.log(`✅ Slack configured successfully for team ${currentUser.teamId}`);
    res.status(200).json({
      settings,
      message: 'Slack integration configured successfully',
    });
  } catch (error) {
    console.error('❌ Error configuring Slack:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to configure Slack' });
  }
});

// Description: Get available Slack channels
// Endpoint: POST /api/slack/channels
// Request: { accessToken: string }
// Response: { channels: Array<{ id: string, name: string }> }
router.post('/channels', requireRole(ROLES.ADMIN), async (req: Request, res: Response) => {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({ error: 'Access token is required' });
    }

    console.log(`📋 Fetching Slack channels`);
    const channels = await getSlackChannels(accessToken);

    res.status(200).json({ channels });
  } catch (error) {
    console.error('❌ Error fetching Slack channels:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch Slack channels' });
  }
});

// Description: Get Slack workspace members (uses team's token from settings)
// Endpoint: GET /api/slack/members
// Request: {}
// Response: { members: Array<{ id: string, name: string, real_name: string, profile: object }> }
router.get('/members', requireRole(ROLES.ADMIN), async (req: Request, res: Response) => {
  try {
    const currentUser = req.user;

    if (!currentUser) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const settings = await TeamSettings.findOne({ teamId: currentUser.teamId });

    if (!settings || !settings.isSlackConnected || !settings.slackAccessToken) {
      return res.status(400).json({ error: 'Slack is not connected. Please connect Slack first.' });
    }

    console.log(`👥 Fetching Slack workspace members for team ${currentUser.teamId}`);

    const { WebClient } = await import('@slack/web-api');
    const client = new WebClient(settings.slackAccessToken);

    const result = await client.users.list();

    if (!result.ok || !result.members) {
      throw new Error('Failed to fetch Slack members');
    }

    // Filter out bots and deleted users, and format the response
    const members = result.members
      .filter((member: any) => !member.is_bot && !member.deleted && member.id !== 'USLACKBOT')
      .map((member: any) => ({
        id: member.id,
        name: member.name,
        real_name: member.real_name || member.name,
        profile: {
          display_name: member.profile?.display_name || member.real_name || member.name,
          email: member.profile?.email,
          image: member.profile?.image_48 || member.profile?.image_32,
        },
      }));

    res.status(200).json({ members });
  } catch (error) {
    console.error('❌ Error fetching Slack members:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch Slack members' });
  }
});

// Description: Handle Slack slash command for standup submission
// Endpoint: POST /api/slack/command
// Request: Slack slash command payload (application/x-www-form-urlencoded)
// Response: Slack message response
router.post('/command', express.urlencoded({ extended: true }), async (req: Request, res: Response) => {
  try {
    // Verify Slack request (optional - uncomment if SLACK_SIGNING_SECRET is set)
    // if (process.env.SLACK_SIGNING_SECRET && !verifySlackRequest(req)) {
    //   return res.status(401).json({ error: 'Invalid Slack signature' });
    // }

    const { user_email, text, channel_id, team_id } = req.body;

    console.log(`📝 Received Slack standup command from ${user_email}`);

    // Parse the command text
    // Expected format: /standup yesterday: item1, item2 | today: item1, item2 | blockers: item1, item2
    const parts = text.split('|').map((s: string) => s.trim());

    let yesterdayWork: string[] = [];
    let todayPlan: string[] = [];
    let blockers: string[] = [];

    for (const part of parts) {
      const lowerPart = part.toLowerCase();
      if (lowerPart.startsWith('yesterday:')) {
        yesterdayWork = part.substring(10).split(',').map((s: string) => s.trim()).filter(Boolean);
      } else if (lowerPart.startsWith('today:')) {
        todayPlan = part.substring(6).split(',').map((s: string) => s.trim()).filter(Boolean);
      } else if (lowerPart.startsWith('blockers:')) {
        blockers = part.substring(9).split(',').map((s: string) => s.trim()).filter(Boolean);
      }
    }

    // Find user by email
    const user = await User.findOne({ email: user_email });
    if (!user) {
      return res.json({
        response_type: 'ephemeral',
        text: '❌ User not found in StandupSync. Please register at the web app first.',
      });
    }

    // Check if standup already exists for today
    // Use UTC midnight for the current date to ensure consistency
    const now = new Date();
    const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0));

    const existingStandup = await Standup.findOne({
      userId: user._id,
      date: today,
    });

    if (existingStandup) {
      // Update existing standup
      existingStandup.yesterdayWork = yesterdayWork.length > 0 ? yesterdayWork : existingStandup.yesterdayWork;
      existingStandup.todayPlan = todayPlan.length > 0 ? todayPlan : existingStandup.todayPlan;
      existingStandup.blockers = blockers.length > 0 ? blockers : existingStandup.blockers;
      existingStandup.updatedAt = new Date();
      await existingStandup.save();

      console.log(`✅ Updated standup for ${user.email} via Slack command`);

      return res.json({
        response_type: 'ephemeral',
        text: '✅ Your standup has been updated successfully!',
      });
    } else {
      // Create new standup
      const newStandup = new Standup({
        userId: user._id,
        teamId: user.teamId,
        date: today,
        yesterdayWork,
        todayPlan,
        blockers,
        submittedAt: new Date(),
        updatedAt: new Date(),
      });
      await newStandup.save();

      // Post to Slack channel
      const slackMessageId = await postStandupToSlack(
        user.teamId,
        user.name || user.email,
        yesterdayWork,
        todayPlan,
        blockers
      );

      if (slackMessageId) {
        newStandup.slackMessageId = slackMessageId;
        await newStandup.save();
      }

      console.log(`✅ Created standup for ${user.email} via Slack command`);

      return res.json({
        response_type: 'ephemeral',
        text: '✅ Your standup has been submitted successfully!',
      });
    }
  } catch (error) {
    console.error('❌ Error handling Slack command:', error);
    return res.json({
      response_type: 'ephemeral',
      text: '❌ Failed to submit standup. Please try again or use the web app.',
    });
  }
});

// Description: Handle Slack slash command for adding standup updates throughout the day
// Endpoint: POST /api/slack/update
// Request: Slack slash command payload (application/x-www-form-urlencoded)
// Response: Slack message response
router.post('/update', express.urlencoded({ extended: true }), async (req: Request, res: Response) => {
  try {
    const { user_email, text, user_id, user_name } = req.body;

    console.log(`📝 Received Slack update command from ${user_name} (${user_id}): "${text}"`);

    if (!text || text.trim() === '') {
      return res.json({
        response_type: 'ephemeral',
        text: '❌ Please provide an update. Usage: `/standup-update I completed the API integration`',
      });
    }

    // Find user by Slack user ID first, then fall back to email
    let user = await UserService.getBySlackUserId(user_id);

    if (!user) {
      return res.json({
        response_type: 'ephemeral',
        text: `❌ User not found in StandupSync. Please ask your admin to link your Slack account (@${user_name}) in the Manage Users page.`,
      });
    }

    // Get tomorrow's date at UTC midnight
    const now = new Date();
    const tomorrow = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0));

    // Find or create tomorrow's standup
    let standup = await Standup.findOne({
      userId: user._id,
      date: tomorrow,
    });

    const updateItem = text.trim();

    if (standup) {
      // Add to existing standup's todayPlan
      if (!standup.todayPlan.includes(updateItem)) {
        standup.todayPlan.push(updateItem);
        standup.updatedAt = new Date();
        await standup.save();

        console.log(`✅ Added update to tomorrow's standup for ${user.email}`);

        return res.json({
          response_type: 'ephemeral',
          text: `✅ Added to tomorrow's standup:\n• ${updateItem}\n\n_This will appear in tomorrow's standup under "What you did today"_`,
        });
      } else {
        return res.json({
          response_type: 'ephemeral',
          text: `ℹ️ This update already exists in tomorrow's standup:\n• ${updateItem}`,
        });
      }
    } else {
      // Create new standup for tomorrow with this item in todayPlan
      const newStandup = new Standup({
        userId: user._id,
        teamId: user.teamId,
        date: tomorrow,
        yesterdayWork: [],
        todayPlan: [updateItem],
        blockers: [],
        submittedAt: new Date(),
        updatedAt: new Date(),
      });
      await newStandup.save();

      console.log(`✅ Created tomorrow's standup with update for ${user.email}`);

      return res.json({
        response_type: 'ephemeral',
        text: `✅ Added to tomorrow's standup:\n• ${updateItem}\n\n_This will appear in tomorrow's standup under "What you did today"_`,
      });
    }
  } catch (error) {
    console.error('❌ Error handling Slack update command:', error);
    return res.json({
      response_type: 'ephemeral',
      text: '❌ Failed to add update. Please try again or use the web app.',
    });
  }
});

// Description: Disconnect Slack integration
// Endpoint: POST /api/slack/disconnect
// Request: {}
// Response: { message: string }
router.post('/disconnect', requireRole(ROLES.ADMIN), async (req: Request, res: Response) => {
  try {
    const currentUser = req.user;

    if (!currentUser) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log(`🔌 Disconnecting Slack for team ${currentUser.teamId}`);
    const settings = await TeamSettings.findOne({ teamId: currentUser.teamId });

    if (!settings) {
      return res.status(404).json({ error: 'Slack settings not found' });
    }

    settings.slackAccessToken = undefined;
    settings.slackChannelId = undefined;
    settings.slackChannelName = undefined;
    settings.isSlackConnected = false;
    await settings.save();

    console.log(`✅ Slack disconnected successfully for team ${currentUser.teamId}`);
    res.status(200).json({ message: 'Slack disconnected successfully' });
  } catch (error) {
    console.error('❌ Error disconnecting Slack:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to disconnect Slack' });
  }
});

// Description: Send a test message to Slack
// Endpoint: POST /api/slack/test
// Request: {}
// Response: { success: boolean, message: string }
router.post('/test', requireRole(ROLES.ADMIN), async (req: Request, res: Response) => {
  try {
    const currentUser = req.user;

    if (!currentUser) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log(`🧪 Sending test message to Slack for team ${currentUser.teamId}`);

    // Get team settings
    const settings = await TeamSettings.findOne({ teamId: currentUser.teamId });

    if (!settings || !settings.slackAccessToken || !settings.slackChannelId) {
      return res.status(400).json({
        success: false,
        error: 'Slack is not configured for this team. Please configure Slack integration first.'
      });
    }

    const { WebClient } = await import('@slack/web-api');
    const client = new WebClient(settings.slackAccessToken);

    try {
      // Try to join the channel first (in case bot is not in it)
      try {
        await client.conversations.join({ channel: settings.slackChannelId });
        console.log(`✅ Bot joined channel ${settings.slackChannelId}`);
      } catch (joinError: any) {
        // Ignore if already in channel or if it's a public channel that doesn't need joining
        console.log(`ℹ️ Channel join result:`, joinError.message);
      }

      // Send test message
      const testMessage = {
        channel: settings.slackChannelId,
        text: `🧪 *Test Message from StandupSync*\n\nThis is a test message to verify your Slack integration is working correctly!\n\n✅ If you can see this message, your Slack integration is configured properly.\n\n_Sent by ${currentUser.name || currentUser.email} at ${new Date().toLocaleString()}_`,
      };

      const result = await client.chat.postMessage(testMessage);

      if (result.ok) {
        console.log(`✅ Test message sent successfully to channel ${settings.slackChannelId}`);
        res.status(200).json({
          success: true,
          message: 'Test message sent successfully! Check your Slack channel.'
        });
      } else {
        console.error(`❌ Failed to send test message:`, result.error);
        res.status(400).json({
          success: false,
          error: result.error || 'Failed to send test message'
        });
      }
    } catch (error: any) {
      console.error('❌ Error sending test message:', error);

      // Provide helpful error messages based on the error type
      let errorMessage = error.message || 'Failed to send test message';

      if (error.message?.includes('not_in_channel')) {
        errorMessage = 'Bot is not in the channel. Please invite the bot to the channel and try again. In Slack, go to the channel, click the channel name, click "Integrations" tab, and add your StandupSync bot.';
      } else if (error.message?.includes('missing_scope')) {
        errorMessage = `Missing required permission: ${error.data?.needed || 'chat:write'}. Please update your bot's permissions in the Slack App settings.`;
      } else if (error.message?.includes('channel_not_found')) {
        errorMessage = 'Channel not found. Please verify the Channel ID is correct.';
      } else if (error.message?.includes('invalid_auth')) {
        errorMessage = 'Invalid Slack token. Please reconnect your Slack integration.';
      }

      res.status(500).json({
        success: false,
        error: errorMessage
      });
    }
  } catch (error) {
    console.error('❌ Error in test endpoint:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send test message'
    });
  }
});

export default router;
