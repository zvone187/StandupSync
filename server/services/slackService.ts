import { WebClient } from '@slack/web-api';
import TeamSettings from '../models/TeamSettings';
import mongoose from 'mongoose';

/**
 * Format standup data for Slack message
 */
export function formatStandupForSlack(
  userName: string,
  yesterdayWork: string[],
  todayPlan: string[],
  blockers: string[]
): string {
  let message = `*Daily Standup from ${userName}*\n\n`;

  if (yesterdayWork.length > 0) {
    message += `*✅ Yesterday:*\n${yesterdayWork.map(item => `• ${item}`).join('\n')}\n\n`;
  }

  if (todayPlan.length > 0) {
    message += `*📋 Today:*\n${todayPlan.map(item => `• ${item}`).join('\n')}\n\n`;
  }

  if (blockers.length > 0) {
    message += `*🚧 Blockers:*\n${blockers.map(item => `• ${item}`).join('\n')}\n`;
  }

  return message;
}

/**
 * Post standup message to Slack
 */
export async function postStandupToSlack(
  teamId: mongoose.Types.ObjectId,
  userName: string,
  yesterdayWork: string[],
  todayPlan: string[],
  blockers: string[]
): Promise<string | null> {
  console.log(`📤 Posting standup to Slack for team ${teamId}`);

  try {
    const teamSettings = await TeamSettings.findOne({ teamId });

    if (!teamSettings || !teamSettings.isSlackConnected || !teamSettings.slackAccessToken) {
      console.log('⚠️ Slack not connected for this team, skipping post');
      return null;
    }

    if (!teamSettings.slackChannelId) {
      console.warn('⚠️ No Slack channel configured for this team');
      return null;
    }

    const client = new WebClient(teamSettings.slackAccessToken);
    const message = formatStandupForSlack(userName, yesterdayWork, todayPlan, blockers);

    const result = await client.chat.postMessage({
      channel: teamSettings.slackChannelId,
      text: message,
      mrkdwn: true,
    });

    if (result.ok && result.ts) {
      console.log(`✅ Standup posted to Slack successfully, message timestamp: ${result.ts}`);
      return result.ts;
    }

    console.warn('⚠️ Slack post response was not OK');
    return null;
  } catch (error) {
    console.error('❌ Failed to post standup to Slack:', error);
    // Don't throw - Slack posting is not critical
    return null;
  }
}

/**
 * Update existing Slack message with new standup data
 */
export async function updateSlackStandup(
  teamId: mongoose.Types.ObjectId,
  messageTimestamp: string,
  userName: string,
  yesterdayWork: string[],
  todayPlan: string[],
  blockers: string[]
): Promise<boolean> {
  console.log(`📝 Updating Slack message ${messageTimestamp} for team ${teamId}`);

  try {
    const teamSettings = await TeamSettings.findOne({ teamId });

    if (!teamSettings || !teamSettings.isSlackConnected || !teamSettings.slackAccessToken) {
      console.log('⚠️ Slack not connected for this team, skipping update');
      return false;
    }

    if (!teamSettings.slackChannelId) {
      console.warn('⚠️ No Slack channel configured for this team');
      return false;
    }

    const client = new WebClient(teamSettings.slackAccessToken);
    const message = formatStandupForSlack(userName, yesterdayWork, todayPlan, blockers);

    const result = await client.chat.update({
      channel: teamSettings.slackChannelId,
      ts: messageTimestamp,
      text: message,
      mrkdwn: true,
    });

    if (result.ok) {
      console.log(`✅ Slack message updated successfully`);
      return true;
    }

    console.warn('⚠️ Slack update response was not OK');
    return false;
  } catch (error) {
    console.error('❌ Failed to update Slack message:', error);
    return false;
  }
}

/**
 * Test Slack connection
 */
export async function testSlackConnection(accessToken: string): Promise<boolean> {
  try {
    const client = new WebClient(accessToken);
    const result = await client.auth.test();
    return result.ok === true;
  } catch (error) {
    console.error('❌ Slack connection test failed:', error);
    return false;
  }
}

/**
 * Get list of Slack channels
 */
export async function getSlackChannels(accessToken: string): Promise<Array<{ id: string; name: string }>> {
  try {
    const client = new WebClient(accessToken);
    const result = await client.conversations.list({
      types: 'public_channel,private_channel',
      limit: 200,
    });

    if (!result.ok || !result.channels) {
      return [];
    }

    return result.channels
      .filter(channel => !channel.is_archived)
      .map(channel => ({
        id: channel.id || '',
        name: channel.name || '',
      }));
  } catch (error) {
    console.error('❌ Failed to get Slack channels:', error);
    return [];
  }
}
