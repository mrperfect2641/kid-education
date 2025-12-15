import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { challengeProgressApi, profilesApi } from '@/db/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Trash2, Recycle, Leaf, ArrowLeft } from 'lucide-react';

interface WasteItem {
  id: string;
  name: string;
  icon: string;
  correctBin: 'recyclable' | 'compost' | 'trash';
}

const wasteItems: WasteItem[] = [
  { id: '1', name: 'Plastic Bottle', icon: '🍾', correctBin: 'recyclable' },
  { id: '2', name: 'Banana Peel', icon: '🍌', correctBin: 'compost' },
  { id: '3', name: 'Newspaper', icon: '📰', correctBin: 'recyclable' },
  { id: '4', name: 'Glass Jar', icon: '🫙', correctBin: 'recyclable' },
  { id: '5', name: 'Food Wrapper', icon: '🍫', correctBin: 'trash' },
  { id: '6', name: 'Apple Core', icon: '🍎', correctBin: 'compost' },
  { id: '7', name: 'Cardboard Box', icon: '📦', correctBin: 'recyclable' },
  { id: '8', name: 'Battery', icon: '🔋', correctBin: 'trash' },
  { id: '9', name: 'Orange Peel', icon: '🍊', correctBin: 'compost' },
  { id: '10', name: 'Aluminum Can', icon: '🥫', correctBin: 'recyclable' },
];

export default function SortWasteGame() {
  const navigate = useNavigate();
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [selectedBin, setSelectedBin] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string>('');

  const currentItem = wasteItems[currentItemIndex];

  const handleBinSelect = async (bin: 'recyclable' | 'compost' | 'trash') => {
    setSelectedBin(bin);
    
    if (bin === currentItem.correctBin) {
      setScore(score + 10);
      setFeedback('✅ Correct! Well done!');
      toast.success('Correct!');
    } else {
      setFeedback(`❌ Wrong! This should go in ${currentItem.correctBin}`);
      toast.error('Try again!');
    }

    setTimeout(() => {
      if (currentItemIndex < wasteItems.length - 1) {
        setCurrentItemIndex(currentItemIndex + 1);
        setSelectedBin(null);
        setFeedback('');
      } else {
        finishGame();
      }
    }, 1500);
  };

  const finishGame = async () => {
    setGameOver(true);
    const finalScore = score + (selectedBin === currentItem.correctBin ? 10 : 0);
    const completed = finalScore >= 70;

    try {
      const user = await profilesApi.getCurrentUser();
      if (user) {
        await challengeProgressApi.createOrUpdateProgress({
          challenge_id: '11111111-1111-1111-1111-111111111111',
          student_id: user.id,
          completed,
          score: finalScore,
          points_earned: completed ? 20 : 0,
          attempts: 1,
          completed_at: completed ? new Date().toISOString() : null,
        });

        if (completed) {
          toast.success(`Game completed! You earned 20 points! 🎉`);
        } else {
          toast.info(`Score: ${finalScore}/100. Try again to complete!`);
        }
      }
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  if (gameOver) {
    const finalScore = score;
    const percentage = (finalScore / 100) * 100;

    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="shadow-elegant">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Recycle className="w-10 h-10 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl gradient-text">Game Complete!</CardTitle>
            <CardDescription>Sort the Waste Results</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-2">
              <div className="text-5xl font-bold text-primary">{finalScore}/100</div>
              <p className="text-muted-foreground">Your Score</p>
              <div className="text-2xl font-semibold text-primary">{percentage}%</div>
            </div>

            {finalScore >= 70 ? (
              <div className="p-4 rounded-lg bg-success/10 border border-success text-center">
                <p className="font-medium text-success">🎉 Congratulations! You completed the challenge!</p>
                <p className="text-sm text-success mt-1">You earned 20 eco-points!</p>
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-muted text-center">
                <p className="font-medium">Keep practicing! You need 70% to complete the challenge.</p>
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button onClick={() => navigate('/challenges')} variant="ghost" className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Challenges
      </Button>

      <Card className="shadow-elegant">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl gradient-text">Sort the Waste</CardTitle>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Score</p>
              <p className="text-2xl font-bold text-primary">{score}</p>
            </div>
          </div>
          <CardDescription>
            Item {currentItemIndex + 1} of {wasteItems.length}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="text-center space-y-4">
            <div className="text-8xl">{currentItem.icon}</div>
            <h3 className="text-2xl font-bold">{currentItem.name}</h3>
            <p className="text-muted-foreground">Which bin does this belong to?</p>
          </div>

          {feedback && (
            <div className={`p-4 rounded-lg text-center font-medium ${
              feedback.includes('✅') ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
            }`}>
              {feedback}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => handleBinSelect('recyclable')}
              disabled={selectedBin !== null}
              className={`p-6 rounded-lg border-2 transition-all hover:scale-105 ${
                selectedBin === 'recyclable'
                  ? selectedBin === currentItem.correctBin
                    ? 'border-success bg-success/10'
                    : 'border-destructive bg-destructive/10'
                  : 'border-primary hover:bg-primary/5'
              }`}
            >
              <div className="flex flex-col items-center gap-3">
                <Recycle className="w-12 h-12 text-primary" />
                <span className="font-semibold text-lg">Recyclable</span>
                <span className="text-sm text-muted-foreground">Paper, plastic, glass, metal</span>
              </div>
            </button>

            <button
              onClick={() => handleBinSelect('compost')}
              disabled={selectedBin !== null}
              className={`p-6 rounded-lg border-2 transition-all hover:scale-105 ${
                selectedBin === 'compost'
                  ? selectedBin === currentItem.correctBin
                    ? 'border-success bg-success/10'
                    : 'border-destructive bg-destructive/10'
                  : 'border-secondary hover:bg-secondary/5'
              }`}
            >
              <div className="flex flex-col items-center gap-3">
                <Leaf className="w-12 h-12 text-secondary" />
                <span className="font-semibold text-lg">Compost</span>
                <span className="text-sm text-muted-foreground">Food scraps, organic waste</span>
              </div>
            </button>

            <button
              onClick={() => handleBinSelect('trash')}
              disabled={selectedBin !== null}
              className={`p-6 rounded-lg border-2 transition-all hover:scale-105 ${
                selectedBin === 'trash'
                  ? selectedBin === currentItem.correctBin
                    ? 'border-success bg-success/10'
                    : 'border-destructive bg-destructive/10'
                  : 'border-muted-foreground hover:bg-muted'
              }`}
            >
              <div className="flex flex-col items-center gap-3">
                <Trash2 className="w-12 h-12 text-muted-foreground" />
                <span className="font-semibold text-lg">Trash</span>
                <span className="text-sm text-muted-foreground">Non-recyclable items</span>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
