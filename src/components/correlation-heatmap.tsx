
'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useMemo } from "react";
import type { TaskType } from "@/lib/types";

interface CorrelationHeatmapProps {
    dataset: Record<string, any>[];
    task: TaskType;
    targetColumn: string;
}

function calculateCorrelationMatrix(dataset: Record<string, any>[], task: TaskType, targetColumn: string) {
    const keys = Object.keys(dataset[0] || {});
    
    const numericKeys = keys.filter(key => {
        const isTargetAndClassification = task === 'classification' && key === targetColumn;
        return typeof dataset[0][key] === 'number' && !isTargetAndClassification;
    });
    
    const n = dataset.length;

    const means = numericKeys.reduce((acc, key) => {
        acc[key] = dataset.reduce((sum, row) => sum + row[key], 0) / n;
        return acc;
    }, {} as Record<string, number>);

    const stdDevs = numericKeys.reduce((acc, key) => {
        const mean = means[key];
        acc[key] = Math.sqrt(dataset.reduce((sum, row) => sum + Math.pow(row[key] - mean, 2), 0) / (n - 1));
        return acc;
    }, {} as Record<string, number>);

    const matrix: Record<string, Record<string, number>> = {};

    for (let i = 0; i < numericKeys.length; i++) {
        const key1 = numericKeys[i];
        matrix[key1] = {};
        for (let j = 0; j < numericKeys.length; j++) {
            const key2 = numericKeys[j];
            if (i === j) {
                matrix[key1][key2] = 1;
                continue;
            }
            if (matrix[key2] && typeof matrix[key2][key1] !== 'undefined') {
                matrix[key1][key2] = matrix[key2][key1];
                continue;
            }

            const mean1 = means[key1];
            const mean2 = means[key2];
            const stdDev1 = stdDevs[key1];
            const stdDev2 = stdDevs[key2];

            if (stdDev1 === 0 || stdDev2 === 0) {
                matrix[key1][key2] = 0;
                continue;
            }

            const covariance = dataset.reduce((sum, row) => sum + (row[key1] - mean1) * (row[key2] - mean2), 0) / (n - 1);
            const correlation = covariance / (stdDev1 * stdDev2);
            matrix[key1][key2] = correlation;
        }
    }
    return matrix;
}

function getColor(value: number) {
  const R = value > 0 ? 255 : 255 - (-value * 255);
  const G = value < 0 ? 255 : 255 - (value * 255);
  const B = 255 - (Math.abs(value) * 255);
  const alpha = Math.abs(value) * 0.7 + 0.3;
  return `rgba(${R}, ${G}, ${B}, ${alpha})`;
}

export function CorrelationHeatmap({ dataset, task, targetColumn }: CorrelationHeatmapProps) {
    const correlationMatrix = useMemo(() => calculateCorrelationMatrix(dataset, task, targetColumn), [dataset, task, targetColumn]);
    const headers = Object.keys(correlationMatrix);

    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="min-w-[100px]"></TableHead>
                        {headers.map(header => (
                            <TableHead key={header} className="text-center transform -rotate-45 h-32">
                                {header}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {headers.map(rowHeader => (
                        <TableRow key={rowHeader}>
                            <TableHead>{rowHeader}</TableHead>
                            {headers.map(colHeader => (
                                <TableCell
                                    key={`${rowHeader}-${colHeader}`}
                                    className="text-center font-medium"
                                    style={{
                                        backgroundColor: getColor(correlationMatrix[rowHeader][colHeader]),
                                        color: Math.abs(correlationMatrix[rowHeader][colHeader]) > 0.5 ? 'white' : 'black'
                                    }}
                                >
                                    {correlationMatrix[rowHeader][colHeader].toFixed(2)}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
