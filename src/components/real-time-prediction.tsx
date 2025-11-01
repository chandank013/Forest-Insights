
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { TaskType, Prediction, DatasetMetadata, ForestSimulation } from '@/lib/types';
import { Loader2, TestTube2, HelpCircle, GitMerge } from 'lucide-react';
import { ExplainPrediction } from './explain-prediction';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { PredictionContributionChart } from './prediction-contribution-chart';
import { DecisionTreeSnapshot } from './decision-tree-snapshot';
import { Slider } from './ui/slider';

interface RealTimePredictionProps {
  features: string[];
  taskType: TaskType;
  isLoading: boolean;
  onPredict: (values: Record<string, number>) => Promise<Prediction>;
  datasetName: string;
  descriptions: {
    title: string;
    description: string;
    resultTitle: string;
    resultDescription: string;
    idleText: string;
  };
  placeholderValues: Record<string, any> | null;
  metadata: DatasetMetadata | null;
  simulationData: ForestSimulation | null;
}

export function RealTimePrediction({ features, taskType, isLoading, onPredict, datasetName, descriptions, placeholderValues, metadata, simulationData }: RealTimePredictionProps) {
  const [predictionResult, setPredictionResult] = useState<Prediction | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [selectedTreeIndex, setSelectedTreeIndex] = useState(0);

  const formSchema = useMemo(() => z.object(
    features.reduce((acc, feature) => {
      acc[feature] = z.string().refine(val => val.trim() !== '', {
        message: 'This field is required.',
      }).pipe(z.coerce.number({
        invalid_type_error: 'Must be a number',
      }));
      return acc;
    }, {} as Record<string, z.ZodType<any, any, any>>)
  ), [features]);

  type FormValues = z.infer<typeof formSchema>;

  const defaultValues = useMemo(() => {
    return features.reduce((acc, feature) => {
      acc[feature] = '';
      return acc;
    }, {} as Record<string, any>);
  }, [features]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  
  const formKey = useMemo(() => features.join('-'), [features]);

  useEffect(() => {
    form.reset(defaultValues);
    setPredictionResult(null);
    setSelectedTreeIndex(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formKey]);

  const onSubmit = async (values: FormValues) => {
    setIsPredicting(true);
    setPredictionResult(null);
    const result = await onPredict(values as Record<string, number>);
    setPredictionResult(result);
    setSelectedTreeIndex(0);
    setIsPredicting(false);
  };
  
  const trees = predictionResult?.forestSimulation?.trees;
  const currentTree = trees ? trees[selectedTreeIndex] : null;

  return (
    <TooltipProvider>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="flex flex-col gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TestTube2 className="w-5 h-5" />
                  {descriptions.title}
                </CardTitle>
                <CardDescription>{descriptions.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form key={formKey} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto pr-4">
                      {features.map((feature) => (
                        <FormField
                          key={feature}
                          control={form.control}
                          name={feature as any}
                          render={({ field }) => (
                            <FormItem>
                               <div className="flex items-center gap-2">
                                <FormLabel className="text-xs">{feature}</FormLabel>
                                {metadata?.attributes[feature] && (
                                   <Tooltip>
                                    <TooltipTrigger asChild>
                                        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="max-w-xs">
                                        <p>{metadata.attributes[feature].description}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                )}
                              </div>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  step="any" 
                                  placeholder={placeholderValues?.[feature]?.toString() ?? ''}
                                  {...field}
                                  value={field.value ?? ''}
                                />
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
        </div>
        
        {/* Right Column */}
        <div className="flex flex-col gap-8">
            <Card>
              <CardHeader>
                  <CardTitle>{descriptions.resultTitle}</CardTitle>
                   <CardDescription>
                    {descriptions.resultDescription}
                  </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center h-24">
                  {isPredicting ? (
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  ) : predictionResult ? (
                      <div className="text-center">
                          <p className="text-muted-foreground">{taskType === 'regression' ? 'Final Predicted Value' : 'Final Predicted Class'}</p>
                          <p className="text-5xl font-bold">
                            {taskType === 'classification' && datasetName === 'wine-quality' ? (predictionResult.prediction === 1 ? 'Good' : 'Bad') : ''}
                            {taskType === 'classification' && datasetName === 'breast-cancer' ? (predictionResult.prediction === 0 ? 'Malignant' : 'Benign') : ''}
                            {taskType === 'classification' && datasetName === 'digits' ? predictionResult.prediction : ''}
                            {taskType === 'regression' ? predictionResult.prediction.toFixed(3) : ''}
                          </p>
                      </div>
                  ) : (
                      <p className="text-muted-foreground">{descriptions.idleText}</p>
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

      <div className="mt-8 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                      <GitMerge className='w-5 h-5' />
                      Decision Tree Visualization
                    </CardTitle>
                     {isPredicting ? (
                        <CardDescription>Generating decision trees based on your input...</CardDescription>
                     ) : trees && trees.length > 0 ? (
                        <CardDescription>
                           {trees.length > 3
                            ? `Showing Tree ${selectedTreeIndex + 1} of ${trees.length}. Use the slider to browse trees.`
                            : `Showing all ${trees.length} trees used in the prediction.`
                           }
                        </CardDescription>
                     ) : (
                        <CardDescription>
                           Click "Predict" to generate decision trees based on your input.
                        </CardDescription>
                     )}
                </CardHeader>
                <CardContent>
                    {isPredicting && (
                        <div className="flex items-center justify-center h-48">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    )}
                    {!isPredicting && trees && trees.length > 0 && (
                        <>
                           {trees.length > 3 && (
                                <div className="mb-4">
                                    <Slider
                                        value={[selectedTreeIndex]}
                                        onValueChange={(value) => setSelectedTreeIndex(value[0])}
                                        min={0}
                                        max={trees.length - 1}
                                        step={1}
                                    />
                                </div>
                            )}

                           <div className={`grid grid-cols-1 ${trees.length <= 3 ? `md:grid-cols-${trees.length}` : ''} gap-4`}>
                                {(trees.length <= 3 ? trees : [currentTree]).map((tree, index) => (
                                    tree && (
                                      <Card key={index} className="flex flex-col">
                                          <CardHeader>
                                              <CardTitle className="text-base">Tree {tree.id}</CardTitle>
                                          </CardHeader>
                                          <CardContent className="flex-1 border rounded-lg p-2 h-[400px] overflow-auto">
                                              <DecisionTreeSnapshot tree={tree.tree} taskType={taskType} />
                                          </CardContent>
                                      </Card>
                                    )
                                ))}
                            </div>
                            
                            {trees.length >= 3 && (
                                <div className="mt-8">
                                    <h3 className="text-lg font-semibold mb-2">Individual Tree Contributions</h3>
                                     <PredictionContributionChart
                                        prediction={predictionResult}
                                        taskType={taskType}
                                        datasetName={datasetName}
                                    />
                                </div>
                            )}
                        </>
                    )}
                     {!isPredicting && (!trees || trees.length === 0) && (
                        <div className="flex items-center justify-center h-48 text-muted-foreground">
                            {descriptions.idleText}
                        </div>
                     )}
                </CardContent>
            </Card>
      </div>
    </TooltipProvider>
  );
}



