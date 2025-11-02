
'use client';

import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, ReferenceLine, PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, LabelList } from 'recharts';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Skeleton } from './ui/skeleton';
import { ForestSimulation, TaskType } from '@/lib/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AggregationResultsDashboardProps {
  simulationData: ForestSimulation | null;
  taskType: TaskType;
  isLoading: boolean;
  descriptions: {
    finalPrediction: string;
    predictionSpread: string;
    individualPredictions: string;
    summaryTable: string;
  };
  datasetName: string;
}

const TREES_PER_PAGE = 10;

const COLORS = ['hsl(var(--chart-2))', 'hsl(var(--chart-1))'];

const getClassificationLabels = (datasetName: string) => {
    switch (datasetName) {
        case 'wine-quality':
            return { '0': 'Bad', '1': 'Good' };
        case 'breast-cancer':
            return { '0': 'Malignant', '1': 'Benign' };
        default:
            return { '0': 'Class 0', '1': 'Class 1' };
    }
};

export function AggregationResultsDashboard({ simulationData, taskType, isLoading, descriptions, datasetName }: AggregationResultsDashboardProps) {
  const [currentPage, setCurrentPage] = useState(0);

  const trees = simulationData?.trees || [];
  const totalPages = Math.ceil(trees.length / TREES_PER_PAGE);
  const paginatedTrees = trees.slice(currentPage * TREES_PER_PAGE, (currentPage + 1) * TREES_PER_PAGE);

  const classLabels = getClassificationLabels(datasetName);

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
  
  const renderClassificationDashboard = () => {
    const { votes, winner } = aggregationResult as { votes: { [key: string]: number }, winner: string };
    const voteData = [
        { name: classLabels['0'], votes: votes['0'] }, 
        { name: classLabels['1'], votes: votes['1'] }
    ];
    const pieData = [
        { name: classLabels['0'], value: votes['0'] }, 
        { name: classLabels['1'], value: votes['1'] }
    ];

    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.7;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central">
            {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Final Voted Prediction</CardTitle>
                        <CardDescription>{descriptions.finalPrediction}</CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                        <div className="text-5xl font-bold">{classLabels[winner as keyof typeof classLabels]}</div>
                        <p className="text-muted-foreground">{votes[winner]} out of {trees.length} votes</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Class Vote Distribution</CardTitle>
                        <CardDescription>{descriptions.predictionSpread}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={voteData}>
                                <XAxis dataKey="name" />
                                <YAxis />
                                <RechartsTooltip 
                                    cursor={{ fill: 'hsl(var(--accent))' }} 
                                    contentStyle={{ 
                                      backgroundColor: 'hsl(var(--background))', 
                                      border: '1px solid hsl(var(--border))',
                                      borderRadius: 'var(--radius)'
                                    }}
                                />
                                <Bar dataKey="votes" fill="hsl(var(--primary))">
                                    <LabelList dataKey="votes" position="top" />
                                    {voteData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
             <div className="grid grid-cols-1 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Individual Tree Predictions</CardTitle>
                        <CardDescription>{descriptions.individualPredictions}</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                         <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie 
                                    data={pieData} 
                                    dataKey="value" 
                                    nameKey="name" 
                                    cx="50%" 
                                    cy="50%" 
                                    outerRadius={150} 
                                    fill="hsl(var(--primary))" 
                                    labelLine={false}
                                    label={renderCustomizedLabel}
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                {renderSummaryTable()}
            </div>
        </div>
    );
  };

  const renderRegressionDashboard = () => {
    const { average, stdDev } = aggregationResult as { average: number; stdDev: number };

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Final Averaged Prediction</CardTitle>
                <CardDescription>{descriptions.finalPrediction}</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-5xl font-bold">{average.toFixed(3)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Prediction Spread</CardTitle>
                <CardDescription>{descriptions.predictionSpread}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 pt-6">
                  <span>Low</span>
                  <Progress value={(stdDev ?? 0) * 100} className="w-full" />
                  <span>High</span>
                  <span className="font-bold">Std. Dev: {(stdDev ?? 0).toFixed(3)}</span>
                </div>
              </CardContent>
            </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Individual Tree Predictions</CardTitle>
            <CardDescription>{descriptions.individualPredictions}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={trees}>
                  <XAxis dataKey="id" label={{ value: 'Tree ID', position: 'insideBottom', offset: -5 }} />
                  <YAxis label={{ value: 'Prediction', angle: -90, position: 'insideLeft' }} />
                  <RechartsTooltip
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: 'var(--radius)'
                      }}
                      formatter={(value: number, name, props) => [`${value.toFixed(3) ?? ''}`, `Tree ${props.payload.id}`]}
                      cursor={{ fill: 'hsl(var(--accent))' }}
                  />
                  <Bar dataKey="prediction" fill="hsl(var(--primary))">
                    <LabelList dataKey="prediction" position="top" formatter={(value: number) => value.toFixed(2)} />
                  </Bar>
                  <ReferenceLine y={average} stroke="hsl(var(--destructive))" strokeDasharray="3 3" label={{ value: 'Avg', position: 'right' }} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        {renderSummaryTable()}
      </div>
    );
  };
  
  const renderSummaryTable = () => (
     <Card>
        <CardHeader>
            <CardTitle>Prediction Summary Table</CardTitle>
            <CardDescription>{descriptions.summaryTable}</CardDescription>
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
                        const predictedClassLabel = taskType === 'classification' ? classLabels[tree.prediction.toString() as keyof typeof classLabels] : '';
                        return (
                            <TableRow key={tree.id}>
                                <TableCell>{tree.id}</TableCell>
                                <TableCell>{taskType === 'regression' ? tree.prediction.toFixed(3) : predictedClassLabel}</TableCell>
                                <TableCell>{(1 / trees.length).toFixed(3)}</TableCell>
                                <TableCell>
                                     <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <span>{confidence !== 'N/A' ? `${confidence}%` : `${typeof contribution === 'number' ? contribution.toFixed(2) : 'N/A'}%`}</span>
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
        {taskType === 'regression' ? renderRegressionDashboard() : renderClassificationDashboard()}
    </div>
  );
}
