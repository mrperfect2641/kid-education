import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ecoActionsApi, quizzesApi } from '@/db/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Award, Upload, BookOpen, Users } from 'lucide-react';
import { toast } from 'sonner';
import type { EcoActionWithDetails, QuizWithQuestions } from '@/types/types';

export default function TeacherDashboard() {
  const [pendingActions, setPendingActions] = useState<EcoActionWithDetails[]>([]);
  const [quizzes, setQuizzes] = useState<QuizWithQuestions[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [actionsData, quizzesData] = await Promise.all([
        ecoActionsApi.getPendingActions(),
        quizzesApi.getAllQuizzes(),
      ]);
      setPendingActions(actionsData);
      setQuizzes(quizzesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewAction = async (actionId: string, status: 'approved' | 'rejected') => {
    try {
      const user = await import('@/db/api').then(m => m.profilesApi.getCurrentUser());
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
        <h1 className="text-3xl font-bold gradient-text">Teacher Dashboard</h1>
        <p className="text-muted-foreground">Manage quizzes and review student activities</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">My Quizzes</CardTitle>
            <Award className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quizzes.length}</div>
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

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your teaching content</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full" variant="outline">
              <Link to="/quizzes">
                <Award className="w-4 h-4 mr-2" />
                View All Quizzes
              </Link>
            </Button>
            <Button asChild className="w-full" variant="outline">
              <Link to="/learn">
                <BookOpen className="w-4 h-4 mr-2" />
                View Learning Modules
              </Link>
            </Button>
            <Button asChild className="w-full" variant="outline">
              <Link to="/leaderboard">
                <Users className="w-4 h-4 mr-2" />
                View Leaderboard
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle>Pending Eco-Actions</CardTitle>
            <CardDescription>Review student submissions</CardDescription>
          </CardHeader>
          <CardContent>
            {pendingActions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No pending reviews</p>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {pendingActions.slice(0, 5).map((action) => (
                  <div key={action.id} className="border rounded-lg p-3 space-y-2">
                    <div>
                      <p className="font-medium text-sm">{action.title}</p>
                      <p className="text-xs text-muted-foreground">
                        By {action.student?.username}
                      </p>
                    </div>
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
    </div>
  );
}
