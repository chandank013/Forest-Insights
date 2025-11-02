

'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Trees, GitMerge, Info, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TaskType, ForestSimulation, TreeSimulation, DecisionTree } from '@/lib/types';
import { Skeleton } from './ui/skeleton';
import { DecisionTreeSnapshot } from './decision-tree-snapshot';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

interface ForestVisualizationProps {
  simulationData: ForestSimulation | null;
  taskType: TaskType;
  isLoading: boolean;
  onRetrain: () => void;
  datasetName: string;
  description: string;
}

const TREES_PER_PAGE = 50;

const getClassificationLabels = (datasetName: string) => {
    switch (datasetName) {
        case 'wine-quality':
            return { '0': 'Bad', '1': 'Good' };
        case 'breast-cancer':
            return { '0': 'Malignant', '1': 'Benign' };
        case 'digits':
             return { '0': '0', '1': '1', '2': '2', '3': '3', '4': '4', '5': '5', '6': '6', '7': '7', '8': '8', '9': '9' };
        default:
            return { '0': 'Class 0', '1': 'Class 1' };
    }
};

const MiniTree = ({ tree, taskType, onTreeClick, classLabel, isSelected }: { tree: TreeSimulation, taskType: TaskType, onTreeClick: () => void, classLabel: string, isSelected: boolean }) => {
  const finalColor = taskType === 'classification'
    ? tree.prediction === 1 ? 'bg-blue-500/80' : 'bg-red-500/80'
    : 'bg-green-500/80';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex flex-col items-center gap-1 cursor-pointer group" onClick={onTreeClick}>
             <div className={cn(
              "relative w-12 h-12 rounded-full bg-muted flex items-center justify-center transition-all duration-500 group-hover:scale-125 animate-glow shadow-lg shadow-primary/50",
              finalColor,
              isSelected && "ring-2 ring-offset-2 ring-primary ring-offset-background"
            )}>
              <Trees className={cn("h-6 w-6 text-white transition-colors")} />
            </div>
            <div className={cn(
              "text-xs font-bold text-muted-foreground transition-opacity duration-300",
            )}>
              {classLabel}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top">
           <p>Tree ID: {tree.id}</p>
           <p>Samples: {tree.samples}</p>
          <p>Prediction: {tree.prediction.toFixed(2)}</p>
          <p>Key Features: {tree.keyFeatures.join(', ')}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
};

export function ForestVisualization({ simulationData, taskType, isLoading, onRetrain, datasetName, description }: ForestVisualizationProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedTreeId, setSelectedTreeId] = useState<number | null>(null);
  
  useEffect(() => {
    setCurrentPage(0);
    setSelectedTreeId(null);
  }, [taskType, simulationData]);

  const classLabels = getClassificationLabels(datasetName);

  const totalPages = simulationData ? Math.ceil(simulationData.trees.length / TREES_PER_PAGE) : 0;
  const paginatedTrees = useMemo(() => {
      if (!simulationData) return [];
      const start = currentPage * TREES_PER_PAGE;
      const end = start + TREES_PER_PAGE;
      return simulationData.trees.slice(start, end);
  }, [simulationData, currentPage]);


  const handleTreeClick = (treeId: number) => {
    setSelectedTreeId(currentId => currentId === treeId ? null : treeId);
  };
  
  const selectedTree = useMemo(() => {
    if (selectedTreeId === null || !simulationData) return null;
    return simulationData.trees.find(t => t.id === selectedTreeId)?.tree ?? null;
  }, [selectedTreeId, simulationData]);


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

  return (
    <>
        <div className='space-y-4'>
            <Card>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'><GitMerge className='w-5 h-5' />How the Random Forest Combines Predictions</CardTitle>
                    <CardDescription className='flex items-center gap-2'>
                        {description}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className='flex justify-between items-center mb-4 gap-4'>
                        <strong className="flex-1 text-sm font-semibold">Click the Trees to inspect</strong>
                        <div className="text-sm text-muted-foreground">
                            {simulationData.trees.length > 0 && `Showing ${currentPage * TREES_PER_PAGE + 1}-${Math.min((currentPage + 1) * TREES_PER_PAGE, simulationData.trees.length)} of ${simulationData.trees.length} trees`}
                        </div>
                        <div className='flex gap-2'>
                           {totalPages > 1 && <Button variant="outline" size="icon" onClick={() => setCurrentPage(p => Math.max(0, p-1))} disabled={currentPage === 0}><ChevronLeft className='w-4 h-4' /></Button>}
                           {totalPages > 1 && <Button variant="outline" size="icon" onClick={() => setCurrentPage(p => Math.min(totalPages-1, p+1))} disabled={currentPage === totalPages - 1}><ChevronRight className='w-4 h-4' /></Button>}
                        </div>
                    </div>

                    <div className="grid grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-4 p-4 rounded-lg border bg-muted/50 min-h-[180px]">
                        {paginatedTrees.map(tree => {
                             const classLabel = taskType === 'classification'
                                ? classLabels[tree.prediction.toString() as keyof typeof classLabels] || `Class ${tree.prediction}`
                                : tree.prediction.toFixed(2);
                             return <MiniTree 
                                key={tree.id}
                                tree={tree} 
                                taskType={taskType}
                                onTreeClick={() => handleTreeClick(tree.id)}
                                classLabel={classLabel}
                                isSelected={selectedTreeId === tree.id}
                            />
                        })}
                    </div>
                </CardContent>
            </Card>

             {selectedTree && (
                 <Dialog open={selectedTreeId !== null} onOpenChange={(isOpen) => !isOpen && setSelectedTreeId(null)}>
                    <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
                        <DialogHeader>
                            <DialogTitle>Decision Tree Snapshot (Tree ID: {selectedTreeId})</DialogTitle>
                        </DialogHeader>
                        <div className="flex-1 h-full overflow-auto">
                            <DecisionTreeSnapshot tree={selectedTree} taskType={taskType} />
                        </div>
                    </DialogContent>
                 </Dialog>
            )}
        </div>
    </>
  )
}
