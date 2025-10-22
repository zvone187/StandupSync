import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Trash2, Shield, User as UserIcon } from 'lucide-react';
import { format } from 'date-fns';

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

interface UserManagementTableProps {
  users: User[];
  currentUserId: string;
  slackMembers: SlackMember[];
  onUpdateUser: (userId: string, data: { role?: string; isActive?: boolean }) => void;
  onUpdateSlackId: (userId: string, slackUserId: string | null) => void;
  onDeleteUser: (userId: string) => void;
}

export function UserManagementTable({
  users,
  currentUserId,
  slackMembers,
  onUpdateUser,
  onUpdateSlackId,
  onDeleteUser,
}: UserManagementTableProps) {
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const handleRoleChange = async (userId: string, role: string) => {
    setUpdatingUserId(userId);
    await onUpdateUser(userId, { role });
    setUpdatingUserId(null);
  };

  const handleStatusToggle = async (userId: string, isActive: boolean) => {
    setUpdatingUserId(userId);
    await onUpdateUser(userId, { isActive });
    setUpdatingUserId(null);
  };

  const handleSlackUserChange = async (userId: string, slackUserId: string) => {
    setUpdatingUserId(userId);
    await onUpdateSlackId(userId, slackUserId === 'none' ? null : slackUserId);
    setUpdatingUserId(null);
  };

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Slack User</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Last Login</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => {
            const isCurrentUser = user._id === currentUserId;
            const isUpdating = updatingUserId === user._id;

            return (
              <TableRow key={user._id}>
                <TableCell className="font-medium">{user.email}</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>
                  <Select
                    value={user.role}
                    onValueChange={(value) => handleRoleChange(user._id, value)}
                    disabled={isCurrentUser || isUpdating}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Admin
                        </div>
                      </SelectItem>
                      <SelectItem value="user">
                        <div className="flex items-center gap-2">
                          <UserIcon className="h-4 w-4" />
                          User
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleStatusToggle(user._id, !user.isActive)}
                    disabled={isCurrentUser || isUpdating}
                  >
                    <Badge variant={user.isActive ? 'default' : 'secondary'}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </Button>
                </TableCell>
                <TableCell>
                  <Select
                    value={user.slackUserId || 'none'}
                    onValueChange={(value) => handleSlackUserChange(user._id, value)}
                    disabled={isUpdating || slackMembers.length === 0}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder={slackMembers.length === 0 ? 'No Slack connected' : 'Select Slack user'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">
                        <span className="text-muted-foreground">Not linked</span>
                      </SelectItem>
                      {slackMembers.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          <div className="flex items-center gap-2">
                            {member.profile.image && (
                              <img
                                src={member.profile.image}
                                alt={member.profile.display_name}
                                className="h-5 w-5 rounded-full"
                              />
                            )}
                            <span>{member.profile.display_name}</span>
                            {member.profile.email && (
                              <span className="text-xs text-muted-foreground">
                                ({member.profile.email})
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {format(new Date(user.createdAt), 'MMM d, yyyy')}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {format(new Date(user.lastLoginAt), 'MMM d, yyyy HH:mm')}
                </TableCell>
                <TableCell className="text-right">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={isCurrentUser || isUpdating}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-background">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete User</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete {user.email}? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDeleteUser(user._id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}