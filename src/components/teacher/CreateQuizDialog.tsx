import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { quizzesApi, quizQuestionsApi, topicsApi, profilesApi } from '@/db/api';
import type { QuizQuestion } from '@/types/types';

interface CreateQuizDialogProps {
  onSuccess?: () => void;
}

export default function CreateQuizDialog({ onSuccess }: CreateQuizDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [category, setCategory] = useState('');
  const [pointsPerQuestion, setPointsPerQuestion] = useState(10);
  const [questions, setQuestions] = useState<Partial<QuizQuestion>[]>([
    {
      question_text: '',
      question_type: 'multiple_choice',
      options: ['', '', '', ''],
      correct_answer: '',
      points: 10,
    },
  ]);

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        question_text: '',
        question_type: 'multiple_choice',
        options: ['', '', '', ''],
        correct_answer: '',
        points: pointsPerQuestion,
      },
    ]);
  };

  const handleRemoveQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const handleQuestionChange = (index: number, field: string, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const handleOptionChange = (questionIndex: number, optionIndex: number, value: string) => {
    const updated = [...questions];
    const options = [...(updated[questionIndex].options || [])];
    options[optionIndex] = value;
    updated[questionIndex] = { ...updated[questionIndex], options };
    setQuestions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('Please enter a quiz title');
      return;
    }
    
    if (!category.trim()) {
      toast.error('Please enter a category');
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question_text?.trim()) {
        toast.error(`Question ${i + 1}: Please enter question text`);
        return;
      }
      if (q.question_type === 'multiple_choice') {
        const validOptions = q.options?.filter(opt => opt.trim()) || [];
        if (validOptions.length < 2) {
          toast.error(`Question ${i + 1}: Please provide at least 2 options`);
          return;
        }
        if (!q.correct_answer?.trim()) {
          toast.error(`Question ${i + 1}: Please select the correct answer`);
          return;
        }
      }
    }

    setLoading(true);
    try {
      const user = await profilesApi.getCurrentUser();
      if (!user) {
        toast.error('You must be logged in to create a quiz');
        return;
      }

      const topic = await topicsApi.createTopic({
        title: category.trim(),
        description: `Category for ${title.trim()}`,
        content: null,
        icon: difficulty,
        order_index: 0,
        created_by: user.id,
      });

      const quiz = await quizzesApi.createQuiz({
        topic_id: topic.id,
        title: title.trim(),
        description: description.trim(),
        points_reward: pointsPerQuestion * questions.length,
        time_limit_minutes: null,
        created_by: user.id,
        is_active: true,
      });

      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        await quizQuestionsApi.createQuestion({
          quiz_id: quiz.id,
          question_text: q.question_text || '',
          question_type: q.question_type || 'multiple_choice',
          options: q.options || [],
          correct_answer: q.correct_answer || '',
          points: q.points || pointsPerQuestion,
          order_index: i,
        });
      }

      toast.success('Quiz created successfully!');
      setOpen(false);
      resetForm();
      onSuccess?.();
    } catch (error) {
      console.error('Error creating quiz:', error);
      toast.error('Failed to create quiz');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDifficulty('medium');
    setCategory('');
    setPointsPerQuestion(10);
    setQuestions([
      {
        question_text: '',
        question_type: 'multiple_choice',
        options: ['', '', '', ''],
        correct_answer: '',
        points: 10,
      },
    ]);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create New Quiz
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Quiz</DialogTitle>
          <DialogDescription>
            Add a new quiz for students to take. Include multiple questions with options.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Quiz Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Climate Change Basics"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Input
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g., Climate Change"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of the quiz"
                rows={2}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select value={difficulty} onValueChange={(value: any) => setDifficulty(value)}>
                  <SelectTrigger id="difficulty">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="points">Points per Question</Label>
                <Input
                  id="points"
                  type="number"
                  min="1"
                  value={pointsPerQuestion}
                  onChange={(e) => setPointsPerQuestion(parseInt(e.target.value) || 10)}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-semibold">Questions</Label>
              <Button type="button" variant="outline" size="sm" onClick={handleAddQuestion}>
                <Plus className="w-4 h-4 mr-2" />
                Add Question
              </Button>
            </div>

            {questions.map((question, qIndex) => (
              <div key={qIndex} className="border rounded-lg p-4 space-y-4 bg-accent/50">
                <div className="flex items-start justify-between">
                  <Label className="font-medium">Question {qIndex + 1}</Label>
                  {questions.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveQuestion(qIndex)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`question-${qIndex}`}>Question Text *</Label>
                  <Textarea
                    id={`question-${qIndex}`}
                    value={question.question_text || ''}
                    onChange={(e) => handleQuestionChange(qIndex, 'question_text', e.target.value)}
                    placeholder="Enter your question here"
                    rows={2}
                    required
                  />
                </div>

                <div className="space-y-3">
                  <Label>Answer Options *</Label>
                  {question.options?.map((option, oIndex) => (
                    <div key={oIndex} className="flex items-center gap-2">
                      <Input
                        value={option}
                        onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                        placeholder={`Option ${oIndex + 1}`}
                      />
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`correct-${qIndex}`}>Correct Answer *</Label>
                  <Select
                    value={question.correct_answer || ''}
                    onValueChange={(value) => handleQuestionChange(qIndex, 'correct_answer', value)}
                  >
                    <SelectTrigger id={`correct-${qIndex}`}>
                      <SelectValue placeholder="Select correct answer" />
                    </SelectTrigger>
                    <SelectContent>
                      {question.options?.filter(opt => opt.trim()).map((option, idx) => (
                        <SelectItem key={idx} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Quiz'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
