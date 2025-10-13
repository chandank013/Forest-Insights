'use client';

import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Label } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import type { ChartDataPoint } from '@/lib/types';
import { useMemo } from 'react';

interface CumulativeErrorChartProps {
  data: ChartDataPoint[] | null;
}

export function CumulativeErrorChart({ data }: CumulativeErrorChartProps) {
    const cumulativeData = useMemo(() => {
        if (!data) return [];
        
        const errors = data.map(p => Math.abs(p.prediction - p.actual)).sort((a, b) => a - b);
        const maxError = errors[errors.length - 1];
        
        const cdf = [];
        for (let i = 0; i <= 100; i++) {
            const errorThreshold = (i / 100) * maxError;
            const count = errors.filter(e => e <= errorThreshold).length;
            cdf.push({
                error: errorThreshold,
                percentage: (count / errors.length) * 100
            });
        }
        return cdf;

    }, [data]);
    
    if (!data) return <div className="text-center text-muted-foreground">Train a model to see the cumulative error chart.</div>;

    return (
        <div className="h-[300px] w-full">
            <ChartContainer config={{}} className="h-full w-full">
                <ResponsiveContainer>
                    <LineChart data={cumulativeData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                            type="number" 
                            dataKey="error" 
                            name="Absolute Error" 
                            domain={['dataMin', 'dataMax']}
                            tick={{ fontSize: 12 }}
                        >
                           <Label value="Absolute Prediction Error" position="bottom" offset={0} fontSize={12} />
                        </XAxis>
                        <YAxis 
                            type="number"
                            dataKey="percentage"
                            domain={[0, 100]}
                            tickFormatter={(value) => `${value}%`}
                            tick={{ fontSize: 12 }}
                        >
                           <Label value="% of Predictions" angle={-90} position="insideLeft" offset={-10} style={{ textAnchor: 'middle' }} fontSize={12} />
                        </YAxis>
                        <Tooltip content={<ChartTooltipContent formatter={(value, name) => (name === 'percentage' ? `${(value as number).toFixed(2)}%` : value)} />} />
                        <Line type="monotone" dataKey="percentage" name="% of Predictions" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </ChartContainer>
        </div>
    );
}

    