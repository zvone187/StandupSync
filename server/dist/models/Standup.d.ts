import mongoose, { Document } from 'mongoose';
export interface IStandup extends Document {
    userId: mongoose.Types.ObjectId;
    teamId: mongoose.Types.ObjectId;
    date: Date;
    yesterdayWork: string[];
    todayPlan: string[];
    blockers: string[];
    submittedAt: Date;
    updatedAt: Date;
    slackMessageId?: string;
}
declare const Standup: mongoose.Model<IStandup, {}, {}, {}, mongoose.Document<unknown, {}, IStandup, {}, {}> & IStandup & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default Standup;
//# sourceMappingURL=Standup.d.ts.map