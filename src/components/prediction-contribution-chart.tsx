
'use client';

import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer, Tooltip as RechartsTooltip, ReferenceLine, Cell, LabelList } from 'recharts';
import { Prediction, TaskType } from '@/lib/types';

interface PredictionContributionChartProps {
    prediction: Prediction | null;
    taskType: TaskType;
    datasetName: string;
}

const getClassificationLabels = (datasetName: string) => {
    switch (datasetName) {
        case 'wine-quality':
            return { '0': 'Bad', '1': 'Good' };
        case 'breast-cancer':
            return { '0': 'Malignant', '1': 'Benign' };
        default:
            return { '0': 'Class 0', '1': 'Class 1' };
    }
};

const COLORS = ['hsl(var(--chart-2))', 'hsl(var(--chart-1))'];


export function PredictionContributionChart({ prediction, taskType, datasetName }: PredictionContributionChartProps) {
    if (!prediction || !prediction.individualPredictions) {
        return <div className="text-center text-muted-foreground">No data available for chart.</div>;
    }

    if (taskType === 'regression') {
        const chartData = prediction.individualPredictions.map((p, i) => ({
            name: `Tree ${i + 1}`,
            prediction: p
        }));

        return (
            <div className="h-[200px] w-full">
                <ResponsiveContainer>
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: -10, bottom: 5 }}>
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                        <YAxis tick={{ fontSize: 10 }} />
                        <RechartsTooltip
                            cursor={{ fill: 'hsl(var(--accent))' }}
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--background))', 
                              border: '1px solid hsl(var(--border))',
                              borderRadius: 'var(--radius)'
                            }}
                            formatter={(value: number) => [value.toFixed(3), 'Prediction']}
                        />
                        <Bar dataKey="prediction" fill="hsl(var(--primary))">
                           <LabelList dataKey="prediction" position="top" formatter={(value: number) => value.toFixed(2)} />
                        </Bar>
                        <ReferenceLine y={prediction.prediction} stroke="hsl(var(--destructive))" strokeDasharray="3 3" label={{ value: 'Avg', position: 'right', fontSize: 12 }} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        );
    }

    // Classification
    const classLabels = getClassificationLabels(datasetName);
    const votes: { [key: string]: number } = {};
    Object.keys(classLabels).forEach(key => votes[key] = 0);
    
    prediction.individualPredictions.forEach(p => {
        const key = p.toString();
        if (key in votes) {
            votes[key]++;
        }
    });
    
    const voteData = Object.keys(votes).map(key => ({
        name: classLabels[key as keyof typeof classLabels],
        votes: votes[key]
    }));

    return (
        <div className="h-[120px] w-full">
            <ResponsiveContainer>
                <BarChart data={voteData} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                    <XAxis type="number" tick={{ fontSize: 10 }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={80} />
                    <RechartsTooltip
                        cursor={{ fill: 'hsl(var(--accent))' }}
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--background))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: 'var(--radius)'
                        }}
                    />
                    <Bar dataKey="votes" fill="hsl(var(--primary))" name="Tree Votes">
                        <LabelList dataKey="votes" position="right" style={{ fill: "hsl(var(--foreground))" }} />
                        {voteData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
