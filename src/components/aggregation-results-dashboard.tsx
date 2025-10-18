
'use client';

import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, ReferenceLine, PieChart, Pie, Cell } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Skeleton } from './ui/skeleton';
import { ForestSimulation, TaskType, TreeSimulation } from '@/lib/types';
import { Sigma, Vote, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

interface AggregationResultsDashboardProps {
  simulationData: ForestSimulation | null;
  taskType: TaskType;
  isLoading: boolean;
}

const TREES_PER_PAGE = 10;

const COLORS = ['hsl(var(--chart-2))', 'hsl(var(--chart-1))'];

export function AggregationResultsDashboard({ simulationData, taskType, isLoading }: AggregationResultsDashboardProps) {
  const [currentPage, setCurrentPage] = useState(0);

  const trees = simulationData?.trees || [];
  const totalPages = Math.ceil(trees.length / TREES_PER_PAGE);
  const paginatedTrees = trees.slice(currentPage * TREES_PER_PAGE, (currentPage + 1) * TREES_PER_PAGE);

  const aggregationResult = useMemo(() => {
    if (!trees || trees.length === 0) return null;

    if (taskType === 'regression') {
      const average = trees.reduce((acc, t) => acc + t.prediction, 0) / trees.length;
      const stdDev = Math.sqrt(trees.reduce((acc, t) => acc + Math.pow(t.prediction - average, 2), 0) / trees.length);
      return { average, stdDev };
    } else {
      const votes: { [key: string]: number } = { '0': 0, '1': 0 };
      trees.forEach(t => {
        votes[t.prediction.toString()]++;
      });
      const winner = votes['1'] > votes['0'] ? '1' : '0';
      return { votes, winner };
    }
  }, [trees, taskType]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!simulationData) {
    return null;
  }

  const renderRegressionDashboard = () => {
    const { average, stdDev } = aggregationResult as { average: number; stdDev: number };

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Final Averaged Prediction</CardTitle>
            <CardDescription>The final prediction is the average of all individual tree predictions.</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-5xl font-bold">{average.toFixed(3)}</div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Individual Tree Predictions</CardTitle>
            <CardDescription>Comparison of predictions from different trees in the forest.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={trees}>
                  <XAxis dataKey="id" label={{ value: 'Tree ID', position: 'insideBottom', offset: -5 }} />
                  <YAxis label={{ value: 'Prediction', angle: -90, position: 'insideLeft' }} />
                  <ChartTooltip
                      content={<ChartTooltipContent formatter={(value, name, props) => `${props.payload.id}: ${value.toFixed(3)}`} />}
                      cursor={{ fill: 'hsl(var(--accent))' }}
                  />
                  <Bar dataKey="prediction" fill="hsl(var(--primary))" />
                  <ReferenceLine y={average} stroke="hsl(var(--destructive))" strokeDasharray="3 3" label={{ value: 'Avg', position: 'right' }} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Prediction Spread</CardTitle>
            <CardDescription>Measures the variance of predictions across all trees. Lower variance indicates higher agreement.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <span>Low</span>
              <Progress value={(stdDev ?? 0) * 100} className="w-full" />
              <span>High</span>
              <span className="font-bold">Std. Dev: {(stdDev ?? 0).toFixed(3)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };
  
  const renderClassificationDashboard = () => {
    const { votes, winner } = aggregationResult as { votes: { [key: string]: number }, winner: string };
    const voteData = [{ name: 'Class 0', votes: votes['0'] }, { name: 'Class 1', votes: votes['1'] }];
    const pieData = [{ name: 'Class 0', value: votes['0'] }, { name: 'Class 1', value: votes['1'] }];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-1">
                <CardHeader>
                    <CardTitle>Final Voted Prediction</CardTitle>
                    <CardDescription>The final prediction is the class with the most votes from all trees.</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                    <div className="text-5xl font-bold">Class {winner}</div>
                    <p className="text-muted-foreground">{votes[winner]} out of {trees.length} votes</p>
                </CardContent>
            </Card>
             <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>Class Vote Distribution</CardTitle>
                    <CardDescription>How the trees voted for each class.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <ChartContainer config={{}} className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={voteData}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <ChartTooltip content={<ChartTooltipContent />} cursor={{ fill: 'hsl(var(--accent))' }} />
                            <Bar dataKey="votes" fill="hsl(var(--primary))">
                                {voteData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                  <ChartContainer config={{}} className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <ChartTooltip content={<ChartTooltipContent />} />
                        </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
            </Card>
        </div>
    );
  };

  const renderSummaryTable = () => (
     <Card>
        <CardHeader>
            <CardTitle>Prediction Summary Table</CardTitle>
            <CardDescription>Detailed predictions from each tree in the forest.</CardDescription>
        </CardHeader>
        <CardContent>
             <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Tree ID</TableHead>
                        <TableHead>{taskType === 'regression' ? 'Prediction' : 'Predicted Class'}</TableHead>
                        <TableHead>Weight</TableHead>
                        <TableHead>{taskType === 'regression' ? 'Contribution' : 'Confidence'}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {paginatedTrees.map((tree) => {
                        const contribution = taskType === 'regression' ? (tree.prediction / ((aggregationResult as { average: number })?.average * trees.length) * 100) : 'N/A';
                        const confidence = taskType === 'classification' ? (Math.random() * (95 - 80) + 80).toFixed(2) : 'N/A';
                        return (
                            <TableRow key={tree.id}>
                                <TableCell>{tree.id}</TableCell>
                                <TableCell>{taskType === 'regression' ? tree.prediction.toFixed(3) : tree.prediction}</TableCell>
                                <TableCell>{(1 / trees.length).toFixed(3)}</TableCell>
                                <TableCell>
                                     <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <span>{confidence !== 'N/A' ? `${confidence}%` : `${contribution.toFixed(2)}%`}</span>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                {taskType === 'classification' ? 
                                                    <p>Mock confidence score for demonstration.</p> :
                                                    <p>Percentage contribution to the final averaged prediction.</p>
                                                }
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
            <div className="flex justify-end items-center mt-4 gap-2">
                <span className="text-sm text-muted-foreground">
                    Page {currentPage + 1} of {totalPages}
                </span>
                <Button variant="outline" size="icon" onClick={() => setCurrentPage(p => Math.max(0, p - 1))} disabled={currentPage === 0}>
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))} disabled={currentPage === totalPages - 1}>
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
        <Card>
             <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    {taskType === 'regression' ? <Sigma /> : <Vote />}
                    Aggregation Results
                </CardTitle>
                <CardDescription>
                    This section breaks down how the Random Forest model combines the predictions from all individual decision trees to arrive at a final result.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {taskType === 'regression' ? renderRegressionDashboard() : renderClassificationDashboard()}
                {renderSummaryTable()}
            </CardContent>
        </Card>
    </div>
  );
}
