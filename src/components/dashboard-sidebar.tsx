
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
import { SidebarContent, SidebarFooter, SidebarHeader, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarSeparator } from '@/components/ui/sidebar';

type DashboardSidebarProps = ReturnType<typeof useRandomForest> & {
  datasetHeaders: string[];
};

export function DashboardSidebar({ state, actions, status, datasetHeaders, availableDatasets }: DashboardSidebarProps) {
  const { hyperparameters, task, testSize } = state;
  const { setHyperparameters, setTestSize } = actions;

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
                  <p><b>Regression</b> predicts a continuous value (e.g., a house price, a patient's weight).</p>
                  <p><b>Classification</b> predicts a category (e.g., wine is 'good' or 'bad', a tumor is 'malignant' or 'benign').</p>
                </HelpTooltip>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Data Configuration</SidebarGroupLabel>
            <SidebarGroupContent className="space-y-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Label>Select Dataset</Label>
                        <HelpTooltip>Choose the dataset to train the model on. The available datasets will change based on the selected task.</HelpTooltip>
                    </div>
                    <Select value={state.datasetName} onValueChange={actions.setDataset}>
                        <SelectTrigger><SelectValue placeholder="Select dataset..." /></SelectTrigger>
                        <SelectContent>
                        {availableDatasets.map(dataset => (
                            <SelectItem key={dataset.value} value={dataset.value}>{dataset.name}</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Label>Target Column</Label>
                    <HelpTooltip>
                      <p>The variable the model is trying to predict. This is pre-set for each dataset.</p>
                      <ul className="list-disc pl-4 mt-2">
                        <li><b>Housing:</b> Median House Value</li>
                        <li><b>Wine:</b> Quality Score</li>
                        <li><b>Diabetes:</b> Disease Progression</li>
                      </ul>
                    </HelpTooltip>
                  </div>
                    <Select value={state.targetColumn} onValueChange={actions.setTargetColumn} disabled>
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
                      <p>The input variables the model uses to make predictions (e.g., for housing, this includes number of rooms, house age, etc.).</p>
                    </HelpTooltip>
                  </div>
                  <p className="text-sm text-muted-foreground">All columns except the target are used as features.</p>
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <div className="flex items-center gap-2">
                            <Label>Test Set Size</Label>
                            <HelpTooltip>The percentage of data reserved for testing the model's performance. The rest is used for training. For example, 20% means the model is tested on data it has never seen before.</HelpTooltip>
                        </div>
                        <span className="text-sm text-muted-foreground">{Math.round(testSize * 100)}%</span>
                    </div>
                    <Slider
                        value={[testSize]}
                        onValueChange={([value]) => setTestSize(value)}
                        min={0.1} max={0.5} step={0.05}
                    />
                </div>
            </SidebarGroupContent>
          </SidebarGroup>
          
          <SidebarSeparator />
          
          <div className='p-2'>
            <Button variant="outline" className="w-full" onClick={actions.trainBaselineModel} disabled={status === 'loading'}>
                {status === 'loading' ? 'Training...' : 'Train Baseline Model'}
            </Button>
          </div>

          <SidebarGroup>
            <SidebarGroupLabel>Hyperparameter Tuning</SidebarGroupLabel>
            <SidebarGroupContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <div className="flex items-center gap-2">
                    <Label>Number of Trees</Label>
                    <HelpTooltip>The number of individual decision trees in the forest. More trees can improve accuracy but increase training time. Think of it as asking more 'experts' for their opinion.</HelpTooltip>
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
                     <HelpTooltip>The maximum number of levels (or questions) each tree can have. Deeper trees can capture more complex patterns but risk 'overfitting'—memorizing the training data instead of learning general patterns.</HelpTooltip>
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
                    <HelpTooltip>The minimum number of data points required in a group before the tree is allowed to split it further. Higher values prevent the model from learning from very small, potentially noisy groups.</HelpTooltip>
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
                    <HelpTooltip>The minimum number of data points allowed in a final leaf node (a final prediction). This helps smooth the model and avoid making predictions based on just one or two examples.</HelpTooltip>
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
                  <HelpTooltip>The number of features (e.g., 'alcohol content', 'house age') to consider when looking for the best split at each node. Limiting this encourages diversity among the trees.</HelpTooltip>
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
                   <HelpTooltip>If enabled, each tree is trained on a random subsample of the data. This randomness is key to why Random Forests work well, as it prevents all trees from being identical.</HelpTooltip>
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
                       <HelpTooltip>A node will only be split if it significantly improves the model's purity (i.e., reduces prediction error). This parameter sets the threshold for what is considered a 'significant' improvement.</HelpTooltip>
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
                          <HelpTooltip>The function to measure the quality of a split. 'Gini' and 'Entropy' are two different mathematical ways to measure how 'pure' or 'mixed' a group of samples is.</HelpTooltip>
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
                         <HelpTooltip>This option is useful for imbalanced datasets (e.g., 95% 'good' wine, 5% 'bad' wine). 'Balanced' automatically gives more weight to the minority class, preventing the model from simply ignoring it.</HelpTooltip>
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
          {status === 'loading' ? 'Training...' : 'Train Tuned Model'}
        </Button>
      </SidebarFooter>
    </>
  );
}
