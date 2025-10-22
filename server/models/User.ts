import mongoose, { Document, Schema } from 'mongoose';
import { isPasswordHash } from '../utils/password';
import { randomUUID } from 'crypto';
import { ROLES, ALL_ROLES, RoleValues } from 'shared';

export interface IUser extends Document {
  email: string;
  password: string;
  createdAt: Date;
  lastLoginAt: Date;
  isActive: boolean;
  role: RoleValues;
  refreshToken: string;
  teamId: mongoose.Types.ObjectId;
  invitedBy?: mongoose.Types.ObjectId;
  invitedAt?: Date;
  isInvited: boolean;
  name?: string;
  slackUserId?: string;
}

const schema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    index: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    validate: { validator: isPasswordHash, message: 'Invalid password hash' },
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true,
  },
  lastLoginAt: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  role: {
    type: String,
    enum: ALL_ROLES,
    default: ROLES.USER,
  },
  refreshToken: {
    type: String,
    unique: true,
    index: true,
    default: () => randomUUID(),
  },
  teamId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  invitedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  invitedAt: {
    type: Date,
  },
  isInvited: {
    type: Boolean,
    default: false,
  },
  name: {
    type: String,
  },
  slackUserId: {
    type: String,
    index: true,
  },
}, {
  versionKey: false,
});

schema.set('toJSON', {
  transform: (doc: Document, ret: Record<string, unknown>) => {
    delete ret.password;
    return ret;
  },
});

const User = mongoose.model<IUser>('User', schema);

export default User;
