'use client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TaskType } from "@/lib/types";
import { useMemo } from "react";

interface SummaryStatisticsProps {
    dataset: Record<string, any>[];
    task: TaskType;
    targetColumn: string;
}

function calculateNumericStats(data: number[]) {
    const n = data.length;
    if (n === 0) return { mean: 0, median: 0, std: 0, min: 0, max: 0 };

    const sorted = [...data].sort((a, b) => a - b);
    const sum = data.reduce((acc, val) => acc + val, 0);
    const mean = sum / n;
    const mid = Math.floor(n / 2);
    const median = n % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
    const std = Math.sqrt(data.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (n - 1));
    const min = sorted[0];
    const max = sorted[n - 1];
    
    return { mean, median, std, min, max };
}

function calculateClassCounts(data: any[]) {
    return data.reduce((acc, val) => {
        acc[val] = (acc[val] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
}

export function SummaryStatistics({ dataset, task, targetColumn }: SummaryStatisticsProps) {
    const stats = useMemo(() => {
        const numericFeatures = Object.keys(dataset[0] || {}).filter(key => typeof dataset[0][key] === 'number' && key !== targetColumn);
        const numericStats = numericFeatures.map(feature => {
            const data = dataset.map(row => row[feature]);
            return { feature, ...calculateNumericStats(data) };
        });

        let classCounts: Record<string, number> | null = null;
        if (task === 'classification') {
            const targetData = dataset.map(row => row[targetColumn]);
            classCounts = calculateClassCounts(targetData);
        }

        return { numericStats, classCounts };
    }, [dataset, task, targetColumn]);

    return (
        <div>
            <h3 className="font-semibold mb-2">Numeric Features</h3>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Feature</TableHead>
                        <TableHead>Mean</TableHead>
                        <TableHead>Median</TableHead>
                        <TableHead>Std. Dev.</TableHead>
                        <TableHead>Min</TableHead>
                        <TableHead>Max</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {stats.numericStats.map(stat => (
                        <TableRow key={stat.feature}>
                            <TableCell>{stat.feature}</TableCell>
                            <TableCell>{stat.mean.toFixed(2)}</TableCell>
                            <TableCell>{stat.median.toFixed(2)}</TableCell>
                            <TableCell>{stat.std.toFixed(2)}</TableCell>
                            <TableCell>{stat.min.toFixed(2)}</TableCell>
                            <TableCell>{stat.max.toFixed(2)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            
            {stats.classCounts && (
                <div className="mt-4">
                    <h3 className="font-semibold mb-2">Target Distribution (Classification)</h3>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Class</TableHead>
                                <TableHead>Count</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {Object.entries(stats.classCounts).map(([className, count]) => (
                                <TableRow key={className}>
                                    <TableCell>{className}</TableCell>
                                    <TableCell>{count}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}
