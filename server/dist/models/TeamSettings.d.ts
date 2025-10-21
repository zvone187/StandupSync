import mongoose, { Document } from 'mongoose';
export interface ITeamSettings extends Document {
    teamId: mongoose.Types.ObjectId;
    slackAccessToken?: string;
    slackChannelId?: string;
    slackChannelName?: string;
    slackTeamId?: string;
    slackTeamName?: string;
    slackBotUserId?: string;
    slackWebhookUrl?: string;
    isSlackConnected: boolean;
    createdAt: Date;
    updatedAt: Date;
}
declare const TeamSettings: mongoose.Model<ITeamSettings, {}, {}, {}, mongoose.Document<unknown, {}, ITeamSettings, {}, {}> & ITeamSettings & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default TeamSettings;
//# sourceMappingURL=TeamSettings.d.ts.map