'use client';

import { Scatter, ScatterChart, CartesianGrid, XAxis, YAxis, Tooltip, Line, Legend } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import type { ChartDataPoint } from '@/lib/types';

interface PredictionPlotProps {
  tunedData: ChartDataPoint[] | null;
  baselineData: ChartDataPoint[] | null;
}

export function PredictionPlot({ tunedData, baselineData }: PredictionPlotProps) {
    if (!tunedData && !baselineData) return null;
    
    const allPoints = [...(tunedData || []), ...(baselineData || [])];

    const domain = [
        Math.min(...allPoints.map(d => d.actual), ...allPoints.map(d => d.prediction)),
        Math.max(...allPoints.map(d => d.actual), ...allPoints.map(d => d.prediction))
    ];
    
  return (
    <div className="h-[250px] md:h-[350px]">
      <ChartContainer config={{}} className="h-full w-full">
        <ScatterChart margin={{ left: 0, right: 20, top: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            type="number" 
            dataKey="actual" 
            name="Actual" 
            domain={domain}
            tick={{ fontSize: 12 }} 
            label={{ value: 'Actual Values', position: 'insideBottom', offset: -10, fontSize: 12 }} 
          />
          <YAxis 
            type="number" 
            dataKey="prediction" 
            name="Predicted"
            domain={domain}
            tick={{ fontSize: 12 }}
            label={{ value: 'Predictions', angle: -90, position: 'insideLeft', offset: 10, fontSize: 12 }}
          />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<ChartTooltipContent />} />
          <Legend />
          <Line type="monotone" dataKey="actual" stroke="hsl(var(--muted-foreground))" strokeWidth={2} dot={false} activeDot={false} isAnimationActive={false} name="Ideal" />
          {baselineData && <Scatter name="Baseline" data={baselineData} fill="hsl(var(--secondary-foreground))" />}
          {tunedData && <Scatter name="Tuned" data={tunedData} fill="hsl(var(--primary))" />}
        </ScatterChart>
      </ChartContainer>
    </div>
  );
}
