import express, { Request, Response } from 'express';
import { requireUser, requireRole } from './middlewares/auth';
import UserService from '../services/userService';
import { sendInvitationEmail } from '../services/emailService';
import { ROLES } from 'shared';
const cryptoRandomString = require('crypto-random-string');

const router = express.Router();

// Description: Get all team members
// Endpoint: GET /api/users/team
// Request: {}
// Response: { users: Array<User> }
router.get('/team', requireUser, async (req: Request, res: Response) => {
  try {
    const currentUser = req.user;

    if (!currentUser) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log(`📋 Fetching team members for team ${currentUser.teamId}`);
    const teamMembers = await UserService.getTeamMembers(currentUser.teamId);

    res.status(200).json({ users: teamMembers });
  } catch (error) {
    console.error('❌ Error fetching team members:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch team members' });
  }
});

// Description: Get current user profile
// Endpoint: GET /api/users/me
// Request: {}
// Response: { user: User }
router.get('/me', requireUser, async (req: Request, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error('❌ Error fetching current user:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch user' });
  }
});

// Description: Get all users (admin only - for managing all teams)
// Endpoint: GET /api/users
// Request: {}
// Response: { users: Array<User> }
router.get('/', requireRole(ROLES.ADMIN), async (req: Request, res: Response) => {
  try {
    const currentUser = req.user;

    if (!currentUser) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log(`📋 Admin ${currentUser.email} fetching all users`);
    const users = await UserService.list();

    res.status(200).json({ users });
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch users' });
  }
});

// Description: Invite a new user to the team (admin only)
// Endpoint: POST /api/users/invite
// Request: { email: string, name?: string, role?: string }
// Response: { user: User, message: string }
router.post('/invite', requireRole(ROLES.ADMIN), async (req: Request, res: Response) => {
  try {
    const { email, name, role = ROLES.USER } = req.body;
    const currentUser = req.user;

    if (!currentUser) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    console.log(`👥 Admin ${currentUser.email} inviting user ${email}`);

    // Generate a random temporary password
    const tempPassword = cryptoRandomString({ length: 12, type: 'alphanumeric' });

    // Create the user
    const newUser = await UserService.create({
      email,
      name: name || email.split('@')[0],
      password: tempPassword,
      role,
      teamId: currentUser.teamId,
      invitedBy: currentUser._id,
      isInvited: true,
    });

    // Send invitation email
    try {
      const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`;
      await sendInvitationEmail({
        toEmail: email,
        toName: name || email.split('@')[0],
        inviterName: currentUser.name || currentUser.email,
        tempPassword,
        loginUrl,
      });
    } catch (emailError) {
      console.error('⚠️ Failed to send invitation email, but user was created:', emailError);
      // Continue - user was created successfully
    }

    res.status(201).json({
      user: newUser,
      message: 'User invited successfully. An email with login credentials has been sent.',
    });
  } catch (error) {
    console.error('❌ Error inviting user:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to invite user' });
  }
});

// Description: Update user role (admin only)
// Endpoint: PUT /api/users/:id/role
// Request: { role: string }
// Response: { user: User }
router.put('/:id/role', requireRole(ROLES.ADMIN), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const currentUser = req.user;

    if (!currentUser) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!role) {
      return res.status(400).json({ error: 'Role is required' });
    }

    // Prevent user from changing their own role
    if (id === currentUser._id.toString()) {
      return res.status(403).json({ error: 'Cannot change your own role' });
    }

    // Check if target user is in the same team
    const targetUser = await UserService.get(id);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (targetUser.teamId.toString() !== currentUser.teamId.toString()) {
      return res.status(403).json({ error: 'Cannot modify users from other teams' });
    }

    console.log(`🔄 Admin ${currentUser.email} updating role of ${targetUser.email} to ${role}`);
    const updatedUser = await UserService.updateRole(id, role);

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ user: updatedUser });
  } catch (error) {
    console.error('❌ Error updating user role:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to update user role' });
  }
});

// Description: Activate or deactivate user (admin only)
// Endpoint: PUT /api/users/:id/status
// Request: { isActive: boolean }
// Response: { user: User }
router.put('/:id/status', requireRole(ROLES.ADMIN), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    const currentUser = req.user;

    if (!currentUser) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ error: 'isActive must be a boolean' });
    }

    // Prevent user from deactivating themselves
    if (id === currentUser._id.toString()) {
      return res.status(403).json({ error: 'Cannot change your own status' });
    }

    // Check if target user is in the same team
    const targetUser = await UserService.get(id);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (targetUser.teamId.toString() !== currentUser.teamId.toString()) {
      return res.status(403).json({ error: 'Cannot modify users from other teams' });
    }

    console.log(`🔄 Admin ${currentUser.email} ${isActive ? 'activating' : 'deactivating'} ${targetUser.email}`);
    const updatedUser = await UserService.setActiveStatus(id, isActive);

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ user: updatedUser });
  } catch (error) {
    console.error('❌ Error updating user status:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to update user status' });
  }
});

// Description: Delete user (admin only)
// Endpoint: DELETE /api/users/:id
// Request: {}
// Response: { message: string }
router.delete('/:id', requireRole(ROLES.ADMIN), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;

    if (!currentUser) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Prevent user from deleting themselves
    if (id === currentUser._id.toString()) {
      return res.status(403).json({ error: 'Cannot delete yourself' });
    }

    // Check if target user is in the same team
    const targetUser = await UserService.get(id);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (targetUser.teamId.toString() !== currentUser.teamId.toString()) {
      return res.status(403).json({ error: 'Cannot delete users from other teams' });
    }

    console.log(`🗑️  Admin ${currentUser.email} deleting user ${targetUser.email}`);
    const deleted = await UserService.delete(id);

    if (!deleted) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting user:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to delete user' });
  }
});

export default router;
