import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizzesApi, quizQuestionsApi, quizAttemptsApi, profilesApi } from '@/db/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle2, XCircle, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import type { Quiz, QuizQuestion } from '@/types/types';

export default function QuizTake() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) loadQuiz();
  }, [id]);

  const loadQuiz = async () => {
    if (!id) return;
    try {
      const [quizData, questionsData] = await Promise.all([
        quizzesApi.getQuiz(id),
        quizQuestionsApi.getQuestionsByQuizId(id),
      ]);
      setQuiz(quizData);
      setQuestions(questionsData);
    } catch (error) {
      console.error('Error loading quiz:', error);
      toast.error('Failed to load quiz');
      navigate('/quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < questions.length) {
      toast.error('Please answer all questions before submitting');
      return;
    }

    let correctCount = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correct_answer) {
        correctCount++;
      }
    });

    setScore(correctCount);
    setShowResults(true);

    try {
      const user = await profilesApi.getCurrentUser();
      if (user && quiz) {
        const pointsEarned = Math.floor((correctCount / questions.length) * quiz.points_reward);
        await quizAttemptsApi.createAttempt({
          quiz_id: quiz.id,
          student_id: user.id,
          score: correctCount,
          total_questions: questions.length,
          points_earned: pointsEarned,
          answers,
        });
        toast.success(`Quiz completed! You earned ${pointsEarned} points! 🎉`);
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast.error('Failed to save quiz results');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Skeleton className="h-10 w-64 bg-muted mb-6" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-full bg-muted" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full bg-muted" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!quiz || questions.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Quiz not found or has no questions.</p>
            <Button onClick={() => navigate('/quizzes')} className="mt-4">
              Back to Quizzes
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showResults) {
    const percentage = (score / questions.length) * 100;
    const pointsEarned = Math.floor(percentage / 100 * quiz.points_reward);

    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Card className="shadow-elegant">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Trophy className="w-10 h-10 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl gradient-text">Quiz Completed!</CardTitle>
            <CardDescription>Here are your results</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-2">
              <div className="text-5xl font-bold text-primary">{score}/{questions.length}</div>
              <p className="text-muted-foreground">Correct Answers</p>
              <div className="text-2xl font-semibold text-primary">{percentage.toFixed(0)}%</div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-accent">
                <span className="font-medium">Points Earned</span>
                <span className="text-xl font-bold text-primary">+{pointsEarned}</span>
              </div>
            </div>

            <div className="space-y-3">
              {questions.map((q, idx) => {
                const userAnswer = answers[q.id];
                const isCorrect = userAnswer === q.correct_answer;
                return (
                  <div key={q.id} className={`p-4 rounded-lg border ${isCorrect ? 'bg-success/10 border-success' : 'bg-destructive/10 border-destructive'}`}>
                    <div className="flex items-start gap-3">
                      {isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium mb-1">Question {idx + 1}</p>
                        <p className="text-sm text-muted-foreground mb-2">{q.question_text}</p>
                        {!isCorrect && (
                          <p className="text-sm">
                            <span className="text-destructive">Your answer: {userAnswer}</span>
                            <br />
                            <span className="text-success">Correct answer: {q.correct_answer}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3">
              <Button onClick={() => navigate('/quizzes')} variant="outline" className="flex-1">
                Back to Quizzes
              </Button>
              <Button onClick={() => navigate('/')} className="flex-1">
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold gradient-text">{quiz.title}</h1>
          <span className="text-sm text-muted-foreground">
            Question {currentIndex + 1} of {questions.length}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="text-xl">{currentQuestion.question_text}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <RadioGroup
            value={answers[currentQuestion.id] || ''}
            onValueChange={(value) => handleAnswer(currentQuestion.id, value)}
          >
            <div className="space-y-3">
              {currentQuestion.options.map((option, idx) => (
                <div key={idx} className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-accent transition-smooth">
                  <RadioGroupItem value={option} id={`option-${idx}`} />
                  <Label htmlFor={`option-${idx}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              variant="outline"
              className="flex-1"
            >
              Previous
            </Button>
            {currentIndex === questions.length - 1 ? (
              <Button onClick={handleSubmit} className="flex-1">
                Submit Quiz
              </Button>
            ) : (
              <Button onClick={handleNext} className="flex-1">
                Next
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
