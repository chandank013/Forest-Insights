'use client';

import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Label, Legend } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { useMemo } from 'react';

export function PrecisionRecallCurveChart() {
    const prData = useMemo(() => {
        // Mock data for a reasonably good classifier
        const data = [
            { recall: 0, precision: 1 },
            { recall: 0.15, precision: 0.98 },
            { recall: 0.4, precision: 0.95 },
            { recall: 0.65, precision: 0.90 },
            { recall: 0.8, precision: 0.85 },
            { recall: 0.88, precision: 0.75 },
            { recall: 0.92, precision: 0.65 },
            { recall: 0.95, precision: 0.5 },
            { recall: 0.98, precision: 0.3 },
            { recall: 1, precision: 0.2 }
        ];
        return data;
    }, []);

    const areaUnderCurve = useMemo(() => {
        let auc = 0;
        for (let i = 1; i < prData.length; i++) {
            auc += (prData[i].recall - prData[i-1].recall) * (prData[i].precision + prData[i-1].precision) / 2;
        }
        return auc.toFixed(3);
    }, [prData]);

    return (
        <div className="h-[300px] w-full">
            <ChartContainer config={{}} className="h-full w-full">
                <ResponsiveContainer>
                    <LineChart data={prData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                            type="number" 
                            dataKey="recall" 
                            name="Recall" 
                            domain={[0, 1]}
                            tick={{ fontSize: 12 }}
                        >
                            <Label value="Recall" position="bottom" offset={0} fontSize={12} />
                        </XAxis>
                        <YAxis 
                            type="number"
                            dataKey="precision"
                            name="Precision"
                            domain={[0, 1]}
                            tick={{ fontSize: 12 }}
                        >
                            <Label value="Precision" angle={-90} position="insideLeft" offset={-10} style={{ textAnchor: 'middle' }} fontSize={12} />
                        </YAxis>
                        <Tooltip content={<ChartTooltipContent />} />
                        <Legend verticalAlign="top" formatter={() => `Model (AUC = ${areaUnderCurve})`} />
                        <Line dataKey="precision" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="Model" />
                    </LineChart>
                </ResponsiveContainer>
            </ChartContainer>
        </div>
    );
}

    