'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Label } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import type { ChartDataPoint } from '@/lib/types';
import { useMemo } from 'react';

interface PredictionErrorHistogramProps {
  data: ChartDataPoint[] | null;
}

function generateHistogramData(data: number[], numBins = 20) {
    if (data.length === 0) return [];
    
    const min = Math.min(...data);
    const max = Math.max(...data);
    const binSize = (max - min) / numBins;

    const bins = Array.from({ length: numBins }, (_, i) => ({
        range: [min + i * binSize, min + (i + 1) * binSize],
        count: 0,
    }));

    data.forEach(value => {
        const binIndex = Math.min(Math.floor((value - min) / binSize), numBins - 1);
        if(bins[binIndex]) {
            bins[binIndex].count++;
        }
    });

    return bins.map(bin => ({
        name: `${bin.range[0].toFixed(2)}`,
        count: bin.count
    }));
}


export function PredictionErrorHistogram({ data }: PredictionErrorHistogramProps) {
    const errorData = useMemo(() => {
        if (!data) return [];
        const errors = data.map(p => p.prediction - p.actual);
        return generateHistogramData(errors);
    }, [data]);
    
    if (!data) return <div className="text-center text-muted-foreground">Train a model to see the prediction error histogram.</div>;

    return (
        <div className="h-[300px] w-full">
            <ChartContainer config={{}} className="h-full w-full">
                 <ResponsiveContainer>
                    <BarChart data={errorData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }}>
                           <Label value="Prediction Error (Prediction - Actual)" position="bottom" offset={0} fontSize={12} />
                        </XAxis>
                        <YAxis tick={{ fontSize: 12 }}>
                            <Label value="Count" angle={-90} position="insideLeft" offset={-10} style={{ textAnchor: 'middle' }} fontSize={12} />
                        </YAxis>
                        <Tooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="count" name="Frequency" fill="hsl(var(--primary))" />
                    </BarChart>
                </ResponsiveContainer>
            </ChartContainer>
        </div>
    );
}

    