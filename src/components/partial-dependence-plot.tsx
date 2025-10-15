'use client';

import { useMemo, useState } from 'react';
import { Line, LineChart, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Label } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TaskType, PdpData } from '@/lib/types';
import { Card } from './ui/card';
import { CardDescription } from './ui/card';

interface PartialDependencePlotProps {
    dataset: Record<string, any>[];
    features: string[];
    task: TaskType;
    pdpData: PdpData | null;
}


export function PartialDependencePlot({ dataset, features, task, pdpData }: PartialDependencePlotProps) {
    const [selectedFeature, setSelectedFeature] = useState(features[0]);

    const chartData = useMemo(() => {
        if (!pdpData || !selectedFeature) return [];
        return pdpData[selectedFeature] || [];
    }, [pdpData, selectedFeature]);

     if (!pdpData) {
        return (
            <div className="flex items-center justify-center h-full text-muted-foreground">
                Train a model to see the partial dependence plot.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
                 <div className='w-full md:w-1/4'>
                    <CardDescription>Select a feature to see its effect on the prediction.</CardDescription>
                     <Select value={selectedFeature} onValueChange={setSelectedFeature}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a feature" />
                        </SelectTrigger>
                        <SelectContent>
                            {features.map(feature => (
                                <SelectItem key={feature} value={feature}>
                                    {feature}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                 </div>
            </div>
            <Card className='p-4'>
                <ChartContainer config={{}} className="h-[300px] w-full">
                    <ResponsiveContainer>
                        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                                type="number" 
                                dataKey="featureValue" 
                                domain={['dataMin', 'dataMax']}
                                tick={{ fontSize: 12 }}
                            >
                                <Label value={selectedFeature} position="bottom" offset={10} fontSize={12}/>
                            </XAxis>
                            <YAxis 
                                domain={['auto', 'auto']}
                                tick={{ fontSize: 12 }}
                            >
                                <Label 
                                    value="Average Prediction" 
                                    angle={-90} 
                                    position="insideLeft" 
                                    offset={-10} 
                                    fontSize={12} 
                                    style={{ textAnchor: 'middle' }}
                                />
                            </YAxis>
                            <Tooltip content={<ChartTooltipContent />} />
                            <Line type="monotone" dataKey="prediction" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </Card>
        </div>
    );
}

    