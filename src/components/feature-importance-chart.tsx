'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import type { DatasetMetadata, FeatureImportance } from '@/lib/types';
import { HelpCircle } from 'lucide-react';
import { Tooltip as UiTooltip, TooltipContent as UiTooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
            <foreignObject x={-90} y={-10} width="80" height="20">
                <TooltipProvider>
                    <UiTooltip>
                        <TooltipTrigger asChild>
                            <div className="flex items-center gap-1 cursor-help w-full">
                                <span className="truncate text-xs text-right w-full">{featureName}</span>
                                {description && <HelpCircle className="h-3 w-3 text-muted-foreground flex-shrink-0" />}
                            </div>
                        </TooltipTrigger>
                        {description && (
                            <UiTooltipContent side="right" className="max-w-xs">
                                <p>{description}</p>
                            </UiTooltipContent>
                        )}
                    </UiTooltip>
                </TooltipProvider>
            </foreignObject>
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
  }).slice(0, 7).sort((a, b) => (a.tuned + a.baseline) / 2 - (b.tuned + b.baseline) / 2);


  return (
    <div className="h-[250px] md:h-[350px]">
      <ChartContainer config={{}} className="h-full w-full">
        <BarChart
          data={combinedData}
          layout="vertical"
          margin={{ left: 20, right: 30, top: 20, bottom: 20 }}
        >
          <CartesianGrid horizontal={false} strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis
            dataKey="feature"
            type="category"
            tickLine={false}
            axisLine={false}
            tick={<CustomYAxisTick metadata={metadata} />}
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
