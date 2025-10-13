'use client';

import { useState } from 'react';
import { Bot, Loader2, BrainCircuit } from 'lucide-react';
import { getPredictionExplanation } from '@/lib/actions';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from './ui/skeleton';
import { Button } from './ui/button';
import type { Prediction, TaskType } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ExplainPredictionProps {
  prediction?: Prediction;
  featureNames: string[];
  taskType: TaskType;
  isLoading: boolean;
  cardClassName?: string;
}

export function ExplainPrediction({ prediction, featureNames, taskType, isLoading, cardClassName }: ExplainPredictionProps) {
  const [explanation, setExplanation] = useState<string>('');
  const [isExplaining, setIsExplaining] = useState(false);
  const { toast } = useToast();

  const handleExplain = async () => {
    if (!prediction) return;
    
    setIsExplaining(true);
    setExplanation('');
    try {
      const result = await getPredictionExplanation({
        featureValues: prediction.features,
        prediction: prediction.prediction,
        featureNames,
        taskType,
      });
      setExplanation(result);
    } catch (error) {
      console.error('Failed to get explanation:', error);
      toast({
        title: 'Explanation Failed',
        description: 'Could not generate an explanation for this prediction.',
        variant: 'destructive',
      });
    } finally {
      setIsExplaining(false);
    }
  };
  
  const getPredictionDetails = () => {
    if (!prediction) return null;
    return (
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Predicted Value:</span>
          <span className="font-semibold">{prediction.prediction}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Actual Value:</span>
          <span className="font-semibold">{prediction.actual}</span>
        </div>
      </div>
    );
  }

  return (
    <Card className={cn(cardClassName)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><BrainCircuit className="w-5 h-5" />AI Prediction Explanation</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && !prediction ? (
            <Skeleton className="h-10 w-full" />
        ) : (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full" disabled={!prediction}>
                Explain Latest Prediction
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>AI-Powered Explanation</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <p className="text-sm text-muted-foreground">
                  Here is an explanation for the first prediction from the latest model run.
                </p>
                
                <div className="rounded-md border bg-muted/50 p-3">
                  {getPredictionDetails()}
                </div>

                <Button onClick={handleExplain} disabled={isExplaining}>
                    {isExplaining && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {explanation ? 'Re-explain' : 'Explain'}
                </Button>
                
                {isExplaining && <Skeleton className="h-24 w-full" />}
                {explanation && (
                    <div className="mt-4 rounded-lg border bg-accent/50 p-4 text-sm">
                        {explanation}
                    </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
}

    