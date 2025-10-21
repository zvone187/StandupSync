import { useState, useEffect } from 'react';
import { UserManagementTable } from '@/components/admin/UserManagementTable';
import { getAllUsers, updateUser, deleteUser, getCurrentUser } from '@/api/users';
import { useToast } from '@/hooks/useToast';
import { Loader2, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface User {
  _id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string;
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
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching users and current user...');
        const [usersResponse, currentUserResponse] = await Promise.all([
          getAllUsers() as Promise<UsersResponse>,
          getCurrentUser() as Promise<CurrentUserResponse>,
        ]);

        setUsers(usersResponse.users);
        setCurrentUserId(currentUserResponse.user._id);
        console.log('Users loaded:', usersResponse.users.length);
      } catch (error: unknown) {
        console.error('Error fetching users:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to load users';
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
      const response = await updateUser(userId, data) as UserResponse;

      setUsers((prev) =>
        prev.map((user) =>
          user._id === userId ? { ...user, ...data } : user
        )
      );

      toast({
        title: 'Success',
        description: response.message || 'User updated successfully',
      });
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center gap-3">
        <Users className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Manage Users</h1>
          <p className="text-muted-foreground">Manage user roles and permissions</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            Total users: {users.length} | Active: {users.filter((u) => u.isActive).length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserManagementTable
            users={users}
            currentUserId={currentUserId}
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
          />
        </CardContent>
      </Card>
    </div>
  );
}