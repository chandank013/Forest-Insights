import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { ArrowUp, ArrowDown, Minus, HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface KpiCardProps {
  title: string;
  value?: string | number | null;
  baselineValue?: string | number | null;
  icon: React.ReactNode;
  isInsight?: boolean;
  isLoading?: boolean;
  cardClassName?: string;
  tooltipDescription?: string;
}

export function KpiCard({ title, value, baselineValue, icon, isInsight = false, isLoading = false, cardClassName, tooltipDescription }: KpiCardProps) {
    const numericValue = typeof value === 'string' ? parseFloat(value) : value;
    const numericBaseline = typeof baselineValue === 'string' ? parseFloat(baselineValue) : baselineValue;

    let comparisonIndicator = null;
    let difference = null;
    if (numericValue != null && numericBaseline != null && !isInsight) {
        const diff = numericValue - numericBaseline;
        difference = Math.abs(diff).toFixed(3);
        if (diff > 0) {
            comparisonIndicator = <ArrowUp className="h-4 w-4 text-green-500" />;
        } else if (diff < 0) {
            comparisonIndicator = <ArrowDown className="h-4 w-4 text-red-500" />;
        } else {
             comparisonIndicator = <Minus className="h-4 w-4 text-muted-foreground" />;
        }
    }
    
    const TitleComponent = (
        <CardTitle className="text-sm font-medium flex items-center gap-2">
            {title}
            {tooltipDescription && (
                <Tooltip>
                    <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                        <p>{tooltipDescription}</p>
                    </TooltipContent>
                </Tooltip>
            )}
        </CardTitle>
    )

  return (
    <Card className={cn(cardClassName)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        {TitleComponent}
        {icon}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className={isInsight ? 'h-16 w-full' : 'h-8 w-24'} />
        ) : isInsight ? (
          <p className="text-xs text-muted-foreground h-16 overflow-y-auto">{value || 'Not available'}</p>
        ) : (
          <div>
            <div className="text-2xl font-bold">{value ?? 'N/A'}</div>
            {baselineValue != null && (
                <div className="text-xs text-muted-foreground">
                    Baseline: {baselineValue}
                </div>
            )}
            {comparisonIndicator && difference && (
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                    {comparisonIndicator}
                    <span>{difference} vs. baseline</span>
                </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
