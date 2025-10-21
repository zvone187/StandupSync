import mongoose from 'mongoose';
/**
 * Format standup data for Slack message
 */
export declare function formatStandupForSlack(userName: string, yesterdayWork: string[], todayPlan: string[], blockers: string[]): string;
/**
 * Post standup message to Slack
 */
export declare function postStandupToSlack(teamId: mongoose.Types.ObjectId, userName: string, yesterdayWork: string[], todayPlan: string[], blockers: string[]): Promise<string | null>;
/**
 * Update existing Slack message with new standup data
 */
export declare function updateSlackStandup(teamId: mongoose.Types.ObjectId, messageTimestamp: string, userName: string, yesterdayWork: string[], todayPlan: string[], blockers: string[]): Promise<boolean>;
/**
 * Test Slack connection
 */
export declare function testSlackConnection(accessToken: string): Promise<boolean>;
/**
 * Get list of Slack channels
 */
export declare function getSlackChannels(accessToken: string): Promise<Array<{
    id: string;
    name: string;
}>>;
//# sourceMappingURL=slackService.d.ts.map