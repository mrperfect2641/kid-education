import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { profilesApi, ecoActionsApi, quizAttemptsApi, challengeProgressApi, quizzesApi, challengesApi, topicsApi } from '@/db/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Users, Upload, Award, FileText, TrendingUp, Activity, Edit, Trash2, BookOpen, Gamepad2, Trophy, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';
import { toast } from 'sonner';
import CreateQuizDialog from '@/components/teacher/CreateQuizDialog';
import CreateGameDialog from '@/components/teacher/CreateGameDialog';
import CreateModuleDialog from '@/components/teacher/CreateModuleDialog';
import type { Profile, EcoActionWithDetails, UserRole, QuizWithQuestions, Challenge, Topic } from '@/types/types';

export default function AdminDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [users, setUsers] = useState<Profile[]>([]);
  const [pendingActions, setPendingActions] = useState<EcoActionWithDetails[]>([]);
  const [allEcoActions, setAllEcoActions] = useState<EcoActionWithDetails[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<any[]>([]);
  const [gameProgress, setGameProgress] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<QuizWithQuestions[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Get active tab from URL query parameter, default to 'admin-overview'
  const activeTab = searchParams.get('tab') || 'admin-overview';

  // Edit User State
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const [editFirstName, setEditFirstName] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('student');

  // Delete User State
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<Profile | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  const loadData = async () => {
    try {
      const [
        usersData,
        actionsData,
        attemptsData,
        progressData,
        quizzesData,
        challengesData,
        allActionsData,
        topicsData
      ] = await Promise.all([
        profilesApi.getAllProfiles(),
        ecoActionsApi.getPendingActions(),
        quizAttemptsApi.getAllAttempts(),
        challengeProgressApi.getAllProgress(),
        quizzesApi.getAllQuizzes(),
        challengesApi.getAllChallenges(),
        ecoActionsApi.getAllActions(),
        topicsApi.getAllTopics(),
      ]);
      setUsers(usersData);
      setPendingActions(actionsData);
      setQuizAttempts(attemptsData);
      setGameProgress(progressData);
      setQuizzes(quizzesData);
      setChallenges(challengesData);
      setAllEcoActions(allActionsData);
      setTopics(topicsData);

      // Calculate leaderboard data
      const students = usersData.filter(p => p.role === 'student');
      const leaderboard = students
        .map(student => {
          const studentQuizAttempts = attemptsData.filter(a => a.student_id === student.id);
          const studentGameProgress = progressData.filter(g => g.student_id === student.id);
          const completedGames = studentGameProgress.filter(g => g.completed).length;

          return {
            ...student,
            quizAttempts: studentQuizAttempts.length,
            gamesPlayed: studentGameProgress.length,
            gamesCompleted: completedGames,
            avgQuizScore: studentQuizAttempts.length > 0
              ? (studentQuizAttempts.reduce((sum, a) => sum + (a.score / a.total_questions * 100), 0) / studentQuizAttempts.length).toFixed(1)
              : 0,
          };
        })
        .sort((a, b) => b.total_points - a.total_points);

      setLeaderboardData(leaderboard);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (user: Profile) => {
    setEditingUser(user);
    setEditFirstName(user.full_name || '');
    setEditRole(user.role);
    setIsEditDialogOpen(true);
  };

  const handleEditUserSubmit = async () => {
    if (!editingUser) return;
    try {
      await profilesApi.updateProfile(editingUser.id, {
        full_name: editFirstName,
        role: editRole,
      });
      toast.success('User updated successfully');
      loadData();
      setIsEditDialogOpen(false);
      setEditingUser(null);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update user details');
    }
  };

  const openDeleteDialog = (user: Profile) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteUserConfirm = async () => {
    if (!userToDelete) return;
    try {
      await profilesApi.deleteProfile(userToDelete.id);
      toast.success('User profile removed successfully');
      loadData();
    } catch (error) {
      console.error('Error deleting profile:', error);
      toast.error('Failed to remove user account. They may have dependent records.');
    } finally {
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
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

  const handleDeleteTopic = async (topicId: string) => {
    if (!confirm('Are you sure you want to delete this learning module?')) {
      return;
    }

    try {
      await topicsApi.deleteTopic(topicId);
      toast.success('Learning module deleted successfully');
      loadData();
    } catch (error) {
      console.error('Error deleting topic:', error);
      toast.error('Failed to delete learning module');
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm('Are you sure you want to delete this quiz?')) {
      return;
    }

    try {
      await quizzesApi.deleteQuiz(quizId);
      toast.success('Quiz deleted successfully');
      loadData();
    } catch (error) {
      console.error('Error deleting quiz:', error);
      toast.error('Failed to delete quiz');
    }
  };

  const handleDeleteChallenge = async (challengeId: string) => {
    if (!confirm('Are you sure you want to delete this game?')) {
      return;
    }

    try {
      await challengesApi.deleteChallenge(challengeId);
      toast.success('Game deleted successfully');
      loadData();
    } catch (error) {
      console.error('Error deleting game:', error);
      toast.error('Failed to delete game');
    }
  };

  const handleReviewEcoAction = async (actionId: string, status: 'approved' | 'rejected', reviewNotes?: string) => {
    try {
      const user = await profilesApi.getCurrentUser();
      if (!user) {
        toast.error('You must be logged in to review eco-actions');
        return;
      }

      await ecoActionsApi.reviewAction(actionId, status, user.id, reviewNotes);
      toast.success(`Eco-action ${status} successfully!`);
      loadData();
    } catch (error) {
      console.error('Error reviewing eco-action:', error);
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
      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit User Profile</DialogTitle>
            <DialogDescription>
              Make changes to user role or name.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Display Name (Email)</Label>
              <Input
                id="edit-name"
                value={editFirstName}
                onChange={(e) => setEditFirstName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">User Role</Label>
              <Select value={editRole} onValueChange={(value) => setEditRole(value as UserRole)}>
                <SelectTrigger id="edit-role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="teacher">Teacher</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button type="button" onClick={handleEditUserSubmit}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the profile for <b>{userToDelete?.username}</b>.
              <br /><br />
              Warning: Deleting a profile will cascade-delete their quizzes, eco-actions, and challenge progress. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUserConfirm} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground border-destructive/20 border cursor-pointer">
              Yes, delete account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage students, modules, database integrity, and generate reports</p>
        </div>
        <Button onClick={generateReport}>
          <FileText className="w-4 h-4 mr-2" />
          Generate Report
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full grid-cols-7 overflow-x-auto h-auto min-h-10">
          <TabsTrigger value="admin-overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
          <TabsTrigger value="games">Games</TabsTrigger>
          <TabsTrigger value="modules">Modules</TabsTrigger>
          <TabsTrigger value="eco-actions">Eco-Actions</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="admin-overview" className="space-y-6">
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
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage user accounts, assign roles, and handle profiles</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Current Role</TableHead>
                    <TableHead>Points</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
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
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditDialog(user)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="bg-destructive/10 text-destructive hover:bg-destructive hover:text-white border-transparent"
                            onClick={() => openDeleteDialog(user)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quizzes Tab */}
        <TabsContent value="quizzes" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Quiz Management</CardTitle>
                <CardDescription>Create and manage quizzes with multiple-choice questions. Students can take these quizzes from the "Quizzes" page.</CardDescription>
              </div>
              <CreateQuizDialog onSuccess={loadData} />
            </CardHeader>
            <CardContent>
              {quizzes.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No quizzes created yet</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Quiz Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Questions</TableHead>
                      <TableHead>Attempts</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quizzes.map((quiz) => {
                      const attempts = quizAttempts.filter(r => r.quiz_id === quiz.id).length;
                      return (
                        <TableRow key={quiz.id}>
                          <TableCell className="font-medium">{quiz.title}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{quiz.topic?.title || 'General'}</Badge>
                          </TableCell>
                          <TableCell>{quiz.questions?.length || 0}</TableCell>
                          <TableCell>{attempts}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" asChild>
                                <Link to={`/quiz/${quiz.id}`}>
                                  <Edit className="w-4 h-4" />
                                </Link>
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteQuiz(quiz.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Games Tab */}
        <TabsContent value="games" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Game Management</CardTitle>
                <CardDescription>Create and manage interactive games and challenges. Students can play these games from the "Challenges" page.</CardDescription>
              </div>
              <CreateGameDialog onSuccess={loadData} />
            </CardHeader>
            <CardContent>
              {challenges.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No games created yet</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Game Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Points</TableHead>
                      <TableHead>Completions</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {challenges.map((challenge) => {
                      const completions = gameProgress.filter(r => r.challenge_id === challenge.id && r.completed).length;
                      return (
                        <TableRow key={challenge.id}>
                          <TableCell className="font-medium">{challenge.title}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{challenge.challenge_type}</Badge>
                          </TableCell>
                          <TableCell className="text-primary font-medium">{challenge.points_reward}</TableCell>
                          <TableCell>{completions}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" asChild>
                                <Link to={`/challenge/${challenge.id}`}>
                                  <Edit className="w-4 h-4" />
                                </Link>
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteChallenge(challenge.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Modules Tab */}
        <TabsContent value="modules" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Learning Modules Management</CardTitle>
                <CardDescription>Add, edit, or delete educational content</CardDescription>
              </div>
              <CreateModuleDialog onSuccess={loadData} />
            </CardHeader>
            <CardContent>
              {topics.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No learning modules created yet</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Module Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topics.map((topic) => (
                      <TableRow key={topic.id}>
                        <TableCell className="font-medium">{topic.title}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{topic.icon || 'General'}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(topic.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <CreateModuleDialog
                              module={topic}
                              onSuccess={loadData}
                              trigger={
                                <Button size="sm" variant="outline">
                                  <Edit className="w-4 h-4" />
                                </Button>
                              }
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteTopic(topic.id)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Eco-Actions Tab */}
        <TabsContent value="eco-actions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Student Eco-Actions</CardTitle>
              <CardDescription>Review and approve eco-actions submitted by students</CardDescription>
            </CardHeader>
            <CardContent>
              {allEcoActions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No eco-actions submitted yet</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Points</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allEcoActions.map((action) => (
                      <TableRow key={action.id}>
                        <TableCell className="font-medium">
                          {action.student?.username || 'Unknown'}
                        </TableCell>
                        <TableCell>{action.title}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{action.action_type}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            action.status === 'approved' ? 'default' :
                              action.status === 'rejected' ? 'destructive' :
                                'secondary'
                          }>
                            {action.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{action.points_reward}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(action.submitted_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline">
                                  <Eye className="w-4 h-4 mr-1" />
                                  View
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>{action.title}</DialogTitle>
                                  <DialogDescription>
                                    Submitted by {action.student?.username || 'Unknown'} on {new Date(action.submitted_at).toLocaleDateString()}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <h4 className="font-semibold mb-2">Type</h4>
                                    <Badge variant="outline">{action.action_type}</Badge>
                                  </div>
                                  {action.description && (
                                    <div>
                                      <h4 className="font-semibold mb-2">Description</h4>
                                      <p className="text-muted-foreground">{action.description}</p>
                                    </div>
                                  )}
                                  {action.image_url && (
                                    <div>
                                      <h4 className="font-semibold mb-2">Image</h4>
                                      <img
                                        src={action.image_url}
                                        alt={action.title}
                                        className="w-full rounded-lg border"
                                      />
                                    </div>
                                  )}
                                  <div>
                                    <h4 className="font-semibold mb-2">Status</h4>
                                    <Badge variant={
                                      action.status === 'approved' ? 'default' :
                                        action.status === 'rejected' ? 'destructive' :
                                          'secondary'
                                    }>
                                      {action.status}
                                    </Badge>
                                  </div>
                                  {action.review_notes && (
                                    <div>
                                      <h4 className="font-semibold mb-2">Review Notes</h4>
                                      <p className="text-muted-foreground">{action.review_notes}</p>
                                    </div>
                                  )}
                                  <div>
                                    <h4 className="font-semibold mb-2">Points Reward</h4>
                                    <p className="text-primary font-medium">{action.points_reward} points</p>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            {action.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() => handleReviewEcoAction(action.id, 'approved')}
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => {
                                    const notes = prompt('Enter rejection reason (optional):');
                                    handleReviewEcoAction(action.id, 'rejected', notes || undefined);
                                  }}
                                >
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Reject
                                </Button>
                              </>
                            )}
                            {action.status !== 'pending' && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                {action.status === 'approved' ? (
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                ) : (
                                  <XCircle className="w-4 h-4 text-red-500" />
                                )}
                                <span>Reviewed</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Student Leaderboard</CardTitle>
              <CardDescription>View student performance and rankings</CardDescription>
            </CardHeader>
            <CardContent>
              {leaderboardData.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No student data available</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Total Points</TableHead>
                      <TableHead>Quiz Attempts</TableHead>
                      <TableHead>Avg Quiz Score</TableHead>
                      <TableHead>Games Played</TableHead>
                      <TableHead>Games Completed</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaderboardData.map((student, index) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {index < 3 && <Trophy className={`w-4 h-4 ${index === 0 ? 'text-yellow-500' :
                                index === 1 ? 'text-gray-400' :
                                  'text-amber-600'
                              }`} />}
                            <span className="font-bold">#{index + 1}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{student.username}</TableCell>
                        <TableCell className="text-primary font-bold">{student.total_points}</TableCell>
                        <TableCell>{student.quizAttempts}</TableCell>
                        <TableCell>{student.avgQuizScore}%</TableCell>
                        <TableCell>{student.gamesPlayed}</TableCell>
                        <TableCell>{student.gamesCompleted}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}

