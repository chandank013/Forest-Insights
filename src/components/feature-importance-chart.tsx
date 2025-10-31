
'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import type { DatasetMetadata, FeatureImportance } from '@/lib/types';
import { HelpCircle } from 'lucide-react';
import { Tooltip as UiTooltip, TooltipContent as UiTooltipContent, TooltipProvider, TooltipTrigger as UiTooltipTrigger } from '@/components/ui/tooltip';

interface FeatureImportanceChartProps {
  tunedData: FeatureImportance[];
  baselineData: FeatureImportance[];
  metadata: DatasetMetadata | null;
}

const CustomYAxisTick = (props: any) => {
    const { x, y, payload, metadata } = props;
    const featureName = payload.value;
    const description = metadata?.attributes[featureName]?.description;

    return (
        <g transform={`translate(${x},${y})`}>
            <UiTooltip>
                <UiTooltipTrigger asChild>
                     <text x={0} y={0} dy={4} textAnchor="end" fill="hsl(var(--foreground))" className="text-xs cursor-help flex items-center">
                        {featureName.length > 15 ? `${featureName.substring(0, 13)}...` : featureName}
                    </text>
                </UiTooltipTrigger>
                <UiTooltipContent side="right" className="max-w-xs">
                    <p className='font-bold'>{featureName}</p>
                    <p>{description || 'No description available.'}</p>
                </UiTooltipContent>
            </UiTooltip>
        </g>
    );
};


export function FeatureImportanceChart({ tunedData, baselineData, metadata }: FeatureImportanceChartProps) {
  
  const combinedData = tunedData.map(tunedItem => {
    const baselineItem = baselineData.find(item => item.feature === tunedItem.feature);
    return {
      feature: tunedItem.feature,
      tuned: tunedItem.importance,
      baseline: baselineItem ? baselineItem.importance : 0,
    };
  }).slice(0, 10).sort((a, b) => (a.tuned + a.baseline) - (b.tuned + b.baseline));


  return (
    <div className="h-[250px] md:h-[350px]">
      <TooltipProvider>
        <ChartContainer config={{}} className="h-full w-full">
          <ResponsiveContainer>
          <BarChart
            data={combinedData}
            layout="vertical"
            margin={{ left: 80, right: 30, top: 20, bottom: 20 }}
          >
            <CartesianGrid horizontal={false} strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis
              dataKey="feature"
              type="category"
              tickLine={false}
              axisLine={false}
              tick={<CustomYAxisTick metadata={metadata} />}
              interval={0}
              width={100}
            />
            <Tooltip cursor={{ fill: 'hsl(var(--accent))' }} content={<ChartTooltipContent />} />
            <Legend />
            <Bar dataKey="baseline" name="Baseline" fill="hsl(var(--secondary-foreground))" radius={[0, 4, 4, 0]} />
            <Bar dataKey="tuned" name="Tuned" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
          </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </TooltipProvider>
    </div>
  );
}
