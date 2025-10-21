import mongoose, { Document, Schema } from 'mongoose';

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

const schema = new Schema<IStandup>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  teamId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  date: {
    type: Date,
    required: true,
    index: true,
  },
  yesterdayWork: {
    type: [String],
    default: [],
  },
  todayPlan: {
    type: [String],
    default: [],
  },
  blockers: {
    type: [String],
    default: [],
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  slackMessageId: {
    type: String,
  },
}, {
  versionKey: false,
});

// Compound index for unique standup per user per date
schema.index({ userId: 1, date: 1 }, { unique: true });

// Update the updatedAt timestamp before saving
schema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Standup = mongoose.model<IStandup>('Standup', schema);

export default Standup;
