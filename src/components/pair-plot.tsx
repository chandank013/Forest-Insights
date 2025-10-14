'use client';

import { useMemo, useState } from 'react';
import { Scatter, ScatterChart, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Label } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TaskType } from '@/lib/types';
import { Card } from './ui/card';

interface PairPlotProps {
    dataset: Record<string, any>[];
    targetColumn: string;
    task: TaskType;
}

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export function PairPlot({ dataset, targetColumn, task }: PairPlotProps) {
    const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
    
    const allNumericFeatures = useMemo(() => Object.keys(dataset[0] || {}).filter(key => typeof dataset[0][key] === 'number' && key !== targetColumn), [dataset, targetColumn]);

    const handleFeatureChange = (index: number, value: string) => {
        const newFeatures = [...selectedFeatures];
        newFeatures[index] = value;
        setSelectedFeatures(newFeatures);
    };

    const plotData = useMemo(() => {
        if (task !== 'classification') return dataset;
        
        const classValues = Array.from(new Set(dataset.map(d => d[targetColumn]))).sort();
        return dataset.map(d => ({
            ...d,
            color: COLORS[classValues.indexOf(d[targetColumn]) % COLORS.length]
        }));
    }, [dataset, targetColumn, task]);


    // Initialize with first 3 features if available
    useState(() => {
        if (allNumericFeatures.length > 0) {
            setSelectedFeatures(allNumericFeatures.slice(0, 3));
        }
    });

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                     <Select key={i} value={selectedFeatures[i] || ''} onValueChange={(val) => handleFeatureChange(i, val)}>
                        <SelectTrigger className='w-full md:w-[200px]'>
                            <SelectValue placeholder={`Feature ${i + 1}`} />
                        </SelectTrigger>
                        <SelectContent>
                            {allNumericFeatures.map(f => (
                                <SelectItem key={f} value={f} disabled={selectedFeatures.includes(f) && selectedFeatures[i] !== f}>
                                    {f}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {selectedFeatures.map((yFeature, i) => (
                    selectedFeatures.map((xFeature, j) => (
                        <Card key={`${i}-${j}`} className='p-2'>
                             <ChartContainer config={{}} className="h-[200px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 30 }}>
                                        <CartesianGrid />
                                        <XAxis type="number" dataKey={xFeature} name={xFeature} tick={{ fontSize: 10 }} >
                                            <Label value={xFeature} position="bottom" offset={10} fontSize={12} />
                                        </XAxis>
                                        <YAxis type="number" dataKey={yFeature} name={yFeature} tick={{ fontSize: 10 }} >
                                            <Label value={yFeature} angle={-90} position="left" offset={10} fontSize={12} style={{ textAnchor: 'middle' }}/>
                                        </YAxis>
                                        <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<ChartTooltipContent />} />
                                        <Scatter name="Data" data={plotData} fill={'hsl(var(--primary))'} shape="circle" />
                                    </ScatterChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        </Card>
                    ))
                ))}
            </div>
        </div>
    );
}
