import mongoose, { Document } from 'mongoose';
import { RoleValues } from 'shared';
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
}
declare const User: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, {}> & IUser & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default User;
//# sourceMappingURL=User.d.ts.map