
'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { useMemo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';

interface FeatureDistributionChartProps {
    dataset: Record<string, any>[];
    features: string[];
}

function generateHistogramData(data: number[], numBins = 20) {
    if (data.length === 0) return [];
    
    const min = Math.min(...data);
    const max = Math.max(...data);
    const binSize = (max - min) / numBins;

    const bins = Array.from({ length: numBins }, (_, i) => ({
        range: [min + i * binSize, min + (i + 1) * binSize],
        count: 0,
    }));

    data.forEach(value => {
        const binIndex = Math.min(Math.floor((value - min) / binSize), numBins - 1);
        if(bins[binIndex]) {
            bins[binIndex].count++;
        }
    });

    return bins.map(bin => ({
        name: `${bin.range[0].toFixed(2)}-${bin.range[1].toFixed(2)}`,
        value: bin.count
    }));
}


export function FeatureDistributionChart({ dataset, features }: FeatureDistributionChartProps) {
    const [selectedFeature, setSelectedFeature] = useState(features[0]);

    const histogramData = useMemo(() => {
        if (!selectedFeature) return [];
        const featureData = dataset.map(row => row[selectedFeature]).filter(val => typeof val === 'number') as number[];
        return generateHistogramData(featureData);
    }, [dataset, selectedFeature]);

    return (
        <div>
            <div className="mb-4 w-full md:w-1/4">
                <Select value={selectedFeature} onValueChange={setSelectedFeature}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a feature" />
                    </SelectTrigger>
                    <SelectContent>
                        {features.map(feature => (
                            <SelectItem key={feature} value={feature}>
                                {feature}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="w-full h-[300px]">
              <ChartContainer config={{}} className="h-full w-full">
                <BarChart data={histogramData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} interval={Math.floor(histogramData.length/10)} tick={{ fontSize: 12 }} />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="value" fill="hsl(var(--primary))" />
                </BarChart>
              </ChartContainer>
            </div>
        </div>
    );
}
