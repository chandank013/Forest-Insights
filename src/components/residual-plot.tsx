'use client';

import { Scatter, ScatterChart, CartesianGrid, XAxis, YAxis, Tooltip, Line, ResponsiveContainer, Label } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import type { ChartDataPoint } from '@/lib/types';

interface ResidualPlotProps {
  data: ChartDataPoint[] | null;
}

export function ResidualPlot({ data }: ResidualPlotProps) {
    if (!data) return <div className="text-center text-muted-foreground">Train a model to see the residual plot.</div>;
    
    const residualData = data.map(p => ({ ...p, residual: p.prediction - p.actual }));

    return (
        <div className="h-[300px] w-full">
            <ChartContainer config={{}} className="h-full w-full">
                <ResponsiveContainer>
                    <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                            type="number" 
                            dataKey="prediction" 
                            name="Predicted Value" 
                            domain={['dataMin', 'dataMax']}
                            tick={{ fontSize: 12 }}
                        >
                           <Label value="Predicted Value" position="bottom" offset={0} fontSize={12} />
                        </XAxis>
                        <YAxis 
                            type="number" 
                            dataKey="residual" 
                            name="Residual"
                            tick={{ fontSize: 12 }}
                        >
                            <Label value="Residuals (Prediction - Actual)" angle={-90} position="insideLeft" offset={-10} style={{ textAnchor: 'middle' }} fontSize={12} />
                        </YAxis>
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<ChartTooltipContent />} />
                        <Line type="monotone" dataKey="zero" stroke="hsl(var(--destructive))" strokeWidth={2} dot={false} activeDot={false} isAnimationActive={false} name="Zero Error" />
                        <Scatter name="Residuals" data={residualData} fill="hsl(var(--primary))" />
                    </ScatterChart>
                </ResponsiveContainer>
            </ChartContainer>
        </div>
    );
}

    