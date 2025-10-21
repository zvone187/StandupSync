import { IUser } from '../models/User';
import mongoose from 'mongoose';
interface CreateUserData {
    email: string;
    password: string;
    name?: string;
    role?: string;
    teamId?: mongoose.Types.ObjectId;
    invitedBy?: mongoose.Types.ObjectId;
    isInvited?: boolean;
}
declare class UserService {
    static list(): Promise<IUser[]>;
    static get(id: string): Promise<IUser | null>;
    static getByEmail(email: string): Promise<IUser | null>;
    static update(id: string, data: Partial<IUser>): Promise<IUser | null>;
    static delete(id: string): Promise<boolean>;
    static authenticateWithPassword(email: string, password: string): Promise<IUser | null>;
    static create({ email, password, name, role, teamId, invitedBy, isInvited }: CreateUserData): Promise<IUser>;
    static setPassword(user: IUser, password: string): Promise<IUser>;
    /**
     * Get all users in a team
     */
    static getTeamMembers(teamId: mongoose.Types.ObjectId): Promise<IUser[]>;
    /**
     * Get all admins (users who are their own team)
     */
    static getAdmins(): Promise<IUser[]>;
    /**
     * Check if user is admin of their team
     */
    static isTeamAdmin(userId: string, teamId: mongoose.Types.ObjectId): Promise<boolean>;
    /**
     * Update user role
     */
    static updateRole(userId: string, role: string): Promise<IUser | null>;
    /**
     * Activate or deactivate user
     */
    static setActiveStatus(userId: string, isActive: boolean): Promise<IUser | null>;
}
export default UserService;
//# sourceMappingURL=userService.d.ts.map