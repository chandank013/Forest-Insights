
'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { useMemo } from "react";
import { DatasetMetadata } from '@/lib/types';
import { HelpCircle } from 'lucide-react';
import { Tooltip as UiTooltip, TooltipContent as UiTooltipContent, TooltipProvider, TooltipTrigger as UiTooltipTrigger } from '@/components/ui/tooltip';

interface MissingValuesChartProps {
    dataset: Record<string, any>[];
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


export function MissingValuesChart({ dataset, metadata }: MissingValuesChartProps) {
    const missingData = useMemo(() => {
        if (!dataset || dataset.length === 0) return [];

        const headers = Object.keys(dataset[0]);
        const totalRows = dataset.length;

        return headers.map(header => {
            const missingCount = dataset.reduce((acc, row) => {
                const value = row[header];
                return (value === null || value === undefined) ? acc + 1 : acc;
            }, 0);
            return {
                name: header,
                "Missing (%)": (missingCount / totalRows) * 100
            };
        });
    }, [dataset]);
    
    return (
        <div className="w-full h-[300px]">
            <TooltipProvider>
              <ChartContainer config={{}} className="h-full w-full">
                  <ResponsiveContainer>
                      <BarChart
                        data={missingData}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                      >
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                          <XAxis type="number" domain={[0, 100]} label={{ value: 'Percentage Missing', position: 'insideBottom', offset: -5 }}/>
                          <YAxis 
                              dataKey="name" 
                              type="category" 
                              tickLine={false}
                              axisLine={false}
                              tick={<CustomYAxisTick metadata={metadata} />}
                              interval={0}
                              width={120}
                          />
                          <Tooltip
                              cursor={{fill: 'hsl(var(--accent))'}}
                              content={<ChartTooltipContent formatter={(value) => `${(value as number).toFixed(2)}%`} />}
                          />
                          <Bar dataKey="Missing (%)" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                      </BarChart>
                  </ResponsiveContainer>
              </ChartContainer>
            </TooltipProvider>
        </div>
    );
}
