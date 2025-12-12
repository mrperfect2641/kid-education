import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { quizzesApi } from '@/db/api';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Award, Clock, Trophy } from 'lucide-react';
import type { QuizWithQuestions } from '@/types/types';

export default function Quizzes() {
  const [quizzes, setQuizzes] = useState<QuizWithQuestions[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      const data = await quizzesApi.getAllQuizzes();
      setQuizzes(data);
    } catch (error) {
      console.error('Error loading quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-10 w-64 bg-muted" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
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
          <Award className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold gradient-text">Environmental Quizzes</h1>
          <p className="text-muted-foreground">Test your knowledge and earn eco-points</p>
        </div>
      </div>

      {quizzes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No quizzes available yet. Check back soon!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((quiz) => (
            <Card key={quiz.id} className="shadow-elegant hover:shadow-glow transition-smooth flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg">{quiz.title}</CardTitle>
                  {quiz.topic && (
                    <span className="text-2xl">{quiz.topic.icon || '📚'}</span>
                  )}
                </div>
                <CardDescription className="line-clamp-2">
                  {quiz.description || 'Test your environmental knowledge'}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-2">
                  {quiz.topic && (
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{quiz.topic.title}</Badge>
                    </div>
                  )}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {quiz.time_limit_minutes && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{quiz.time_limit_minutes} min</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Trophy className="w-4 h-4 text-primary" />
                      <span className="text-primary font-medium">{quiz.points_reward} points</span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link to={`/quiz/${quiz.id}`}>Start Quiz</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
