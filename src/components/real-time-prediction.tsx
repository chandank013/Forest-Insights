'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { TaskType, Prediction } from '@/lib/types';
import { Loader2, TestTube2, BrainCircuit } from 'lucide-react';
import { ExplainPrediction } from './explain-prediction';

interface RealTimePredictionProps {
  features: string[];
  taskType: TaskType;
  isLoading: boolean;
  onPredict: (values: Record<string, number>) => Promise<Prediction>;
}

export function RealTimePrediction({ features, taskType, isLoading, onPredict }: RealTimePredictionProps) {
  const [predictionResult, setPredictionResult] = useState<Prediction | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);

  const formSchema = z.object(
    features.reduce((acc, feature) => {
      acc[feature] = z.coerce.number({
        required_error: 'This field is required.',
        invalid_type_error: 'Must be a number',
      });
      return acc;
    }, {} as Record<string, z.ZodType<any, any, any>>)
  );

  type FormValues = z.infer<typeof formSchema>;
  
  const defaultValues = features.reduce((acc, feature) => {
    acc[feature] = '';
    return acc;
  }, {} as Record<string, any>);


  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues,
  });

  useEffect(() => {
    const newDefaultValues = features.reduce((acc, feature) => {
      acc[feature] = '';
      return acc;
    }, {} as Record<string, any>);

    form.reset(newDefaultValues);
    setPredictionResult(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [features, form.reset]);


  const onSubmit = async (values: FormValues) => {
    setIsPredicting(true);
    setPredictionResult(null);
    const result = await onPredict(values as Record<string, number>);
    setPredictionResult(result);
    setIsPredicting(false);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube2 className="w-5 h-5" />
            Make a Prediction
          </CardTitle>
          <CardDescription>Enter values for the features below to get a real-time prediction.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {features.map((feature) => (
                  <FormField
                    key={feature}
                    control={form.control}
                    name={feature as any}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">{feature}</FormLabel>
                        <FormControl>
                          <Input type="number" step="any" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>
              <Button type="submit" disabled={isPredicting || isLoading}>
                {isPredicting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Predict
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <div className="space-y-8">
        <Card>
            <CardHeader>
                <CardTitle>Prediction Result</CardTitle>
                 <CardDescription>
                  This is the model's prediction based on the input values you provided.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-48">
                {isPredicting ? (
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                ) : predictionResult ? (
                    <div className="text-center">
                        <p className="text-muted-foreground">{taskType === 'regression' ? 'Predicted Value' : 'Predicted Class'}</p>
                        <p className="text-5xl font-bold">{predictionResult.prediction}</p>
                    </div>
                ) : (
                    <p className="text-muted-foreground">Submit feature values to see a prediction.</p>
                )}
            </CardContent>
        </Card>
        
        <ExplainPrediction
            prediction={predictionResult || undefined}
            featureNames={features}
            taskType={taskType}
            isLoading={isLoading || isPredicting}
        />
      </div>
    </div>
  );
}
