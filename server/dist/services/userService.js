import User from '../models/User';
import { generatePasswordHash, validatePassword } from '../utils/password';
import { ROLES } from 'shared';
class UserService {
    static async list() {
        try {
            return await User.find();
        }
        catch (err) {
            throw new Error(`Database error while listing users: ${err}`);
        }
    }
    static async get(id) {
        try {
            return await User.findOne({ _id: id }).exec();
        }
        catch (err) {
            throw new Error(`Database error while getting the user by their ID: ${err}`);
        }
    }
    static async getByEmail(email) {
        try {
            return await User.findOne({ email }).exec();
        }
        catch (err) {
            throw new Error(`Database error while getting the user by their email: ${err}`);
        }
    }
    static async update(id, data) {
        try {
            return await User.findOneAndUpdate({ _id: id }, data, { new: true, upsert: false });
        }
        catch (err) {
            throw new Error(`Database error while updating user ${id}: ${err}`);
        }
    }
    static async delete(id) {
        try {
            const result = await User.deleteOne({ _id: id }).exec();
            return (result.deletedCount === 1);
        }
        catch (err) {
            throw new Error(`Database error while deleting user ${id}: ${err}`);
        }
    }
    static async authenticateWithPassword(email, password) {
        if (!email)
            throw new Error('Email is required');
        if (!password)
            throw new Error('Password is required');
        try {
            const user = await User.findOne({ email }).exec();
            if (!user)
                return null;
            const passwordValid = await validatePassword(password, user.password);
            if (!passwordValid)
                return null;
            user.lastLoginAt = new Date(Date.now());
            const updatedUser = await user.save();
            return updatedUser;
        }
        catch (err) {
            throw new Error(`Database error while authenticating user ${email} with password: ${err}`);
        }
    }
    static async create({ email, password, name = '', role, teamId, invitedBy, isInvited = false }) {
        if (!email)
            throw new Error('Email is required');
        if (!password)
            throw new Error('Password is required');
        const existingUser = await UserService.getByEmail(email);
        if (existingUser)
            throw new Error('User with this email already exists');
        const hash = await generatePasswordHash(password);
        // Check if this is the first user OR a non-invited user (self-registration)
        // These users become admins with their own team
        const userCount = await User.countDocuments();
        const isFirstUser = userCount === 0;
        const isSelfRegistration = !isInvited && !teamId;
        try {
            const user = new User({
                email,
                password: hash,
                name,
                role: (isFirstUser || isSelfRegistration) ? ROLES.ADMIN : (role || ROLES.USER),
                teamId: (isFirstUser || isSelfRegistration) ? undefined : teamId, // Will be set after save
                invitedBy,
                isInvited,
                invitedAt: isInvited ? new Date() : undefined,
            });
            // For self-registration (first user or non-invited), set teamId to their own _id
            if (isFirstUser || isSelfRegistration) {
                user.teamId = user._id;
            }
            await user.save();
            const logMessage = isFirstUser ? ' (first user - admin)' : (isSelfRegistration ? ' (self-registered - admin)' : '');
            console.log(`✅ Created user ${email} with role ${user.role}${logMessage}`);
            return user;
        }
        catch (err) {
            throw new Error(`Database error while creating new user: ${err}`);
        }
    }
    static async setPassword(user, password) {
        if (!password)
            throw new Error('Password is required');
        user.password = await generatePasswordHash(password);
        try {
            if (!user.isNew) {
                await user.save();
            }
            return user;
        }
        catch (err) {
            throw new Error(`Database error while setting user password: ${err}`);
        }
    }
    /**
     * Get all users in a team
     */
    static async getTeamMembers(teamId) {
        try {
            return await User.find({ teamId }).sort({ createdAt: -1 }).exec();
        }
        catch (err) {
            throw new Error(`Database error while getting team members: ${err}`);
        }
    }
    /**
     * Get all admins (users who are their own team)
     */
    static async getAdmins() {
        try {
            return await User.find({ role: ROLES.ADMIN }).exec();
        }
        catch (err) {
            throw new Error(`Database error while getting admins: ${err}`);
        }
    }
    /**
     * Check if user is admin of their team
     */
    static async isTeamAdmin(userId, teamId) {
        try {
            const user = await User.findOne({ _id: userId, teamId, role: ROLES.ADMIN }).exec();
            return !!user;
        }
        catch (err) {
            throw new Error(`Database error while checking if user is team admin: ${err}`);
        }
    }
    /**
     * Update user role
     */
    static async updateRole(userId, role) {
        try {
            return await User.findOneAndUpdate({ _id: userId }, { role }, { new: true }).exec();
        }
        catch (err) {
            throw new Error(`Database error while updating user role: ${err}`);
        }
    }
    /**
     * Activate or deactivate user
     */
    static async setActiveStatus(userId, isActive) {
        try {
            return await User.findOneAndUpdate({ _id: userId }, { isActive }, { new: true }).exec();
        }
        catch (err) {
            throw new Error(`Database error while updating user active status: ${err}`);
        }
    }
}
export default UserService;
//# sourceMappingURL=userService.js.map