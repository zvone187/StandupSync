import mongoose, { Schema } from 'mongoose';
const schema = new Schema({
    teamId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
        index: true,
    },
    slackAccessToken: {
        type: String,
    },
    slackChannelId: {
        type: String,
    },
    slackChannelName: {
        type: String,
    },
    slackTeamId: {
        type: String,
    },
    slackTeamName: {
        type: String,
    },
    slackBotUserId: {
        type: String,
    },
    slackWebhookUrl: {
        type: String,
    },
    isSlackConnected: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        immutable: true,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
}, {
    versionKey: false,
});
// Update the updatedAt timestamp before saving
schema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});
// Don't expose sensitive tokens in JSON
schema.set('toJSON', {
    transform: (doc, ret) => {
        delete ret.slackAccessToken;
        delete ret.slackWebhookUrl;
        return ret;
    },
});
const TeamSettings = mongoose.model('TeamSettings', schema);
export default TeamSettings;
//# sourceMappingURL=TeamSettings.js.map