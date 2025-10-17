
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip as RechartsTooltip } from 'recharts';
import { Trees, GitMerge, Info, Sigma, Vote, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TaskType, ForestSimulation, TreeSimulation, DecisionTree } from '@/lib/types';
import { Skeleton } from './ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { DecisionTreeSnapshot } from './decision-tree-snapshot';

interface ForestVisualizationProps {
  simulationData: ForestSimulation | null;
  taskType: TaskType;
  isLoading: boolean;
  onRetrain: () => void;
}

const TREES_PER_PAGE = 30;

const MiniTree = ({ tree, taskType, onTreeClick }: { tree: TreeSimulation, taskType: TaskType, onTreeClick: () => void }) => {
  const finalColor = taskType === 'classification'
    ? tree.prediction === 1 ? 'bg-blue-500/80' : 'bg-red-500/80'
    : 'bg-green-500/80';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex flex-col items-center gap-1 cursor-pointer" onClick={onTreeClick}>
             <div className={cn(
              "relative w-12 h-12 rounded-full bg-muted flex items-center justify-center transition-all duration-500",
              finalColor
            )}>
              <Trees className={cn("h-6 w-6 text-white transition-colors")} />
            </div>
            <div className={cn(
              "text-xs font-bold text-muted-foreground transition-opacity duration-300",
            )}>
              {taskType === 'classification' ? `Class ${tree.prediction}` : tree.prediction.toFixed(2)}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p>Tree ID: {tree.id}</p>
          <p>Prediction: {tree.prediction.toFixed(2)}</p>
          <p>Key Features: {tree.keyFeatures.join(', ')}</p>
          <p>Samples: {tree.samples}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
};

export function ForestVisualization({ simulationData, taskType, isLoading, onRetrain }: ForestVisualizationProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedTree, setSelectedTree] = useState<DecisionTree | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  useEffect(() => {
    setCurrentPage(0);
  }, [taskType, simulationData]);

  const totalPages = simulationData ? Math.ceil(simulationData.trees.length / TREES_PER_PAGE) : 0;
  const paginatedTrees = useMemo(() => {
      if (!simulationData) return [];
      const start = currentPage * TREES_PER_PAGE;
      const end = start + TREES_PER_PAGE;
      return simulationData.trees.slice(start, end);
  }, [simulationData, currentPage]);


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
        if (Object.keys(votes).length === 0) return 0;
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

  const handleTreeClick = (tree: DecisionTree) => {
    setSelectedTree(tree);
    setIsDialogOpen(true);
  };

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
    <>
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
                    <div className='flex justify-end items-center mb-4 gap-4'>
                        <div className="flex-1 text-sm text-muted-foreground">
                            {simulationData.trees.length > 0 && `Showing ${currentPage * TREES_PER_PAGE + 1}-${Math.min((currentPage + 1) * TREES_PER_PAGE, simulationData.trees.length)} of ${simulationData.trees.length} trees`}
                        </div>
                        <div className='flex gap-2'>
                           {totalPages > 1 && <Button variant="outline" size="icon" onClick={() => setCurrentPage(p => Math.max(0, p-1))} disabled={currentPage === 0}><ChevronLeft className='w-4 h-4' /></Button>}
                           {totalPages > 1 && <Button variant="outline" size="icon" onClick={() => setCurrentPage(p => Math.min(totalPages-1, p+1))} disabled={currentPage === totalPages - 1}><ChevronRight className='w-4 h-4' /></Button>}
                        </div>
                    </div>

                    <div className="grid grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-4 p-4 rounded-lg border bg-muted/50 min-h-[180px]">
                        {paginatedTrees.map(tree => (
                             <MiniTree 
                                key={tree.id}
                                tree={tree} 
                                taskType={taskType}
                                onTreeClick={() => handleTreeClick(tree.tree)}
                            />
                        ))}
                    </div>
                </CardContent>
            </Card>
            <Card>
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
         <Dialog open={isDialogOpen} onOpenChange={(isOpen) => {
            setIsDialogOpen(isOpen);
            if (!isOpen) {
                setSelectedTree(null);
            }
         }}>
            <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Decision Tree Snapshot</DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-auto">
                    <DecisionTreeSnapshot tree={selectedTree} taskType={taskType} />
                </div>
            </DialogContent>
        </Dialog>
    </>
  )
}
