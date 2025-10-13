'use client';

import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Label, Legend } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { useMemo } from 'react';

export function RocCurveChart() {
    const rocData = useMemo(() => {
        // Mock data for a reasonably good classifier
        const data = [
            { fpr: 0, tpr: 0 },
            { fpr: 0.01, tpr: 0.15 },
            { fpr: 0.05, tpr: 0.4 },
            { fpr: 0.1, tpr: 0.65 },
            { fpr: 0.2, tpr: 0.8 },
            { fpr: 0.3, tpr: 0.88 },
            { fpr: 0.4, tpr: 0.92 },
            { fpr: 0.5, tpr: 0.95 },
            { fpr: 0.7, tpr: 0.98 },
            { fpr: 1, tpr: 1 }
        ];
        return data;
    }, []);

    const areaUnderCurve = useMemo(() => {
        let auc = 0;
        for (let i = 1; i < rocData.length; i++) {
            auc += (rocData[i].fpr - rocData[i-1].fpr) * (rocData[i].tpr + rocData[i-1].tpr) / 2;
        }
        return auc.toFixed(3);
    }, [rocData]);

    return (
        <div className="h-[300px] w-full">
            <ChartContainer config={{}} className="h-full w-full">
                <ResponsiveContainer>
                    <LineChart data={rocData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                            type="number" 
                            dataKey="fpr" 
                            name="False Positive Rate" 
                            domain={[0, 1]}
                            tick={{ fontSize: 12 }}
                        >
                            <Label value="False Positive Rate" position="bottom" offset={0} fontSize={12} />
                        </XAxis>
                        <YAxis 
                            type="number"
                            dataKey="tpr"
                            name="True Positive Rate"
                            domain={[0, 1]}
                            tick={{ fontSize: 12 }}
                        >
                            <Label value="True Positive Rate" angle={-90} position="insideLeft" offset={-10} style={{ textAnchor: 'middle' }} fontSize={12} />
                        </YAxis>
                        <Tooltip content={<ChartTooltipContent />} />
                        <Legend verticalAlign="top" formatter={() => `Model (AUC = ${areaUnderCurve})`} />
                        <Line dataKey="tpr" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="Model" />
                        <Line dataKey="fpr" stroke="hsl(var(--muted-foreground))" strokeDasharray="5 5" dot={false} isAnimationActive={false} name="Random Chance" />
                    </LineChart>
                </ResponsiveContainer>
            </ChartContainer>
        </div>
    );
}

    