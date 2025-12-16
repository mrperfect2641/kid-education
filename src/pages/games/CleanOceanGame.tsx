import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { challengeProgressApi, profilesApi } from '@/db/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Waves, ArrowLeft } from 'lucide-react';

interface TrashItem {
  id: number;
  icon: string;
  x: number;
  y: number;
  collected: boolean;
}

export default function CleanOceanGame() {
  const navigate = useNavigate();
  const [trashItems, setTrashItems] = useState<TrashItem[]>([]);
  const [collected, setCollected] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const trashIcons = ['🥤', '🍾', '🥫', '🛍️', '🧴', '🪣', '🧃', '🍶', '🧪', '📦'];

  useEffect(() => {
    if (gameStarted && !gameOver) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            finishGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [gameStarted, gameOver]);

  const startGame = () => {
    const items: TrashItem[] = [];
    for (let i = 0; i < 15; i++) {
      items.push({
        id: i,
        icon: trashIcons[Math.floor(Math.random() * trashIcons.length)],
        x: Math.random() * 80 + 5,
        y: Math.random() * 70 + 10,
        collected: false,
      });
    }
    setTrashItems(items);
    setGameStarted(true);
    setCollected(0);
    setTimeLeft(30);
  };

  const collectTrash = (id: number) => {
    setTrashItems((items) =>
      items.map((item) =>
        item.id === id ? { ...item, collected: true } : item
      )
    );
    setCollected((prev) => prev + 1);
    toast.success('Trash collected! 🌊');
  };

  const finishGame = async () => {
    setGameOver(true);
    const score = (collected / 15) * 100;
    const completed = score >= 70;

    try {
      const user = await profilesApi.getCurrentUser();
      if (user) {
        // Get existing progress to check if already completed
        const existingProgress = await challengeProgressApi.getChallengeProgress(
          '33333333-3333-3333-3333-333333333333',
          user.id
        );

        const wasAlreadyCompleted = existingProgress?.completed || false;
        const currentAttempts = existingProgress?.attempts || 0;

        // Save progress
        await challengeProgressApi.createOrUpdateProgress({
          challenge_id: '33333333-3333-3333-3333-333333333333',
          student_id: user.id,
          completed: completed || wasAlreadyCompleted,
          score: Math.round(score),
          points_earned: completed && !wasAlreadyCompleted ? 30 : 0,
          attempts: currentAttempts + 1,
          completed_at: completed && !wasAlreadyCompleted ? new Date().toISOString() : existingProgress?.completed_at || null,
        });

        if (completed && !wasAlreadyCompleted) {
          toast.success(`Challenge completed! You earned 30 points! 🎉`);
        } else if (completed && wasAlreadyCompleted) {
          toast.success(`Great job! You collected ${collected} pieces of trash!`);
        } else {
          toast.info(`You collected ${collected} pieces. Try again to complete!`);
        }
      }
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  if (gameOver) {
    const percentage = (collected / 15) * 100;

    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="shadow-elegant">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Waves className="w-10 h-10 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl gradient-text">Game Complete!</CardTitle>
            <CardDescription>Clean the Ocean Results</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <div className="text-6xl">🌊</div>
              <div className="text-5xl font-bold text-primary">{collected}/15</div>
              <p className="text-muted-foreground">Trash Items Collected</p>
              <div className="text-2xl font-semibold text-primary">{percentage.toFixed(0)}%</div>
            </div>

            {percentage >= 70 ? (
              <div className="p-4 rounded-lg bg-success/10 border border-success text-center">
                <p className="font-medium text-success">🎉 Excellent! You cleaned the ocean!</p>
                <p className="text-sm text-success mt-1">You earned 30 eco-points!</p>
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-muted text-center">
                <p className="font-medium">Keep trying! You need to collect at least 11 items to complete.</p>
              </div>
            )}

            <div className="flex gap-3">
              <Button onClick={() => window.location.reload()} variant="outline" className="flex-1">
                Play Again
              </Button>
              <Button onClick={() => navigate('/challenges')} className="flex-1">
                Back to Challenges
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!gameStarted) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Button onClick={() => navigate('/challenges')} variant="ghost" className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Challenges
        </Button>

        <Card className="shadow-elegant">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Waves className="w-10 h-10 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl gradient-text">Clean the Ocean</CardTitle>
            <CardDescription>Help save marine life by collecting trash!</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-accent">
                <h3 className="font-semibold mb-2">How to Play:</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Click on trash items to collect them</li>
                  <li>• You have 30 seconds to collect as much as possible</li>
                  <li>• Collect at least 11 items (70%) to complete the challenge</li>
                  <li>• Each item collected helps clean the ocean!</li>
                </ul>
              </div>
            </div>

            <Button onClick={startGame} className="w-full" size="lg">
              Start Game
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button onClick={() => navigate('/challenges')} variant="ghost" className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Challenges
      </Button>

      <Card className="shadow-elegant">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl gradient-text">Clean the Ocean</CardTitle>
            <div className="flex gap-6">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Time Left</p>
                <p className="text-2xl font-bold text-primary">{timeLeft}s</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Collected</p>
                <p className="text-2xl font-bold text-primary">{collected}/15</p>
              </div>
            </div>
          </div>
          <CardDescription>Click on trash items to collect them!</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="relative w-full rounded-lg overflow-hidden"
            style={{
              height: '500px',
              background: 'linear-gradient(180deg, #4a90e2 0%, #1e3a8a 100%)',
            }}
          >
            {trashItems.map((item) =>
              !item.collected ? (
                <button
                  key={item.id}
                  onClick={() => collectTrash(item.id)}
                  className="absolute text-4xl hover:scale-125 transition-transform cursor-pointer animate-pulse"
                  style={{
                    left: `${item.x}%`,
                    top: `${item.y}%`,
                  }}
                >
                  {item.icon}
                </button>
              ) : null
            )}

            {collected === 15 && (
              <div className="absolute inset-0 flex items-center justify-center bg-success/20">
                <div className="text-center">
                  <div className="text-6xl mb-4">🎉</div>
                  <p className="text-2xl font-bold text-white">All trash collected!</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
