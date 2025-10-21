import mongoose, { Schema } from 'mongoose';
import { isPasswordHash } from '../utils/password';
import { randomUUID } from 'crypto';
import { ROLES, ALL_ROLES } from 'shared';
const schema = new Schema({
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
}, {
    versionKey: false,
});
schema.set('toJSON', {
    transform: (doc, ret) => {
        delete ret.password;
        return ret;
    },
});
const User = mongoose.model('User', schema);
export default User;
//# sourceMappingURL=User.js.map