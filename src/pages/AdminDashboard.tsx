import { useEffect, useState } from 'react';
import { profilesApi, ecoActionsApi } from '@/db/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Upload, Award, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import type { Profile, EcoActionWithDetails, UserRole } from '@/types/types';

export default function AdminDashboard() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [pendingActions, setPendingActions] = useState<EcoActionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usersData, actionsData] = await Promise.all([
        profilesApi.getAllProfiles(),
        ecoActionsApi.getPendingActions(),
      ]);
      setUsers(usersData);
      setPendingActions(actionsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      await profilesApi.updateProfile(userId, { role: newRole });
      toast.success('User role updated successfully');
      loadData();
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update user role');
    }
  };

  const handleReviewAction = async (actionId: string, status: 'approved' | 'rejected') => {
    try {
      const user = await profilesApi.getCurrentUser();
      if (!user) return;

      await ecoActionsApi.reviewAction(actionId, status, user.id);
      toast.success(`Eco-action ${status}`);
      loadData();
    } catch (error) {
      console.error('Error reviewing action:', error);
      toast.error('Failed to review eco-action');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-10 w-64 bg-muted" />
        <div className="grid gap-6 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48 bg-muted" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage users and review eco-actions</p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <Upload className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingActions.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>Manage user roles and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{user.full_name || user.username}</p>
                  <p className="text-sm text-muted-foreground">{user.username}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="capitalize">{user.role}</Badge>
                  <Select
                    value={user.role}
                    onValueChange={(value) => handleRoleChange(user.id, value as UserRole)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="teacher">Teacher</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pending Eco-Actions</CardTitle>
          <CardDescription>Review and approve student submissions</CardDescription>
        </CardHeader>
        <CardContent>
          {pendingActions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No pending eco-actions</p>
          ) : (
            <div className="space-y-4">
              {pendingActions.map((action) => (
                <div key={action.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{action.title}</p>
                      <p className="text-sm text-muted-foreground">
                        By {action.student?.username} • {action.action_type}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm">{action.description}</p>
                  {action.image_url && (
                    <img
                      src={action.image_url}
                      alt={action.title}
                      className="w-full max-w-sm rounded-lg"
                    />
                  )}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleReviewAction(action.id, 'approved')}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleReviewAction(action.id, 'rejected')}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
