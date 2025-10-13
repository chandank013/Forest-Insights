'use client';

import { HelpCircle, Loader2 } from 'lucide-react';
import type { useRandomForest } from '@/hooks/use-random-forest';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { SidebarContent, SidebarFooter, SidebarHeader, SidebarGroup, SidebarGroupLabel, SidebarGroupContent } from '@/components/ui/sidebar';

type DashboardSidebarProps = ReturnType<typeof useRandomForest> & {
  datasetHeaders: string[];
};

export function DashboardSidebar({ state, actions, status, datasetHeaders }: DashboardSidebarProps) {
  const { hyperparameters, task } = state;
  const { setHyperparameters } = actions;

  const HelpTooltip = ({ children }: { children: React.ReactNode }) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
      </TooltipTrigger>
      <TooltipContent side="right" className="max-w-xs">
        {children}
      </TooltipContent>
    </Tooltip>
  );

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
                  value={task}
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
                <HelpTooltip>
                  <p><b>Regression</b> predicts a continuous value (e.g., price).<br /><b>Classification</b> predicts a category (e.g., good/bad quality).</p>
                </HelpTooltip>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Data</SidebarGroupLabel>
            <SidebarGroupContent className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Label>Target Column</Label>
                    <HelpTooltip>
                      <p>The column the model will try to predict.</p>
                    </HelpTooltip>
                  </div>
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
                  <div className="flex items-center gap-2">
                    <Label>Feature Columns</Label>
                     <HelpTooltip>
                      <p>These columns are used as input for the model to make its prediction.</p>
                    </HelpTooltip>
                  </div>
                  <p className="text-sm text-muted-foreground">All columns except the target are used as features.</p>
                </div>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Hyperparameters</SidebarGroupLabel>
            <SidebarGroupContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <div className="flex items-center gap-2">
                    <Label>Number of Trees</Label>
                    <HelpTooltip>The number of decision trees in the forest. More trees can lead to a more accurate model, but will take longer to train.</HelpTooltip>
                  </div>
                  <span className="text-sm text-muted-foreground">{hyperparameters.n_estimators}</span>
                </div>
                <Slider
                  value={[hyperparameters.n_estimators]}
                  onValueChange={([value]) => setHyperparameters({ n_estimators: value })}
                  min={10} max={500} step={10}
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <div className="flex items-center gap-2">
                    <Label>Max Depth</Label>
                     <HelpTooltip>The maximum depth of each decision tree. A deeper tree can capture more complex patterns but may overfit.</HelpTooltip>
                  </div>
                  <span className="text-sm text-muted-foreground">{hyperparameters.max_depth || 'None'}</span>
                </div>
                <Slider
                  value={[hyperparameters.max_depth]}
                  onValueChange={([value]) => setHyperparameters({ max_depth: value })}
                  min={1} max={50} step={1}
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                   <div className="flex items-center gap-2">
                    <Label>Min Samples Split</Label>
                    <HelpTooltip>The minimum number of samples required to split an internal node.</HelpTooltip>
                  </div>
                  <span className="text-sm text-muted-foreground">{hyperparameters.min_samples_split}</span>
                </div>
                <Slider
                  value={[hyperparameters.min_samples_split]}
                  onValueChange={([value]) => setHyperparameters({ min_samples_split: value })}
                  min={2} max={20} step={1}
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                   <div className="flex items-center gap-2">
                    <Label>Min Samples Leaf</Label>
                    <HelpTooltip>The minimum number of samples required to be at a leaf node.</HelpTooltip>
                  </div>
                  <span className="text-sm text-muted-foreground">{hyperparameters.min_samples_leaf}</span>
                </div>
                <Slider
                  value={[hyperparameters.min_samples_leaf]}
                  onValueChange={([value]) => setHyperparameters({ min_samples_leaf: value })}
                  min={1} max={20} step={1}
                />
              </div>
               <div className="space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  <Label>Max Features</Label>
                  <HelpTooltip>The number of features to consider when looking for the best split.</HelpTooltip>
                </div>
                <Select
                    value={hyperparameters.max_features ?? 'null'}
                    onValueChange={(value) => setHyperparameters({ max_features: value === 'null' ? null : (value as 'sqrt' | 'log2') })}
                >
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="sqrt">Square Root</SelectItem>
                        <SelectItem value="log2">Log2</SelectItem>
                        <SelectItem value="null">None (All Features)</SelectItem>
                    </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                  <Label>Bootstrap Samples</Label>
                   <HelpTooltip>Whether bootstrap samples are used when building trees. If False, the whole dataset is used to build each tree.</HelpTooltip>
                </div>
                <Switch
                  checked={hyperparameters.bootstrap}
                  onCheckedChange={(checked) => setHyperparameters({ bootstrap: checked })}
                />
              </div>

              {task === 'regression' && (
                <div className="space-y-2">
                  <div className="flex justify-between">
                     <div className="flex items-center gap-2">
                      <Label>Min Impurity Decrease</Label>
                       <HelpTooltip>A node will be split if this split induces a decrease of the impurity greater than or equal to this value.</HelpTooltip>
                    </div>
                    <span className="text-sm text-muted-foreground">{hyperparameters.min_impurity_decrease.toFixed(2)}</span>
                  </div>
                  <Slider
                    value={[hyperparameters.min_impurity_decrease]}
                    onValueChange={([value]) => setHyperparameters({ min_impurity_decrease: value })}
                    min={0} max={0.5} step={0.01}
                  />
                </div>
              )}

              {task === 'classification' && (
                <>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-1">
                          <Label>Criterion</Label>
                          <HelpTooltip>The function to measure the quality of a split. "Gini" is for Gini impurity and "Entropy" for the information gain.</HelpTooltip>
                        </div>
                        <Select
                            value={hyperparameters.criterion}
                            onValueChange={(value) => setHyperparameters({ criterion: value as 'gini' | 'entropy' })}
                        >
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="gini">Gini</SelectItem>
                                <SelectItem value="entropy">Entropy</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                       <div className="flex items-center gap-2 mb-1">
                        <Label>Class Weight</Label>
                         <HelpTooltip>Adjusts weights inversely proportional to class frequencies. "Balanced" is often a good choice for imbalanced datasets.</HelpTooltip>
                      </div>
                        <Select
                            value={hyperparameters.class_weight ?? 'null'}
                            onValueChange={(value) => setHyperparameters({ class_weight: value === 'null' ? null : value as 'balanced' | 'balanced_subsample' })}
                        >
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="null">None</SelectItem>
                                <SelectItem value="balanced">Balanced</SelectItem>
                                <SelectItem value="balanced_subsample">Balanced Subsample</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </>
              )}
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
