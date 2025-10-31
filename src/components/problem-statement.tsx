
'use client';

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "./ui/button";
import { useState } from "react";
import { ChevronDown, BookOpen } from "lucide-react";
import { DatasetMetadata } from "@/lib/types";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { datasetImageMap } from "@/lib/placeholder-images";
import { Card, CardContent } from "./ui/card";

interface ProblemStatementProps {
    metadata: DatasetMetadata | null;
    datasetName: string;
}

export function ProblemStatement({ metadata, datasetName }: ProblemStatementProps) {
    const [isOpen, setIsOpen] = useState(false);

    if (!metadata) {
        return null;
    }

    const attributes = Object.entries(metadata.attributes);
    const placeholderImage = datasetImageMap[datasetName] || datasetImageMap['california-housing'];

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mb-4">
            <Card className="overflow-hidden">
                <CardContent className="p-0">
                    <div className="grid md:grid-cols-2">
                        <div className="p-6">
                            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2 mb-2">
                                <BookOpen className="h-6 w-6" />
                                Problem Statement
                            </h2>
                            <p className="text-muted-foreground">
                                {metadata.story}
                            </p>
                            <CollapsibleTrigger asChild>
                                <Button variant="link" className="p-0 h-auto mt-4">
                                    View Dataset Attributes
                                    <ChevronDown className={cn("ml-2 h-4 w-4 transition-transform", isOpen && "rotate-180")} />
                                </Button>
                            </CollapsibleTrigger>
                        </div>
                         <div className="relative min-h-[200px] md:min-h-0">
                            <Image 
                                src={placeholderImage.imageUrl}
                                alt={placeholderImage.description}
                                fill
                                className="object-cover"
                                data-ai-hint={placeholderImage.imageHint}
                            />
                        </div>
                    </div>
                </CardContent>
                <CollapsibleContent>
                    <div className="p-6 pt-0">
                        <div className="border rounded-md max-h-60 overflow-y-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Attribute</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Type</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {attributes.map(([key, value]) => (
                                        <TableRow key={key}>
                                            <TableCell className="font-medium">{key}</TableCell>
                                            <TableCell>{value.description}</TableCell>
                                            <TableCell>{value.type}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </CollapsibleContent>
            </Card>
        </Collapsible>
    );
}
