import express, { Request, Response } from 'express';
import { requireRole } from './middlewares/auth';
import TeamSettings from '../models/TeamSettings';
import { testSlackConnection, getSlackChannels } from '../services/slackService';
import { ROLES } from 'shared';

const router = express.Router();

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

export default router;
