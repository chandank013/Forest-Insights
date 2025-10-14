'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { useMemo } from "react";

interface MissingValuesChartProps {
    dataset: Record<string, any>[];
}

export function MissingValuesChart({ dataset }: MissingValuesChartProps) {
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
            <ChartContainer config={{}} className="h-full w-full">
                <ResponsiveContainer>
                    <BarChart
                      data={missingData}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" domain={[0, 100]} label={{ value: 'Percentage Missing', position: 'insideBottom', offset: -5 }}/>
                        <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} />
                        <Tooltip
                            cursor={{fill: 'hsl(var(--accent))'}}
                            content={<ChartTooltipContent formatter={(value) => `${(value as number).toFixed(2)}%`} />}
                        />
                        <Bar dataKey="Missing (%)" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </ChartContainer>
        </div>
    );
}
