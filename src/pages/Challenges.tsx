import { useEffect, useState } from 'react';
import { challengesApi, challengeProgressApi, profilesApi } from '@/db/api';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Gamepad2, Trophy, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Challenge, ChallengeProgress } from '@/types/types';

export default function Challenges() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [progress, setProgress] = useState<Record<string, ChallengeProgress>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    try {
      const user = await profilesApi.getCurrentUser();
      const challengesData = await challengesApi.getAllChallenges();
      setChallenges(challengesData);

      if (user) {
        const progressData = await challengeProgressApi.getStudentProgress(user.id);
        const progressMap: Record<string, ChallengeProgress> = {};
        progressData.forEach((p: ChallengeProgress & { challenge?: Challenge }) => {
          progressMap[p.challenge_id] = p;
        });
        setProgress(progressMap);
      }
    } catch (error) {
      console.error('Error loading challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartChallenge = async (challenge: Challenge) => {
    try {
      const user = await profilesApi.getCurrentUser();
      if (!user) {
        toast.error('Please log in to play challenges');
        return;
      }

      const existingProgress = progress[challenge.id];
      if (existingProgress?.completed) {
        toast.info('You have already completed this challenge!');
        return;
      }

      const score = Math.floor(Math.random() * 100) + 50;
      const completed = score >= 70;

      await challengeProgressApi.createOrUpdateProgress({
        challenge_id: challenge.id,
        student_id: user.id,
        completed,
        score,
        points_earned: completed ? challenge.points_reward : 0,
        attempts: (existingProgress?.attempts || 0) + 1,
        completed_at: completed ? new Date().toISOString() : null,
      });

      if (completed) {
        toast.success(`Challenge completed! You earned ${challenge.points_reward} points! 🎉`);
      } else {
        toast.info(`Score: ${score}. Try again to complete the challenge!`);
      }

      loadChallenges();
    } catch (error) {
      console.error('Error starting challenge:', error);
      toast.error('Failed to start challenge');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-10 w-64 bg-muted" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
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
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Gamepad2 className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold gradient-text">Environmental Challenges</h1>
          <p className="text-muted-foreground">Complete fun interactive challenges and earn rewards</p>
        </div>
      </div>

      {challenges.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No challenges available yet. Check back soon!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {challenges.map((challenge) => {
            const challengeProgress = progress[challenge.id];
            const isCompleted = challengeProgress?.completed || false;

            return (
              <Card key={challenge.id} className="shadow-elegant hover:shadow-glow transition-smooth flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg">{challenge.title}</CardTitle>
                    {isCompleted && (
                      <CheckCircle2 className="w-6 h-6 text-success flex-shrink-0" />
                    )}
                  </div>
                  <CardDescription className="line-clamp-2">
                    {challenge.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className="capitalize">
                      {challenge.difficulty}
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      {challenge.challenge_type}
                    </Badge>
                  </div>

                  {challenge.instructions && (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {challenge.instructions}
                    </p>
                  )}

                  <div className="flex items-center gap-1 text-primary font-medium">
                    <Trophy className="w-4 h-4" />
                    <span>{challenge.points_reward} points</span>
                  </div>

                  {challengeProgress && (
                    <div className="text-sm text-muted-foreground">
                      Attempts: {challengeProgress.attempts}
                      {challengeProgress.score && ` | Best Score: ${challengeProgress.score}`}
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={() => handleStartChallenge(challenge)}
                    className="w-full"
                    disabled={isCompleted}
                  >
                    {isCompleted ? 'Completed ✓' : 'Start Challenge'}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
