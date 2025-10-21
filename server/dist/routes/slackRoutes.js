import express from 'express';
import { requireRole } from './middlewares/auth';
import TeamSettings from '../models/TeamSettings';
import { testSlackConnection, getSlackChannels, postStandupToSlack } from '../services/slackService';
import { ROLES } from 'shared';
import crypto from 'crypto';
import Standup from '../models/Standup';
import User from '../models/User';
const router = express.Router();
// Helper function to verify Slack request signature
function verifySlackRequest(req) {
    const slackSignature = req.headers['x-slack-signature'];
    const timestamp = req.headers['x-slack-request-timestamp'];
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
    return crypto.timingSafeEqual(Buffer.from(mySignature, 'utf8'), Buffer.from(slackSignature, 'utf8'));
}
// Description: Get Slack settings for the team
// Endpoint: GET /api/slack/settings
// Request: {}
// Response: { settings: TeamSettings | null }
router.get('/settings', requireRole(ROLES.ADMIN), async (req, res) => {
    try {
        const currentUser = req.user;
        if (!currentUser) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        console.log(`⚙️  Fetching Slack settings for team ${currentUser.teamId}`);
        const settings = await TeamSettings.findOne({ teamId: currentUser.teamId });
        res.status(200).json({ settings: settings || null });
    }
    catch (error) {
        console.error('❌ Error fetching Slack settings:', error);
        res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch Slack settings' });
    }
});
// Description: Configure Slack integration
// Endpoint: POST /api/slack/configure
// Request: { accessToken: string, channelId: string, channelName: string }
// Response: { settings: TeamSettings, message: string }
router.post('/configure', requireRole(ROLES.ADMIN), async (req, res) => {
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
        }
        else {
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
    }
    catch (error) {
        console.error('❌ Error configuring Slack:', error);
        res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to configure Slack' });
    }
});
// Description: Get available Slack channels
// Endpoint: POST /api/slack/channels
// Request: { accessToken: string }
// Response: { channels: Array<{ id: string, name: string }> }
router.post('/channels', requireRole(ROLES.ADMIN), async (req, res) => {
    try {
        const { accessToken } = req.body;
        if (!accessToken) {
            return res.status(400).json({ error: 'Access token is required' });
        }
        console.log(`📋 Fetching Slack channels`);
        const channels = await getSlackChannels(accessToken);
        res.status(200).json({ channels });
    }
    catch (error) {
        console.error('❌ Error fetching Slack channels:', error);
        res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch Slack channels' });
    }
});
// Description: Handle Slack slash command for standup submission
// Endpoint: POST /api/slack/command
// Request: Slack slash command payload (application/x-www-form-urlencoded)
// Response: Slack message response
router.post('/command', express.urlencoded({ extended: true }), async (req, res) => {
    try {
        // Verify Slack request (optional - uncomment if SLACK_SIGNING_SECRET is set)
        // if (process.env.SLACK_SIGNING_SECRET && !verifySlackRequest(req)) {
        //   return res.status(401).json({ error: 'Invalid Slack signature' });
        // }
        const { user_email, text, channel_id, team_id } = req.body;
        console.log(`📝 Received Slack standup command from ${user_email}`);
        // Parse the command text
        // Expected format: /standup yesterday: item1, item2 | today: item1, item2 | blockers: item1, item2
        const parts = text.split('|').map((s) => s.trim());
        let yesterdayWork = [];
        let todayPlan = [];
        let blockers = [];
        for (const part of parts) {
            const lowerPart = part.toLowerCase();
            if (lowerPart.startsWith('yesterday:')) {
                yesterdayWork = part.substring(10).split(',').map((s) => s.trim()).filter(Boolean);
            }
            else if (lowerPart.startsWith('today:')) {
                todayPlan = part.substring(6).split(',').map((s) => s.trim()).filter(Boolean);
            }
            else if (lowerPart.startsWith('blockers:')) {
                blockers = part.substring(9).split(',').map((s) => s.trim()).filter(Boolean);
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
        const today = new Date();
        today.setHours(0, 0, 0, 0);
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
        }
        else {
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
            const slackMessageId = await postStandupToSlack(user.teamId, user.name || user.email, yesterdayWork, todayPlan, blockers);
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
    }
    catch (error) {
        console.error('❌ Error handling Slack command:', error);
        return res.json({
            response_type: 'ephemeral',
            text: '❌ Failed to submit standup. Please try again or use the web app.',
        });
    }
});
// Description: Disconnect Slack integration
// Endpoint: POST /api/slack/disconnect
// Request: {}
// Response: { message: string }
router.post('/disconnect', requireRole(ROLES.ADMIN), async (req, res) => {
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
    }
    catch (error) {
        console.error('❌ Error disconnecting Slack:', error);
        res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to disconnect Slack' });
    }
});
export default router;
//# sourceMappingURL=slackRoutes.js.map