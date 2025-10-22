import { useState, useEffect } from 'react';
import { UserManagementTable } from '@/components/admin/UserManagementTable';
import { getTeamMembers, updateUserRole, updateUserStatus, deleteUser, getCurrentUser, inviteUser, updateUserSlackId } from '@/api/users';
import { getSlackSettings, getSlackMembers } from '@/api/slack';
import { useToast } from '@/hooks/useToast';
import { Loader2, Users, UserPlus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface User {
  _id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string;
  slackUserId?: string;
}

interface SlackMember {
  id: string;
  name: string;
  real_name: string;
  profile: {
    display_name: string;
    email?: string;
    image?: string;
  };
}

interface UserResponse {
  user: User;
  message?: string;
}

interface UsersResponse {
  users: User[];
}

interface CurrentUserResponse {
  user: {
    _id: string;
    email: string;
    name: string;
    role: string;
  };
}

export function ManageUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [slackMembers, setSlackMembers] = useState<SlackMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState('user');
  const [inviting, setInviting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching team members and current user...');
        const [usersResponse, currentUserResponse] = await Promise.all([
          getTeamMembers() as Promise<UsersResponse>,
          getCurrentUser() as Promise<CurrentUserResponse>,
        ]);

        setUsers(usersResponse.users);
        setCurrentUserId(currentUserResponse.user._id);
        console.log('Team members loaded:', usersResponse.users.length);

        // Fetch Slack members if Slack is connected
        try {
          const slackSettingsResponse = await getSlackSettings();
          if (slackSettingsResponse.settings?.isConnected && slackSettingsResponse.settings?.slackAccessToken) {
            console.log('Fetching Slack members...');
            const slackMembersResponse = await getSlackMembers(slackSettingsResponse.settings.slackAccessToken);
            setSlackMembers(slackMembersResponse.members || []);
            console.log('Slack members loaded:', slackMembersResponse.members?.length || 0);
          }
        } catch (slackError) {
          console.log('Slack not connected or error fetching members:', slackError);
          // Don't show error toast, just leave slackMembers empty
        }
      } catch (error: unknown) {
        console.error('Error fetching team members:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to load team members';
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const handleUpdateUser = async (userId: string, data: { role?: string; isActive?: boolean }) => {
    try {
      console.log('Updating user:', userId, data);

      // Handle role update
      if (data.role !== undefined) {
        const response = await updateUserRole(userId, data.role) as UserResponse;
        setUsers((prev) =>
          prev.map((user) =>
            user._id === userId ? { ...user, role: response.user.role } : user
          )
        );
        toast({
          title: 'Success',
          description: 'User role updated successfully',
        });
      }

      // Handle status update
      if (data.isActive !== undefined) {
        const response = await updateUserStatus(userId, data.isActive) as UserResponse;
        setUsers((prev) =>
          prev.map((user) =>
            user._id === userId ? { ...user, isActive: response.user.isActive } : user
          )
        );
        toast({
          title: 'Success',
          description: data.isActive ? 'User activated successfully' : 'User deactivated successfully',
        });
      }

      console.log('User updated successfully');
    } catch (error: unknown) {
      console.error('Error updating user:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update user';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      console.log('Deleting user:', userId);
      await deleteUser(userId);

      setUsers((prev) => prev.filter((user) => user._id !== userId));

      toast({
        title: 'Success',
        description: 'User deleted successfully',
      });
      console.log('User deleted successfully');
    } catch (error: unknown) {
      console.error('Error deleting user:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete user';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleUpdateSlackId = async (userId: string, slackUserId: string | null) => {
    try {
      console.log('Updating Slack ID for user:', userId, slackUserId);
      const response = await updateUserSlackId(userId, slackUserId) as UserResponse;

      setUsers((prev) =>
        prev.map((user) =>
          user._id === userId ? { ...user, slackUserId: response.user.slackUserId } : user
        )
      );

      toast({
        title: 'Success',
        description: slackUserId ? 'Slack user linked successfully' : 'Slack user unlinked successfully',
      });
      console.log('Slack ID updated successfully');
    } catch (error: unknown) {
      console.error('Error updating Slack ID:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update Slack ID';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleInviteUser = async () => {
    if (!inviteEmail || !inviteEmail.includes('@')) {
      toast({
        title: 'Error',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      });
      return;
    }

    try {
      setInviting(true);
      console.log('Inviting user:', { email: inviteEmail, name: inviteName, role: inviteRole });

      interface InviteResponse {
        user: User;
        message: string;
      }

      const response = await inviteUser({
        email: inviteEmail,
        name: inviteName || undefined,
        role: inviteRole,
      }) as InviteResponse;

      // Add the new user to the list
      setUsers((prev) => [...prev, response.user]);

      // Reset form and close dialog
      setInviteEmail('');
      setInviteName('');
      setInviteRole('user');
      setInviteDialogOpen(false);

      toast({
        title: 'Success',
        description: response.message || 'User invited successfully',
      });
      console.log('User invited successfully');
    } catch (error: unknown) {
      console.error('Error inviting user:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to invite user';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setInviting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Manage Users</h1>
            <p className="text-muted-foreground">Manage user roles and permissions</p>
          </div>
        </div>

        <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <UserPlus className="h-4 w-4" />
              Invite User
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-background">
            <DialogHeader>
              <DialogTitle>Invite New User</DialogTitle>
              <DialogDescription>
                Send an invitation email with login credentials to a new team member.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  disabled={inviting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Name (optional)</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  disabled={inviting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={inviteRole} onValueChange={setInviteRole} disabled={inviting}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setInviteDialogOpen(false)}
                disabled={inviting}
              >
                Cancel
              </Button>
              <Button onClick={handleInviteUser} disabled={inviting}>
                {inviting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Inviting...
                  </>
                ) : (
                  'Send Invitation'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            Total users: {users.length} | Active: {users.filter((u) => u.isActive).length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserManagementTable
            users={users}
            currentUserId={currentUserId}
            slackMembers={slackMembers}
            onUpdateUser={handleUpdateUser}
            onUpdateSlackId={handleUpdateSlackId}
            onDeleteUser={handleDeleteUser}
          />
        </CardContent>
      </Card>
    </div>
  );
}