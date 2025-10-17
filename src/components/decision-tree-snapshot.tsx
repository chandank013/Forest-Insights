
'use client';

import React, { useState, useRef } from 'react';
import type { DecisionTree, DecisionNode, LeafNode, TaskType } from '@/lib/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut } from 'lucide-react';

interface NodeDisplayProps {
    node: DecisionNode | LeafNode;
    taskType: TaskType;
}

const NodeDescription: React.FC<NodeDisplayProps> = ({ node, taskType }) => {
    const isLeaf = node.type === 'leaf';

    if (taskType === 'regression') {
        return (
            <div className='space-y-1 text-xs'>
                {isLeaf ? (
                    <p>This is a leaf node, representing a final prediction.</p>
                ) : (
                    <p>This node splits the data based on the feature <span className='font-semibold'>{(node as DecisionNode).feature}</span>.</p>
                )}
                <p>Average predicted value: <span className='font-semibold'>{node.value[0].toFixed(2)}</span></p>
                {!isLeaf && <p>MSE (impurity): <span className='font-semibold'>{(node as DecisionNode).impurity.toFixed(2)}</span></p>}
                <p>Samples in this node: <span className='font-semibold'>{node.samples}</span></p>
            </div>
        );
    }

    // Classification
    const totalSamples = node.value.reduce((a, b) => a + b, 0);
    const majorityClass = node.value.indexOf(Math.max(...node.value));
    
    return (
        <div className='space-y-1 text-xs'>
            {isLeaf ? (
                <p>This leaf node predicts <span className='font-semibold'>Class {majorityClass}</span>.</p>
            ) : (
                <p>This node splits data on <span className='font-semibold'>{(node as DecisionNode).feature}</span> to reduce impurity.</p>
            )}
            <p>Class distribution: <span className='font-semibold'>[{node.value.join(', ')}]</span></p>
            {!isLeaf && <p>{(node as DecisionNode).criterion} (impurity): <span className='font-semibold'>{(node as DecisionNode).impurity.toFixed(2)}</span></p>}
            <p>Total samples in node: <span className='font-semibold'>{totalSamples}</span></p>
        </div>
    );
};

const NodeDisplay: React.FC<NodeDisplayProps> = ({ node, taskType }) => {
    const isLeaf = node.type === 'leaf';

    const getRegressionDisplay = (n: DecisionNode | LeafNode) => {
        const value = `Value: ${n.value[0].toFixed(2)}`;
        if (isLeaf) return value;
        const criterion = `MSE: ${(n as DecisionNode).impurity.toFixed(2)}`;
        return `${criterion}\n${value}`;
    };

    const getClassificationDisplay = (n: DecisionNode | LeafNode) => {
        const values = `Samples: [${n.value.join(', ')}]`;
        if (isLeaf) return `Class: ${n.value.indexOf(Math.max(...n.value))}\n${values}`;
        const criterion = `${(n as DecisionNode).criterion}: ${(n as DecisionNode).impurity.toFixed(2)}`;
        return `${criterion}\n${values}`;
    };

    const text = isLeaf ? '' : `${(node as DecisionNode).feature} <= ${'threshold' in node ? (node as DecisionNode).threshold.toFixed(2) : ''}`;
    const samples = `Total Samples: ${node.samples}`;
    const valueDisplay = taskType === 'regression' ? getRegressionDisplay(node) : getClassificationDisplay(node);
    
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <div className={`
                    border-2 border-primary rounded-lg p-3 text-center shadow-md w-48 cursor-help
                    ${isLeaf ? 'bg-green-100 dark:bg-green-900/50 border-green-500' : 'bg-card'}
                `}>
                    {text && <p className="text-sm font-medium">{text}</p>}
                    <p className="text-xs text-muted-foreground whitespace-pre-line">{valueDisplay}</p>
                    <p className="text-xs text-muted-foreground">{samples}</p>
                </div>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
                <NodeDescription node={node} taskType={taskType} />
            </TooltipContent>
        </Tooltip>
    );
};

const Edge = ({ isLeft }: { isLeft: boolean }) => (
    <div className="relative flex-1 pt-12">
        <svg
            className="absolute top-0 left-0 w-full h-full"
            preserveAspectRatio="none"
            viewBox="0 0 100 100"
        >
            <path
                d={isLeft ? "M 100 0 L 50 50 L 50 100" : "M 0 0 L 50 50 L 50 100"}
                stroke="hsl(var(--muted-foreground))"
                strokeWidth="2"
                fill="none"
                strokeDasharray="4 2"
            />
            <path 
                d="M 46 95 L 50 100 L 54 95" 
                stroke="hsl(var(--muted-foreground))"
                strokeWidth="2"
                fill="none"
            />
        </svg>
         <div className="absolute top-10 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground z-10">
            {isLeft ? 'True' : 'False'}
        </div>
    </div>
);

interface TreeBranchProps {
    node: DecisionNode;
    taskType: TaskType;
}

const TreeBranch: React.FC<TreeBranchProps> = ({ node, taskType }) => {
    return (
        <div className="flex flex-col items-center">
            <NodeDisplay node={node} taskType={taskType} />
            {node.children && (
                <>
                    <div className="flex w-full">
                        <Edge isLeft />
                        <Edge isLeft={false} />
                    </div>
                    <div className="flex w-full justify-around">
                        {node.children.map((child, index) => (
                            <div key={index} className="flex flex-col items-center">
                                {child.type === 'node'
                                    ? <TreeBranch node={child as DecisionNode} taskType={taskType} />
                                    : <NodeDisplay node={child} taskType={taskType} />
                                }
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export function DecisionTreeSnapshot({ tree, taskType }: { tree: DecisionTree | null, taskType: TaskType }) {
    const [zoom, setZoom] = useState(1);
    const ZOOM_STEP = 0.25;

     if (!tree) {
        return (
            <div className="flex items-center justify-center h-full text-muted-foreground">
                Train a model to see a decision tree snapshot.
            </div>
        );
    }
    
    return (
        <div className="relative w-full h-full overflow-auto font-sans">
            <TooltipProvider>
                <div 
                    className="min-w-[1200px] p-8 transition-transform duration-300"
                    style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
                >
                    {tree.type === 'node'
                        ? <TreeBranch node={tree as DecisionNode} taskType={taskType} />
                        : <NodeDisplay node={tree} taskType={taskType} />
                    }
                </div>
            </TooltipProvider>

            <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => setZoom(z => Math.max(0.25, z - ZOOM_STEP))}>
                    <ZoomOut className="h-4 w-4" />
                    <span className="sr-only">Zoom Out</span>
                </Button>
                <div className="bg-background/80 text-sm font-medium px-3 py-1.5 rounded-md border">
                    {Math.round(zoom * 100)}%
                </div>
                <Button variant="outline" size="icon" onClick={() => setZoom(z => Math.min(2, z + ZOOM_STEP))}>
                    <ZoomIn className="h-4 w-4" />
                    <span className="sr-only">Zoom In</span>
                </Button>
            </div>
        </div>
    );
}

