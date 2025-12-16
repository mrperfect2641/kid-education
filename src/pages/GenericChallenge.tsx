import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { challengesApi, challengeProgressApi, profilesApi } from '@/db/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Gamepad2, Trophy, CheckCircle2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import type { Challenge, ChallengeProgress } from '@/types/types';

export default function GenericChallenge() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [progress, setProgress] = useState<ChallengeProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    loadChallenge();
  }, [id]);

  const loadChallenge = async () => {
    if (!id) return;

    try {
      const user = await profilesApi.getCurrentUser();
      const challengeData = await challengesApi.getChallenge(id);
      setChallenge(challengeData);

      if (user && challengeData) {
        const progressData = await challengeProgressApi.getStudentProgress(user.id);
        const currentProgress = progressData.find((p: ChallengeProgress) => p.challenge_id === id);
        setProgress(currentProgress || null);
      }
    } catch (error) {
      console.error('Error loading challenge:', error);
      toast.error('Failed to load challenge');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteChallenge = async () => {
    if (!challenge || !id) return;

    try {
      const user = await profilesApi.getCurrentUser();
      if (!user) {
        toast.error('Please log in to complete challenges');
        return;
      }

      setCompleting(true);

      // Create or update progress
      await challengeProgressApi.createOrUpdateProgress({
        student_id: user.id,
        challenge_id: id,
        completed: true,
        score: 100,
        attempts: (progress?.attempts || 0) + 1,
        points_earned: challenge.points_reward,
        completed_at: new Date().toISOString(),
      });

      // Update user points
      await profilesApi.updateProfile(user.id, {
        total_points: (user.total_points || 0) + challenge.points_reward,
      });

      toast.success(`Challenge completed! You earned ${challenge.points_reward} eco-points!`);
      navigate('/challenges');
    } catch (error) {
      console.error('Error completing challenge:', error);
      toast.error('Failed to complete challenge');
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-10 w-64 mb-6 bg-muted" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-full bg-muted" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-40 w-full bg-muted" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Challenge not found</p>
            <Button onClick={() => navigate('/challenges')} className="mt-4">
              Back to Challenges
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isCompleted = progress?.completed || false;

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <Button variant="outline" onClick={() => navigate('/challenges')}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Challenges
      </Button>

      <Card className="shadow-elegant">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Gamepad2 className="w-5 h-5 text-primary" />
                </div>
                <CardTitle className="text-2xl">{challenge.title}</CardTitle>
              </div>
              <CardDescription className="text-base">
                {challenge.description}
              </CardDescription>
            </div>
            {isCompleted && (
              <CheckCircle2 className="w-8 h-8 text-success flex-shrink-0" />
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap mt-4">
            <Badge variant="secondary" className="capitalize">
              {challenge.difficulty}
            </Badge>
            <Badge variant="outline" className="capitalize">
              {challenge.challenge_type}
            </Badge>
            <Badge variant="default" className="flex items-center gap-1">
              <Trophy className="w-3 h-3" />
              {challenge.points_reward} points
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {challenge.instructions && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Instructions</h3>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {challenge.instructions}
                </p>
              </div>
            </div>
          )}

          {progress && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Your Progress</h3>
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Attempts:</span>
                  <span className="font-medium">{progress.attempts}</span>
                </div>
                {progress.score !== null && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Best Score:</span>
                    <span className="font-medium">{progress.score}%</span>
                  </div>
                )}
                {progress.points_earned > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Points Earned:</span>
                    <span className="font-medium text-primary">{progress.points_earned}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Challenge Task</h3>
            <div className="bg-primary/5 border-2 border-primary/20 p-6 rounded-lg text-center space-y-4">
              <p className="text-muted-foreground">
                Complete this environmental challenge by following the instructions above.
              </p>
              <p className="text-sm text-muted-foreground">
                Once you've completed the task in real life or understood the concept, click the button below to mark it as complete.
              </p>
            </div>
          </div>

          <div className="flex justify-center pt-4">
            <Button
              size="lg"
              onClick={handleCompleteChallenge}
              disabled={isCompleted || completing}
              className="min-w-[200px]"
            >
              {completing ? 'Completing...' : isCompleted ? 'Completed ✓' : 'Mark as Complete'}
            </Button>
          </div>

          {isCompleted && (
            <div className="text-center text-sm text-muted-foreground">
              You've already completed this challenge!
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
