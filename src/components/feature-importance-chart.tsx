'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import type { FeatureImportance } from '@/lib/types';

interface FeatureImportanceChartProps {
  tunedData: FeatureImportance[];
  baselineData: FeatureImportance[];
}

export function FeatureImportanceChart({ tunedData, baselineData }: FeatureImportanceChartProps) {
  
  const combinedData = tunedData.map(tunedItem => {
    const baselineItem = baselineData.find(item => item.feature === tunedItem.feature);
    return {
      feature: tunedItem.feature,
      tuned: tunedItem.importance,
      baseline: baselineItem ? baselineItem.importance : 0,
    };
  }).slice(0, 7).sort((a, b) => (a.tuned + a.baseline) / 2 - (b.tuned + b.baseline) / 2);


  return (
    <div className="h-[250px] md:h-[350px]">
      <ChartContainer config={{}} className="h-full w-full">
        <BarChart
          data={combinedData}
          layout="vertical"
          margin={{ left: 10, right: 30, top: 20, bottom: 20 }}
        >
          <CartesianGrid horizontal={false} strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis
            dataKey="feature"
            type="category"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12 }}
            width={80}
          />
          <Tooltip cursor={{ fill: 'hsl(var(--accent))' }} content={<ChartTooltipContent />} />
          <Legend />
          <Bar dataKey="baseline" name="Baseline" fill="hsl(var(--secondary-foreground))" radius={[0, 4, 4, 0]} />
          <Bar dataKey="tuned" name="Tuned" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ChartContainer>
    </div>
  );
}
