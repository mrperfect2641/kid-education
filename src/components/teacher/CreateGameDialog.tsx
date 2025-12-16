import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { challengesApi } from '@/db/api';

interface CreateGameDialogProps {
  onSuccess?: () => void;
}

export default function CreateGameDialog({ onSuccess }: CreateGameDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [points, setPoints] = useState(50);
  const [gameType, setGameType] = useState('');
  const [instructions, setInstructions] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('Please enter a game title');
      return;
    }

    if (!gameType.trim()) {
      toast.error('Please select a game type');
      return;
    }

    setLoading(true);
    try {
      await challengesApi.createChallenge({
        title: title.trim(),
        description: description.trim(),
        challenge_type: gameType.trim(),
        difficulty,
        points_reward: points,
        instructions: instructions.trim() || null,
        config: null,
        is_active: true,
      });

      toast.success('Game created successfully!');
      setOpen(false);
      resetForm();
      onSuccess?.();
    } catch (error) {
      console.error('Error creating game:', error);
      toast.error('Failed to create game');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDifficulty('medium');
    setPoints(50);
    setGameType('');
    setInstructions('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create New Game
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Game/Challenge</DialogTitle>
          <DialogDescription>
            Add a new interactive game or challenge for students. For quizzes with questions, use "Create New Quiz" instead.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Game Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Sort the Waste"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of the game"
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instructions">Instructions</Label>
              <Textarea
                id="instructions"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="How to play this game..."
                rows={3}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="gameType">Game Type *</Label>
                <Select value={gameType} onValueChange={setGameType}>
                  <SelectTrigger id="gameType">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sorting">Sorting Game</SelectItem>
                    <SelectItem value="matching">Matching Game</SelectItem>
                    <SelectItem value="simulation">Simulation</SelectItem>
                    <SelectItem value="puzzle">Puzzle</SelectItem>
                    <SelectItem value="action">Action Game</SelectItem>
                    <SelectItem value="adventure">Adventure</SelectItem>
                  </SelectContent>
                </Select>
              </div>

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
                <Label htmlFor="points">Points Reward</Label>
                <Input
                  id="points"
                  type="number"
                  min="1"
                  value={points}
                  onChange={(e) => setPoints(parseInt(e.target.value) || 50)}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Game'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
