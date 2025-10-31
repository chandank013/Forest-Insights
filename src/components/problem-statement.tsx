
'use client';

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "./ui/button";
import { useState } from "react";
import { ChevronDown, BookOpen } from "lucide-react";
import { DatasetMetadata } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ProblemStatementProps {
    metadata: DatasetMetadata | null;
}

export function ProblemStatement({ metadata }: ProblemStatementProps) {
    const [isOpen, setIsOpen] = useState(false);

    if (!metadata) {
        return null;
    }

    const attributes = Object.entries(metadata.attributes);

    return (
        <Alert className="mb-4">
            <BookOpen className="h-4 w-4" />
            <AlertTitle>The Mission</AlertTitle>
            <AlertDescription>
                {metadata.story}
            </AlertDescription>
            <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mt-4">
                <CollapsibleTrigger asChild>
                    <Button variant="link" className="p-0 h-auto">
                        View Dataset Attributes
                        <ChevronDown className={cn("ml-2 h-4 w-4 transition-transform", isOpen && "rotate-180")} />
                    </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <Table className="mt-2">
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
                </CollapsibleContent>
            </Collapsible>
        </Alert>
    );
}
