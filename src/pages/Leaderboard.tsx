import { useEffect, useState } from 'react';
import { leaderboardApi, profilesApi } from '@/db/api';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Medal, Award } from 'lucide-react';
import type { LeaderboardEntry, Profile } from '@/types/types';

export default function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [leaderboardData, userData] = await Promise.all([
        leaderboardApi.getLeaderboard(),
        profilesApi.getCurrentUser(),
      ]);
      setEntries(leaderboardData);
      setCurrentUser(userData);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-amber-600" />;
    return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-10 w-64 bg-muted" />
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-16 w-full bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Trophy className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold gradient-text">Leaderboard</h1>
          <p className="text-muted-foreground">Top eco-champions ranked by points</p>
        </div>
      </div>

      {entries.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No leaderboard entries yet. Be the first!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => {
            const isCurrentUser = currentUser?.id === entry.id;
            return (
              <Card
                key={entry.id}
                className={`shadow-elegant hover:shadow-glow transition-smooth ${
                  isCurrentUser ? 'ring-2 ring-primary' : ''
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 flex items-center justify-center">
                      {getRankIcon(entry.rank)}
                    </div>

                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {(entry.full_name || entry.username).charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold truncate">
                          {entry.full_name || entry.username}
                        </p>
                        {isCurrentUser && (
                          <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                            You
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {entry.badge_count} {entry.badge_count === 1 ? 'badge' : 'badges'}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-1 text-primary font-bold text-lg">
                        <Award className="w-5 h-5" />
                        {entry.total_points}
                      </div>
                      <p className="text-xs text-muted-foreground">points</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
