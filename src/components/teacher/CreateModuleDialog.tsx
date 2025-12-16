import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { topicsApi, profilesApi } from '@/db/api';
import type { Topic } from '@/types/types';

interface CreateModuleDialogProps {
  module?: Topic;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export default function CreateModuleDialog({ module, onSuccess, trigger }: CreateModuleDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    if (module && open) {
      setTitle(module.title || '');
      setDescription(module.description || '');
      setContent(module.content || '');
      setCategory(module.icon || '');
      setImageUrl('');
    }
  }, [module, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('Please enter a module title');
      return;
    }
    
    if (!content.trim()) {
      toast.error('Please enter module content');
      return;
    }

    if (!category.trim()) {
      toast.error('Please enter a category');
      return;
    }

    setLoading(true);
    try {
      if (module) {
        // Update existing module
        await topicsApi.updateTopic(module.id, {
          title: title.trim(),
          description: description.trim() || null,
          content: content.trim(),
          icon: category.trim() || null,
        });
        toast.success('Learning module updated successfully!');
      } else {
        // Create new module
        const user = await profilesApi.getCurrentUser();
        if (!user) {
          toast.error('You must be logged in to create a module');
          return;
        }

        await topicsApi.createTopic({
          title: title.trim(),
          description: description.trim() || null,
          content: content.trim(),
          icon: category.trim() || null,
          order_index: 0,
          created_by: user.id,
        });
        toast.success('Learning module created successfully!');
      }

      setOpen(false);
      resetForm();
      onSuccess?.();
    } catch (error) {
      console.error('Error saving module:', error);
      toast.error(`Failed to ${module ? 'update' : 'create'} learning module`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setContent('');
    setCategory('');
    setImageUrl('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create New Module
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{module ? 'Edit Learning Module' : 'Create New Learning Module'}</DialogTitle>
          <DialogDescription>
            {module ? 'Update the educational content for this module.' : 'Add educational content for students to learn about environmental topics.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Module Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Understanding Climate Change"
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
              <Label htmlFor="description">Short Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief overview of the module"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter the full learning content here. You can include facts, explanations, and key points..."
                rows={12}
                required
              />
              <p className="text-xs text-muted-foreground">
                Tip: Use line breaks to separate paragraphs and make content easier to read.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL (Optional)</Label>
              <Input
                id="imageUrl"
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
              <p className="text-xs text-muted-foreground">
                Add an image URL to make the module more engaging.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (module ? 'Updating...' : 'Creating...') : (module ? 'Update Module' : 'Create Module')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
