import { useEffect, useState } from 'react';
import { ecoActionsApi, profilesApi, storageApi } from '@/db/api';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Upload, Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { compressImage, validateImageFile, formatFileSize } from '@/lib/image-utils';
import type { EcoAction } from '@/types/types';

export default function EcoActions() {
  const [actions, setActions] = useState<EcoAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    action_type: 'recycling',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    loadActions();
  }, []);

  const loadActions = async () => {
    try {
      const user = await profilesApi.getCurrentUser();
      if (user) {
        const data = await ecoActionsApi.getStudentActions(user.id);
        setActions(data);
      }
    } catch (error) {
      console.error('Error loading eco-actions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    setSelectedFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    setUploadProgress(0);

    try {
      const user = await profilesApi.getCurrentUser();
      if (!user) {
        toast.error('Please log in to submit eco-actions');
        return;
      }

      let imageUrl = null;

      if (selectedFile) {
        setUploadProgress(30);
        const compressedFile = await compressImage(selectedFile);
        const originalSize = formatFileSize(selectedFile.size);
        const compressedSize = formatFileSize(compressedFile.size);

        if (compressedFile.size < selectedFile.size) {
          toast.info(`Image compressed from ${originalSize} to ${compressedSize}`);
        }

        setUploadProgress(60);
        imageUrl = await storageApi.uploadEcoActionImage(compressedFile, user.id);
        setUploadProgress(90);
      }

      await ecoActionsApi.createAction({
        student_id: user.id,
        title: formData.title,
        description: formData.description,
        action_type: formData.action_type,
        image_url: imageUrl,
        points_reward: 15,
        reviewed_by: null,
        review_notes: null,
      });

      setUploadProgress(100);
      toast.success('Eco-action submitted successfully! Awaiting review.');
      setDialogOpen(false);
      setFormData({ title: '', description: '', action_type: 'recycling' });
      setSelectedFile(null);
      loadActions();
    } catch (error) {
      console.error('Error submitting eco-action:', error);
      toast.error('Failed to submit eco-action');
    } finally {
      setSubmitting(false);
      setUploadProgress(0);
    }
  };

  const getStatusIcon = (status: string) => {
    if (status === 'approved') return <CheckCircle2 className="w-5 h-5 text-success" />;
    if (status === 'rejected') return <XCircle className="w-5 h-5 text-destructive" />;
    return <Clock className="w-5 h-5 text-muted-foreground" />;
  };

  const getStatusBadge = (status: string) => {
    if (status === 'approved') return <Badge className="bg-success">Approved</Badge>;
    if (status === 'rejected') return <Badge variant="destructive">Rejected</Badge>;
    return <Badge variant="secondary">Pending</Badge>;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-10 w-64 bg-muted" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48 bg-muted" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Upload className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold gradient-text">My Eco-Actions</h1>
            <p className="text-muted-foreground">Submit real-life environmental activities</p>
          </div>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="w-4 h-4 mr-2" />
              Submit Action
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Submit Eco-Action</DialogTitle>
                <DialogDescription>
                  Share your real-life environmental activity for review
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Planted 5 trees"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="action_type">Action Type *</Label>
                  <Select
                    value={formData.action_type}
                    onValueChange={(value) => setFormData({ ...formData, action_type: value })}
                  >
                    <SelectTrigger id="action_type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recycling">Recycling</SelectItem>
                      <SelectItem value="planting">Planting Trees</SelectItem>
                      <SelectItem value="cleanup">Cleanup Activity</SelectItem>
                      <SelectItem value="conservation">Water/Energy Conservation</SelectItem>
                      <SelectItem value="education">Environmental Education</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your eco-action..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image">Upload Image (Optional)</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleFileChange}
                  />
                  {selectedFile && (
                    <p className="text-xs text-muted-foreground">
                      Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                    </p>
                  )}
                </div>
                {uploadProgress > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {actions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">You haven't submitted any eco-actions yet.</p>
            <Button onClick={() => setDialogOpen(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Submit Your First Action
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {actions.map((action) => (
            <Card key={action.id} className="shadow-elegant hover:shadow-glow transition-smooth">
              {action.image_url && (
                <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                  <img
                    src={action.image_url}
                    alt={action.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg">{action.title}</CardTitle>
                  {getStatusIcon(action.status)}
                </div>
                <CardDescription className="capitalize">{action.action_type.replace('_', ' ')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-3">{action.description}</p>
                {getStatusBadge(action.status)}
                {action.status === 'approved' && (
                  <p className="text-sm text-success font-medium">+{action.points_reward} points earned</p>
                )}
                {action.status === 'rejected' && action.review_notes && (
                  <p className="text-sm text-destructive">{action.review_notes}</p>
                )}
              </CardContent>
              <CardFooter className="text-xs text-muted-foreground">
                Submitted {new Date(action.submitted_at).toLocaleDateString()}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
