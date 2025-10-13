
'use client';

import React from 'react';
import { Card } from './ui/card';

const Node = ({ text, isLeaf, value }: { text: string, isLeaf?: boolean, value?: string }) => (
    <div className={`
        border-2 border-primary rounded-lg p-3 text-center shadow-md
        ${isLeaf ? 'bg-green-100 dark:bg-green-900/50 border-green-500' : 'bg-card'}
    `}>
        <p className="text-sm font-medium">{text}</p>
        {isLeaf && value && (
            <p className="text-lg font-bold text-primary">{value}</p>
        )}
    </div>
);

const Edge = ({ isLeft }: { isLeft: boolean }) => (
    <div className="relative flex-1">
        <div className="absolute top-1/2 left-0 w-full border-t-2 border-dashed border-muted-foreground"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
            {isLeft ? 'True' : 'False'}
        </div>
    </div>
);


export function DecisionTreeSnapshot() {
    return (
        <div className="p-4 overflow-x-auto">
            <p className="text-sm text-muted-foreground mb-4">
                This is a simplified visualization of a single decision tree from the forest. It shows how the model splits data based on feature values to arrive at a prediction.
            </p>
            <div className="flex flex-col items-center gap-4 font-sans">
                {/* Level 1 */}
                <Node text="alcohol <= 10.45" />

                {/* Edges to Level 2 */}
                <div className="flex w-full max-w-2xl">
                    <Edge isLeft />
                    <Edge isLeft={false} />
                </div>

                {/* Level 2 */}
                <div className="flex w-full max-w-2xl justify-between">
                    <Node text="volatile_acidity <= 0.395" />
                    <Node text="sulphates <= 0.62" />
                </div>
                
                {/* Edges to Level 3 */}
                <div className="flex w-full max-w-2xl">
                    {/* Left branch */}
                    <div className="w-1/2 flex">
                        <Edge isLeft />
                        <Edge isLeft={false} />
                    </div>
                    {/* Right branch */}
                    <div className="w-1/2 flex">
                        <Edge isLeft />
                        <Edge isLeft={false} />
                    </div>
                </div>

                {/* Level 3 */}
                 <div className="flex w-full max-w-2xl justify-between">
                    <div className="w-1/2 flex justify-around">
                        <Node text="Leaf" isLeaf value="Class 1" />
                        <Node text="Leaf" isLeaf value="Class 0" />
                    </div>
                     <div className="w-1/2 flex justify-around">
                        <Node text="Leaf" isLeaf value="Class 0" />
                        <Node text="Leaf" isLeaf value="Class 1" />
                    </div>
                </div>
            </div>
        </div>
    );
}

