import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { profilesApi, leaderboardApi, badgesApi } from '@/db/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen, Trophy, Gamepad2, Upload, Award, TrendingUp, Leaf } from 'lucide-react';
import type { Profile, LeaderboardEntry } from '@/types/types';

export default function Home() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [rank, setRank] = useState<LeaderboardEntry | null>(null);
  const [userBadges, setUserBadges] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const user = await profilesApi.getCurrentUser();
      setProfile(user);

      if (user) {
        const rankData = await leaderboardApi.getUserRank(user.id);
        setRank(rankData);

        const badges = await badgesApi.getUserBadges(user.id);
        setUserBadges(badges.length);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24 bg-muted" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Card className="max-w-md w-full shadow-elegant">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Leaf className="w-10 h-10 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl gradient-text">Welcome to EcoLearn</CardTitle>
            <CardDescription className="text-base">
              Join our community and start your environmental education journey today!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/50">
                <BookOpen className="w-5 h-5 text-primary" />
                <span className="text-sm">Interactive learning modules</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/50">
                <Award className="w-5 h-5 text-primary" />
                <span className="text-sm">Engaging quizzes and challenges</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/50">
                <Trophy className="w-5 h-5 text-primary" />
                <span className="text-sm">Earn points and badges</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/50">
                <Upload className="w-5 h-5 text-primary" />
                <span className="text-sm">Track real-life eco-actions</span>
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button asChild className="flex-1">
                <Link to="/register">Get Started</Link>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link to="/login">Sign In</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const nextMilestone = [100, 250, 500, 1000, 2000].find(m => m > profile.total_points) || 2000;
  const progressToNext = (profile.total_points / nextMilestone) * 100;

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold gradient-text">
          Welcome back, {profile.full_name || profile.username}! 🌱
        </h1>
        <p className="text-muted-foreground">
          Continue your environmental learning journey and make a difference!
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-elegant hover:shadow-glow transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
            <TrendingUp className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{profile.total_points}</div>
            <Progress value={progressToNext} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {nextMilestone - profile.total_points} points to next milestone
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-elegant hover:shadow-glow transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Leaderboard Rank</CardTitle>
            <Trophy className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">#{rank?.rank || '-'}</div>
            <p className="text-xs text-muted-foreground mt-2">
              {rank ? 'Keep climbing!' : 'Complete activities to rank'}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-elegant hover:shadow-glow transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Badges Earned</CardTitle>
            <Award className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{userBadges}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Collect more achievements
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-elegant hover:shadow-glow transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Role</CardTitle>
            <Leaf className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary capitalize">{profile.role}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Your platform access level
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Show learning activities only for students and teachers, not admins */}
      {profile.role !== 'admin' && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="shadow-elegant hover:shadow-glow transition-smooth">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Learning Modules</CardTitle>
              <CardDescription>
                Explore environmental topics and expand your knowledge
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link to="/learn">Start Learning</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-elegant hover:shadow-glow transition-smooth">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <Award className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Take Quizzes</CardTitle>
              <CardDescription>
                Test your knowledge and earn eco-points
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link to="/quizzes">View Quizzes</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-elegant hover:shadow-glow transition-smooth">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <Gamepad2 className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Play Challenges</CardTitle>
              <CardDescription>
                Complete fun interactive environmental challenges
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link to="/challenges">Play Now</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Show admin-specific quick actions */}
      {profile.role === 'admin' && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="shadow-elegant hover:shadow-glow transition-smooth">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <Trophy className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>View Leaderboard</CardTitle>
              <CardDescription>
                Check student rankings and performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link to="/leaderboard">View Rankings</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-elegant hover:shadow-glow transition-smooth">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <Upload className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Admin Dashboard</CardTitle>
              <CardDescription>
                Manage users, review eco-actions, and generate reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link to="/admin">Go to Dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
