import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { challengeProgressApi, profilesApi } from '@/db/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { TreePine, ArrowLeft } from 'lucide-react';

interface Question {
  id: number;
  question: string;
  options: string[];
  correct: number;
}

const questions: Question[] = [
  {
    id: 1,
    question: 'What percentage of Earth\'s oxygen is produced by trees?',
    options: ['10%', '20%', '28%', '50%'],
    correct: 2,
  },
  {
    id: 2,
    question: 'How many trees does it take to produce enough oxygen for one person per year?',
    options: ['1 tree', '2 trees', '5 trees', '10 trees'],
    correct: 1,
  },
  {
    id: 3,
    question: 'What is the main cause of deforestation?',
    options: ['Natural disasters', 'Agriculture', 'Urban development', 'Climate change'],
    correct: 1,
  },
  {
    id: 4,
    question: 'How long does it take for a tree to grow to maturity?',
    options: ['5-10 years', '10-20 years', '20-30 years', '30-50 years'],
    correct: 2,
  },
  {
    id: 5,
    question: 'Which tree absorbs the most CO2?',
    options: ['Oak', 'Pine', 'Eucalyptus', 'Bamboo'],
    correct: 2,
  },
  {
    id: 6,
    question: 'How many trees are cut down each year globally?',
    options: ['1 billion', '5 billion', '10 billion', '15 billion'],
    correct: 3,
  },
  {
    id: 7,
    question: 'What is the best time to plant trees?',
    options: ['Spring', 'Summer', 'Fall', 'Winter'],
    correct: 2,
  },
  {
    id: 8,
    question: 'How much water does a mature tree absorb per day?',
    options: ['10 gallons', '50 gallons', '100 gallons', '200 gallons'],
    correct: 2,
  },
];

export default function SaveTreesGame() {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [treesPlanted, setTreesPlanted] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    setShowFeedback(true);

    if (answerIndex === questions[currentQuestion].correct) {
      setTreesPlanted(treesPlanted + 1);
      toast.success('Correct! You planted a tree! 🌳');
    } else {
      toast.error('Wrong answer. Try the next question!');
    }

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setShowFeedback(false);
      } else {
        finishGame();
      }
    }, 1500);
  };

  const finishGame = async () => {
    setGameOver(true);
    const score = (treesPlanted / questions.length) * 100;
    const completed = score >= 70;

    try {
      const user = await profilesApi.getCurrentUser();
      if (user) {
        // Get existing progress to check if already completed
        const existingProgress = await challengeProgressApi.getChallengeProgress(
          '22222222-2222-2222-2222-222222222222',
          user.id
        );

        const wasAlreadyCompleted = existingProgress?.completed || false;
        const currentAttempts = existingProgress?.attempts || 0;

        // Save progress
        await challengeProgressApi.createOrUpdateProgress({
          challenge_id: '22222222-2222-2222-2222-222222222222',
          student_id: user.id,
          completed: completed || wasAlreadyCompleted,
          score: Math.round(score),
          points_earned: completed && !wasAlreadyCompleted ? 30 : 0, // Match the points_reward from migration
          attempts: currentAttempts + 1,
          completed_at: completed && !wasAlreadyCompleted ? new Date().toISOString() : existingProgress?.completed_at || null,
        });

        if (completed && !wasAlreadyCompleted) {
          toast.success(`Challenge completed! You earned 30 points! 🎉`);
        } else if (completed && wasAlreadyCompleted) {
          toast.success(`Great job! You planted ${treesPlanted} trees!`);
        } else {
          toast.info(`You planted ${treesPlanted} trees. Try again to complete!`);
        }
      }
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  if (gameOver) {
    const percentage = (treesPlanted / questions.length) * 100;

    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="shadow-elegant">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <TreePine className="w-10 h-10 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl gradient-text">Game Complete!</CardTitle>
            <CardDescription>Save the Trees Results</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <div className="text-6xl">🌳</div>
              <div className="text-5xl font-bold text-primary">{treesPlanted}</div>
              <p className="text-muted-foreground">Trees Planted</p>
              <div className="text-2xl font-semibold text-primary">{percentage.toFixed(0)}%</div>
            </div>

            {percentage >= 70 ? (
              <div className="p-4 rounded-lg bg-success/10 border border-success text-center">
                <p className="font-medium text-success">🎉 Amazing! You saved the forest!</p>
                <p className="text-sm text-success mt-1">You earned 25 eco-points!</p>
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-muted text-center">
                <p className="font-medium">Keep learning! You need to plant at least 6 trees to complete.</p>
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

  const question = questions[currentQuestion];

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Button onClick={() => navigate('/challenges')} variant="ghost" className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Challenges
      </Button>

      <Card className="shadow-elegant">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl gradient-text">Save the Trees</CardTitle>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Trees Planted</p>
              <p className="text-2xl font-bold text-primary">{treesPlanted} 🌳</p>
            </div>
          </div>
          <CardDescription>
            Question {currentQuestion + 1} of {questions.length}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-6 rounded-lg bg-accent">
            <h3 className="text-xl font-semibold text-center">{question.question}</h3>
          </div>

          <div className="grid gap-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                disabled={showFeedback}
                className={`p-4 rounded-lg border-2 text-left transition-all hover:scale-[1.02] ${
                  showFeedback
                    ? index === question.correct
                      ? 'border-success bg-success/10'
                      : index === selectedAnswer
                      ? 'border-destructive bg-destructive/10'
                      : 'border-muted'
                    : 'border-primary hover:bg-primary/5'
                }`}
              >
                <span className="font-medium">{option}</span>
              </button>
            ))}
          </div>

          {showFeedback && (
            <div className={`p-4 rounded-lg text-center font-medium ${
              selectedAnswer === question.correct
                ? 'bg-success/10 text-success'
                : 'bg-destructive/10 text-destructive'
            }`}>
              {selectedAnswer === question.correct
                ? '✅ Correct! You planted a tree!'
                : `❌ Wrong! The correct answer is: ${question.options[question.correct]}`}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
