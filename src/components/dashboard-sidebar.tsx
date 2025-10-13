'use client';

import { HelpCircle, Loader2 } from 'lucide-react';
import type { useRandomForest } from '@/hooks/use-random-forest';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { SidebarContent, SidebarFooter, SidebarHeader, SidebarGroup, SidebarGroupLabel, SidebarGroupContent } from '@/components/ui/sidebar';

type DashboardSidebarProps = ReturnType<typeof useRandomForest> & {
  datasetHeaders: string[];
};

export function DashboardSidebar({ state, actions, status, datasetHeaders }: DashboardSidebarProps) {
  return (
    <>
      <SidebarHeader className="border-b">
        <h2 className="text-lg font-semibold">Controls</h2>
      </SidebarHeader>
      <SidebarContent className="p-0">
        <TooltipProvider>
          <SidebarGroup>
            <SidebarGroupLabel>Task Selection</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="flex items-center space-x-2">
                <RadioGroup
                  value={state.task}
                  onValueChange={(value) => actions.setTask(value as 'regression' | 'classification')}
                  className="flex"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="regression" id="r1" />
                    <Label htmlFor="r1">Regression</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="classification" id="r2" />
                    <Label htmlFor="r2">Classification</Label>
                  </div>
                </RadioGroup>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Regression predicts a continuous value (e.g., price).<br />Classification predicts a category (e.g., old/new).</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Data</SidebarGroupLabel>
            <SidebarGroupContent className="space-y-4">
                <div>
                    <Label>Target Column</Label>
                    <Select value={state.targetColumn} onValueChange={actions.setTargetColumn}>
                        <SelectTrigger><SelectValue placeholder="Select target..." /></SelectTrigger>
                        <SelectContent>
                        {datasetHeaders.map(header => (
                            <SelectItem key={header} value={header}>{header}</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label>Feature Columns</Label>
                     <Select value={state.selectedFeatures.join(',')} onValueChange={(value) => actions.setSelectedFeatures(value.split(','))}>
                        <SelectTrigger><SelectValue placeholder="Select features..." /></SelectTrigger>
                        <SelectContent>
                           <p className="px-2 py-1.5 text-xs text-muted-foreground">Multiple feature selection is not yet supported.</p>
                           {datasetHeaders.filter(h => h !== state.targetColumn).map(header => (
                            <SelectItem key={header} value={header}>{header}</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                </div>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Hyperparameters</SidebarGroupLabel>
            <SidebarGroupContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Number of Trees</Label>
                  <span className="text-sm text-muted-foreground">{state.hyperparameters.n_estimators}</span>
                </div>
                <Slider
                  value={[state.hyperparameters.n_estimators]}
                  onValueChange={([value]) => actions.setHyperparameters({ n_estimators: value })}
                  min={10} max={500} step={10}
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Max Depth</Label>
                  <span className="text-sm text-muted-foreground">{state.hyperparameters.max_depth || 'None'}</span>
                </div>
                <Slider
                  value={[state.hyperparameters.max_depth]}
                  onValueChange={([value]) => actions.setHyperparameters({ max_depth: value })}
                  min={1} max={50} step={1}
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Min Samples Split</Label>
                  <span className="text-sm text-muted-foreground">{state.hyperparameters.min_samples_split}</span>
                </div>
                <Slider
                  value={[state.hyperparameters.min_samples_split]}
                  onValueChange={([value]) => actions.setHyperparameters({ min_samples_split: value })}
                  min={2} max={20} step={1}
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Min Samples Leaf</Label>
                  <span className="text-sm text-muted-foreground">{state.hyperparameters.min_samples_leaf}</span>
                </div>
                <Slider
                  value={[state.hyperparameters.min_samples_leaf]}
                  onValueChange={([value]) => actions.setHyperparameters({ min_samples_leaf: value })}
                  min={1} max={20} step={1}
                />
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        </TooltipProvider>
      </SidebarContent>
      <SidebarFooter className="border-t p-2">
        <Button onClick={actions.trainModel} disabled={status === 'loading'}>
          {status === 'loading' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {status === 'loading' ? 'Training...' : 'Train Model'}
        </Button>
      </SidebarFooter>
    </>
  );
}
