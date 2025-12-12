import { useEffect, useState } from 'react';
import { topicsApi } from '@/db/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { BookOpen } from 'lucide-react';
import type { Topic } from '@/types/types';

export default function Learn() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTopics();
  }, []);

  const loadTopics = async () => {
    try {
      const data = await topicsApi.getAllTopics();
      setTopics(data);
    } catch (error) {
      console.error('Error loading topics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-10 w-64 bg-muted" />
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48 bg-muted" />
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <BookOpen className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold gradient-text">Learning Modules</h1>
          <p className="text-muted-foreground">Explore environmental topics and expand your knowledge</p>
        </div>
      </div>

      {topics.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No learning modules available yet.</p>
          </CardContent>
        </Card>
      ) : (
        <Accordion type="single" collapsible className="space-y-4">
          {topics.map((topic) => (
            <AccordionItem key={topic.id} value={topic.id} className="border rounded-lg px-6 shadow-elegant">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-4 text-left">
                  <span className="text-3xl">{topic.icon || '📚'}</span>
                  <div>
                    <h3 className="text-lg font-semibold">{topic.title}</h3>
                    <p className="text-sm text-muted-foreground">{topic.description}</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4">
                <div className="prose prose-sm max-w-none">
                  <p className="text-foreground whitespace-pre-wrap">{topic.content}</p>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
}
