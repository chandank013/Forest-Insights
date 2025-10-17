
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip as RechartsTooltip } from 'recharts';
import { Trees, GitMerge, Info, Play, RefreshCw,Sigma, Vote } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TaskType, ForestSimulation } from '@/lib/types';
import { Skeleton } from './ui/skeleton';

interface ForestVisualizationProps {
  simulationData: ForestSimulation | null;
  taskType: TaskType;
  isLoading: boolean;
  onRetrain: () => void;
}

const MiniTree = ({ tree, isRunning, isFinished, taskType }: { tree: ForestSimulation['trees'][0], isRunning: boolean, isFinished: boolean, taskType: TaskType }) => {
  const delay = isRunning ? `${tree.id * 50}ms` : '0ms';
  const finalColor = taskType === 'classification'
    ? tree.prediction === 1 ? 'bg-blue-500/80' : 'bg-red-500/80'
    : 'bg-green-500/80';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <div className="flex flex-col items-center gap-1">
             <div className={cn(
              "relative w-12 h-12 rounded-full bg-muted flex items-center justify-center transition-all duration-500",
              isFinished && finalColor
            )}>
              <Trees className={cn("h-6 w-6 text-muted-foreground transition-colors", isFinished && "text-white")} />
              <div 
                className={cn(
                  "absolute inset-0 border-2 border-primary rounded-full origin-center",
                  "transition-transform",
                  isRunning ? "animate-spin-slow" : "scale-0"
                )}
                style={{ animationDuration: '1.5s' }}
              />
            </div>
            <div className={cn(
              "text-xs font-bold text-muted-foreground transition-opacity duration-300",
              isFinished ? "opacity-100" : "opacity-0",
            )} style={{transitionDelay: delay}}>
              {taskType === 'classification' ? `Class ${tree.prediction}` : tree.prediction.toFixed(2)}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p>Tree ID: {tree.id}</p>
          <p>Prediction: {tree.prediction}</p>
          <p>Key Features: {tree.keyFeatures.join(', ')}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
};

export function ForestVisualization({ simulationData, taskType, isLoading, onRetrain }: ForestVisualizationProps) {
  const [simulationState, setSimulationState] = useState<'idle' | 'running' | 'finished'>('idle');
  
  useEffect(() => {
    setSimulationState('idle');
  }, [taskType, simulationData]);

  const handleSimulate = () => {
    setSimulationState('running');
    setTimeout(() => setSimulationState('finished'), 2000);
  };

  const handleReset = () => {
    setSimulationState('idle');
  };

  const aggregationResult = useMemo(() => {
    if (!simulationData) return null;
    if (taskType === 'regression') {
        const sum = simulationData.trees.reduce((acc, t) => acc + t.prediction, 0);
        return sum / simulationData.trees.length;
    } else {
        const votes: Record<string, number> = {};
        simulationData.trees.forEach(t => {
            votes[t.prediction] = (votes[t.prediction] || 0) + 1;
        });
        return parseInt(Object.keys(votes).reduce((a, b) => votes[a] > votes[b] ? a : b));
    }
  }, [simulationData, taskType]);
  
  const voteCounts = useMemo(() => {
    if (!simulationData || taskType !== 'classification') return [];
    const counts = simulationData.trees.reduce((acc, tree) => {
        const key = `Class ${tree.prediction}`;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [simulationData, taskType]);

  if (isLoading || !simulationData) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className='flex items-center gap-2'><GitMerge className='w-5 h-5' />How the Random Forest Combines Predictions</CardTitle>
            </CardHeader>
            <CardContent className='text-center'>
                <Skeleton className='h-48 w-full' />
                <p className='text-sm text-muted-foreground mt-2'>Train a model to see the visualization.</p>
            </CardContent>
        </Card>
    )
  }

  const AggregationIcon = taskType === 'classification' ? Vote : Sigma;

  return (
    <div className='space-y-4'>
        <Card>
            <CardHeader>
                <CardTitle className='flex items-center gap-2'><GitMerge className='w-5 h-5' />How the Random Forest Combines Predictions</CardTitle>
                <CardDescription className='flex items-center gap-2'>
                    A Random Forest is an ensemble of Decision Trees. The final prediction is obtained by aggregating the outputs of all trees.
                    <TooltipProvider>
                         <Tooltip>
                            <TooltipTrigger><Info className='w-4 h-4' /></TooltipTrigger>
                            <TooltipContent>Why it works: Randomness + Aggregation = Better Generalization.</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className='flex justify-end items-center mb-4'>
                    <div className='flex gap-2'>
                        <Button onClick={handleSimulate} disabled={simulationState === 'running'}><Play className='w-4 h-4 mr-2' />Simulate</Button>
                        <Button onClick={handleReset} variant='outline'><RefreshCw className='w-4 h-4 mr-2' />Reset</Button>
                    </div>
                </div>

                <div className="grid grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-4 p-4 rounded-lg border bg-muted/50">
                    {simulationData.trees.slice(0, 30).map(tree => (
                        <MiniTree key={tree.id} tree={tree} isRunning={simulationState === 'running'} isFinished={simulationState === 'finished'} taskType={taskType} />
                    ))}
                </div>
            </CardContent>
        </Card>
        <Card className={cn("transition-opacity duration-500", simulationState === 'finished' ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden')}>
             <CardHeader>
                <CardTitle className='flex items-center gap-2'><AggregationIcon className='w-5 h-5' />Aggregation Result</CardTitle>
            </CardHeader>
            <CardContent>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4 items-center'>
                    <div className='text-center'>
                        <p className="text-muted-foreground">{taskType === 'regression' ? 'Final Averaged Prediction' : 'Final Voted Prediction'}</p>
                        <p className="text-6xl font-bold text-primary">
                            {aggregationResult !== null ? (taskType === 'regression' ? aggregationResult.toFixed(3) : `Class ${aggregationResult}`) : 'N/A'}
                        </p>
                    </div>
                    <div>
                        {taskType === 'classification' && voteCounts.length > 0 && (
                            <ResponsiveContainer width="100%" height={150}>
                                <BarChart data={voteCounts} layout="vertical" margin={{ left: 20 }}>
                                    <XAxis type="number" hide />
                                    <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} />
                                    <RechartsTooltip cursor={{ fill: 'hsl(var(--accent))' }} contentStyle={{background: 'hsl(var(--background))', border: '1px solid hsl(var(--border))'}} />
                                    <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                                        {voteCounts.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.name === 'Class 1' ? 'hsl(var(--chart-2))' : 'hsl(var(--chart-5))'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                        {taskType === 'regression' && (
                             <p className='text-sm text-center text-muted-foreground'>The final prediction is the average of all individual tree predictions.</p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    </div>
  )
}
