'use client';

import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Label, Legend } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import type { CurveDataPoint } from '@/lib/types';
import { useMemo } from 'react';


interface RocCurveChartProps {
  data: CurveDataPoint[] | null;
}

export function RocCurveChart({ data }: RocCurveChartProps) {

    const areaUnderCurve = useMemo(() => {
        if (!data) return '0.000';
        let auc = 0;
        for (let i = 1; i < data.length; i++) {
            auc += (data[i].x - data[i-1].x) * (data[i].y + data[i-1].y) / 2;
        }
        return auc.toFixed(3);
    }, [data]);

    if (!data) {
        return (
            <div className="flex items-center justify-center h-full text-muted-foreground">
                Train a classification model to see the ROC curve.
            </div>
        );
    }

    return (
        <div className="h-[300px] w-full">
            <ChartContainer config={{}} className="h-full w-full">
                <ResponsiveContainer>
                    <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                            type="number" 
                            dataKey="x" 
                            name="False Positive Rate" 
                            domain={[0, 1]}
                            tick={{ fontSize: 12 }}
                        >
                            <Label value="False Positive Rate" position="bottom" offset={0} fontSize={12} />
                        </XAxis>
                        <YAxis 
                            type="number"
                            dataKey="y"
                            name="True Positive Rate"
                            domain={[0, 1]}
                            tick={{ fontSize: 12 }}
                        >
                            <Label value="True Positive Rate" angle={-90} position="insideLeft" offset={-10} style={{ textAnchor: 'middle' }} fontSize={12} />
                        </YAxis>
                        <Tooltip content={<ChartTooltipContent />} />
                        <Legend verticalAlign="top" formatter={() => `Model (AUC = ${areaUnderCurve})`} />
                        <Line dataKey="y" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="Model" />
                        <Line dataKey="x" stroke="hsl(var(--muted-foreground))" strokeDasharray="5 5" dot={false} isAnimationActive={false} name="Random Chance" />
                    </LineChart>
                </ResponsiveContainer>
            </ChartContainer>
        </div>
    );
}

    