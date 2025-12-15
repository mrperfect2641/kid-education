import { useEffect, useState } from 'react';
import { profilesApi, ecoActionsApi, quizAttemptsApi, challengeProgressApi } from '@/db/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Upload, Award, FileText, TrendingUp, Activity } from 'lucide-react';
import { toast } from 'sonner';
import type { Profile, EcoActionWithDetails, UserRole } from '@/types/types';

export default function AdminDashboard() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [pendingActions, setPendingActions] = useState<EcoActionWithDetails[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<any[]>([]);
  const [gameProgress, setGameProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usersData, actionsData, attemptsData, progressData] = await Promise.all([
        profilesApi.getAllProfiles(),
        ecoActionsApi.getPendingActions(),
        quizAttemptsApi.getAllAttempts(),
        challengeProgressApi.getAllProgress(),
      ]);
      setUsers(usersData);
      setPendingActions(actionsData);
      setQuizAttempts(attemptsData);
      setGameProgress(progressData);
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

  const generateReport = () => {
    const totalUsers = users.length;
    const students = users.filter(u => u.role === 'student').length;
    const teachers = users.filter(u => u.role === 'teacher').length;
    const admins = users.filter(u => u.role === 'admin').length;
    const totalPoints = users.reduce((sum, u) => sum + u.total_points, 0);
    const avgPoints = totalUsers > 0 ? (totalPoints / totalUsers).toFixed(2) : 0;
    const totalQuizAttempts = quizAttempts.length;
    const totalGamesPlayed = gameProgress.length;
    const completedGames = gameProgress.filter(g => g.completed).length;

    const report = `
=== ENVIRONMENTAL EDUCATION PLATFORM - ADMIN REPORT ===
Generated: ${new Date().toLocaleString()}

USER STATISTICS:
- Total Users: ${totalUsers}
- Students: ${students}
- Teachers: ${teachers}
- Admins: ${admins}

STUDENT ENGAGEMENT METRICS:
- Total Eco-Points Earned: ${totalPoints}
- Average Points per User: ${avgPoints}
- Total Quiz Attempts: ${totalQuizAttempts}
- Total Games Played: ${totalGamesPlayed}
- Games Completed: ${completedGames}
- Pending Eco-Actions: ${pendingActions.length}

TOP PERFORMING STUDENTS:
${users
  .filter(u => u.role === 'student')
  .sort((a, b) => b.total_points - a.total_points)
  .slice(0, 10)
  .map((u, i) => `${i + 1}. ${u.username} - ${u.total_points} points`)
  .join('\n')}

STUDENT QUIZ PERFORMANCE:
${quizAttempts.slice(0, 10).map((attempt: any, i: number) => 
  `${i + 1}. ${attempt.student?.username || 'Unknown'} - ${attempt.quiz?.title || 'Unknown Quiz'} - Score: ${attempt.score}/${attempt.total_questions} - Points: ${attempt.points_earned}`
).join('\n')}

STUDENT GAME PERFORMANCE:
${gameProgress.slice(0, 10).map((progress: any, i: number) => 
  `${i + 1}. ${progress.student?.username || 'Unknown'} - ${progress.challenge?.title || 'Unknown Game'} - Score: ${progress.score}% - ${progress.completed ? 'Completed' : 'In Progress'}`
).join('\n')}

DATABASE INTEGRITY CHECK:
- Total Profiles: ${users.length}
- Total Quizzes: ${quizAttempts.length > 0 ? 'Active' : 'No data'}
- Total Games: ${gameProgress.length > 0 ? 'Active' : 'No data'}
- Total Eco-Actions: ${pendingActions.length}
- Database Status: Operational

=== END OF REPORT ===
    `;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-report-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Admin report generated successfully!');
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

  const totalPoints = users.reduce((sum, u) => sum + u.total_points, 0);
  const students = users.filter(u => u.role === 'student');
  const teachers = users.filter(u => u.role === 'teacher');

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage students, database integrity, and generate reports</p>
        </div>
        <Button onClick={generateReport}>
          <FileText className="w-4 h-4 mr-2" />
          Generate Student Report
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {students.length} students, {teachers.length} teachers
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <Upload className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingActions.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Eco-actions awaiting approval</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
            <Award className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPoints}</div>
            <p className="text-xs text-muted-foreground mt-1">Across all users</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Activity</CardTitle>
            <Activity className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quizAttempts.length + gameProgress.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Total engagements</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>Manage user accounts and assign roles</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Current Role</TableHead>
                <TableHead>Points</TableHead>
                <TableHead>Change Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>{user.full_name || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge className="capitalize">{user.role}</Badge>
                  </TableCell>
                  <TableCell className="text-primary font-medium">{user.total_points}</TableCell>
                  <TableCell>
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
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Database Integrity</CardTitle>
            <CardDescription>System health and data consistency</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-accent">
              <span className="text-sm font-medium">Total User Profiles</span>
              <span className="text-lg font-bold text-primary">{users.length}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-accent">
              <span className="text-sm font-medium">Quiz Attempts Recorded</span>
              <span className="text-lg font-bold text-primary">{quizAttempts.length}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-accent">
              <span className="text-sm font-medium">Game Progress Entries</span>
              <span className="text-lg font-bold text-primary">{gameProgress.length}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-accent">
              <span className="text-sm font-medium">Eco-Actions Submitted</span>
              <span className="text-lg font-bold text-primary">{pendingActions.length}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-success/10 border border-success">
              <span className="text-sm font-medium">Database Status</span>
              <span className="text-sm font-bold text-success">✓ Operational</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Performing Students</CardTitle>
            <CardDescription>Students with highest eco-points</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {users
                .filter(u => u.role === 'student')
                .sort((a, b) => b.total_points - a.total_points)
                .slice(0, 5)
                .map((user, index) => (
                  <div key={user.id} className="flex items-center justify-between p-3 rounded-lg bg-accent">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-muted-foreground">#{index + 1}</span>
                      <div>
                        <p className="font-medium">{user.username}</p>
                        <p className="text-xs text-muted-foreground">{user.full_name || 'No email'}</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-primary">{user.total_points}</span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

