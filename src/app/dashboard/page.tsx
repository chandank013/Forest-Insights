
'use client';

import Image from 'next/image';
import { TreePine, BarChart3, Target, PanelLeft, LineChart, BeakerIcon, AreaChart, Lightbulb, GitMerge, BrainCircuit, Activity, TestTube2 } from 'lucide-react';
import { useRandomForest } from '@/hooks/use-random-forest';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Sidebar, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { KpiCard } from '@/components/kpi-card';
import { FeatureImportanceChart } from '@/components/feature-importance-chart';
import { PredictionPlot } from '@/components/prediction-plot';
import { ConfusionMatrix } from '@/components/confusion-matrix';
import { ExplainPrediction } from '@/components/explain-prediction';
import { ThemeToggle } from '@/components/theme-toggle';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Metric, RegressionMetric, ClassificationMetric } from '@/lib/types';
import { FeatureDistributionChart } from '@/components/feature-distribution-chart';
import { CorrelationHeatmap } from '@/components/correlation-heatmap';
import { SummaryStatistics } from '@/components/summary-statistics';
import { PairPlot } from '@/components/pair-plot';
import { MissingValuesChart } from '@/components/missing-values-chart';
import { PartialDependencePlot } from '@/components/partial-dependence-plot';
import { ChartContainer } from '@/components/ui/chart';
import { DecisionTreeSnapshot } from '@/components/decision-tree-snapshot';
import { ResidualPlot } from '@/components/residual-plot';
import { PredictionErrorHistogram } from '@/components/prediction-error-histogram';
import { CumulativeErrorChart } from '@/components/cumulative-error-chart';
import { RocCurveChart } from '@/components/roc-curve-chart';
import { PrecisionRecallCurveChart } from '@/components/precision-recall-curve-chart';
import { RealTimePrediction } from '@/components/real-time-prediction';


export default function DashboardPage() {
  const { state, data, status, actions } = useRandomForest();
  const isLoading = status === 'loading';

  const renderKpiCards = (
    metrics: Metric | null,
    baselineMetrics: Metric | null
  ) => {
    if (state.task === 'regression') {
      const regMetrics = metrics as RegressionMetric | null;
      const baseRegMetrics = baselineMetrics as RegressionMetric | null;
      return (
        <>
          <KpiCard
            title="R² Score"
            value={regMetrics?.r2?.toFixed(3)}
            baselineValue={baseRegMetrics?.r2?.toFixed(3)}
            icon={<Target className="size-4 text-muted-foreground" />}
            isLoading={isLoading}
          />
          <KpiCard
            title="RMSE"
            value={regMetrics?.rmse?.toFixed(3)}
            baselineValue={baseRegMetrics?.rmse?.toFixed(3)}
            icon={<LineChart className="size-4 text-muted-foreground" />}
            isLoading={isLoading}
          />
          <KpiCard
            title="MAE"
            value={regMetrics?.mae?.toFixed(3)}
            baselineValue={baseRegMetrics?.mae?.toFixed(3)}
            icon={<BeakerIcon className="size-4 text-muted-foreground" />}
            isLoading={isLoading}
          />
        </>
      );
    }
    const classMetrics = metrics as ClassificationMetric | null;
    const baseClassMetrics = baselineMetrics as ClassificationMetric | null;
    return (
      <>
        <KpiCard
          title="Accuracy"
          value={classMetrics?.accuracy?.toFixed(3)}
          baselineValue={baseClassMetrics?.accuracy?.toFixed(3)}
          icon={<Target className="size-4 text-muted-foreground" />}
          isLoading={isLoading}
        />
        <KpiCard
          title="Precision"
          value={classMetrics?.precision?.toFixed(3)}
          baselineValue={baseClassMetrics?.precision?.toFixed(3)}
          icon={<LineChart className="size-4 text-muted-foreground" />}
          isLoading={isLoading}
        />
        <KpiCard
          title="Recall"
          value={classMetrics?.recall?.toFixed(3)}
          baselineValue={baseClassMetrics?.recall?.toFixed(3)}
          icon={<BeakerIcon className="size-4 text-muted-foreground" />}
          isLoading={isLoading}
        />
      </>
    );
  };

  const renderContent = () => {
    if (status === 'idle' && !data.metrics) {
      return (
        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex items-center justify-center rounded-full bg-primary/10 p-6">
                <TreePine className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-2xl font-bold tracking-tight">Welcome to Forest Insights</h3>
            <p className="text-muted-foreground">
              Train a baseline model or adjust parameters in the sidebar to begin.
            </p>
            <Button className="mt-4" onClick={actions.trainBaselineModel}>
              Train Baseline Model
            </Button>
          </div>
        </div>
      );
    }

    if (isLoading && !data.metrics) {
        return (
          <div className="flex flex-1 items-center justify-center">
            <div className="grid w-full gap-4 md:gap-8">
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                  {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32" />)}
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7 md:gap-8">
                  <Skeleton className="lg:col-span-4 h-[300px] md:h-[400px]" />
                  <Skeleton className="lg:col-span-3 h-[300px] md:h-[400px]" />
                </div>
            </div>
          </div>
        );
    }

    const hasBaseline = data.baselineMetrics !== null;
    const isTuned = JSON.stringify(data.metrics) !== JSON.stringify(data.baselineMetrics);
    
    return (
      <Tabs defaultValue="dashboard">
        <div className="flex items-center">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="explore">Explore</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="prediction">Prediction</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="dashboard" className="py-4">
            <div className="grid w-full gap-4 md:gap-8">
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                    {renderKpiCards(data.metrics, data.baselineMetrics)}
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7 md:gap-8">
                    <Card className="lg:col-span-4">
                        <CardHeader>
                          <CardTitle>Feature Importance</CardTitle>
                          <CardDescription>This chart shows the relative importance of each feature in predicting the target variable.</CardDescription>
                        </CardHeader>
                        <CardContent className="pl-2">
                        {isLoading && !data.featureImportance.length ? (
                            <Skeleton className="h-[250px] md:h-[350px]" />
                        ) : (
                            <FeatureImportanceChart 
                                tunedData={data.featureImportance}
                                baselineData={data.baselineFeatureImportance}
                            />
                        )}
                        </CardContent>
                    </Card>
                    <Card className="lg:col-span-3">
                         <CardHeader>
                            <CardTitle>
                                {state.task === 'regression' ? 'Prediction vs. Actual' : 'Confusion Matrix'}
                            </CardTitle>
                            <CardDescription>
                                {state.task === 'regression'
                                ? "This plot compares the model's predictions against the actual values."
                                : "This table shows the performance of the classification model."}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pl-2">
                        {isLoading && (!data.chartData && !data.metrics) ? (
                            <Skeleton className="h-[250px] md:h-[350px]" />
                        ) : state.task === 'regression' ? (
                            <PredictionPlot 
                                tunedData={data.chartData}
                                baselineData={data.baselineChartData}
                             />
                        ) : (
                            <Tabs defaultValue="tuned" className="w-full">
                                {hasBaseline && isTuned && (
                                    <TabsList className="grid w-full grid-cols-2 mb-4">
                                        <TabsTrigger value="tuned">Tuned</TabsTrigger>
                                        <TabsTrigger value="baseline">Baseline</TabsTrigger>
                                    </TabsList>
                                )}
                                <TabsContent value="tuned">
                                    <ConfusionMatrix data={(data.metrics as ClassificationMetric)?.confusionMatrix} />
                                </TabsContent>
                                <TabsContent value="baseline">
                                    <ConfusionMatrix data={(data.baselineMetrics as ClassificationMetric)?.confusionMatrix} />
                                </TabsContent>
                            </Tabs>
                        )}
                        </CardContent>
                    </Card>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7 md:gap-8">
                  <KpiCard
                      cardClassName='lg:col-span-4'
                      title="Feature Importance Insights"
                      value={data.insights}
                      isInsight
                      icon={<Lightbulb className="size-4 text-muted-foreground" />}
                      isLoading={isLoading && !data.insights}
                  />
                  <ExplainPrediction
                      cardClassName='lg:col-span-3'
                      prediction={data.history[0]}
                      featureNames={state.selectedFeatures}
                      taskType={state.task}
                      isLoading={isLoading}
                  />
                </div>
            </div>
        </TabsContent>
        <TabsContent value="explore" className="py-4">
             <div className="grid grid-cols-1 gap-4 md:gap-8">
                 <Card>
                    <CardHeader>
                        <CardTitle>Summary Statistics</CardTitle>
                        <CardDescription>A summary of basic statistics for each numeric feature in the dataset.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <SummaryStatistics dataset={data.dataset} task={state.task} targetColumn={state.targetColumn} />
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Missing Values</CardTitle>
                        <CardDescription>The percentage of missing values for each feature.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <MissingValuesChart dataset={data.dataset} />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Feature Distributions</CardTitle>
                        <CardDescription>The distribution of values for a selected feature.</CardDescription>
                    </CardHeader>
                     <CardContent>
                        <FeatureDistributionChart 
                          dataset={data.dataset} 
                          features={state.selectedFeatures} 
                        />
                    </CardContent>
                </Card>
                <div className="mb-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Correlation Heatmap</CardTitle>
                            <CardDescription>A heatmap showing the correlation between numeric features.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <CorrelationHeatmap dataset={data.dataset} task={state.task} targetColumn={state.targetColumn} />
                        </CardContent>
                    </Card>
                </div>
                 <Card>
                    <CardHeader>
                        <CardTitle>Pair Plot</CardTitle>
                        <CardDescription>Scatter plots for pairs of features to visualize their relationships.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <PairPlot dataset={data.dataset} targetColumn={state.targetColumn} task={state.task} />
                    </CardContent>
                </Card>
             </div>
        </TabsContent>
        <TabsContent value="insights" className="py-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
                <Card className='lg:col-span-2'>
                    <CardHeader>
                        <CardTitle className='flex items-center gap-2'><Lightbulb className='w-5 h-5' />Partial Dependence Plot</CardTitle>
                        <CardDescription>Shows the marginal effect of a feature on the predicted outcome of a machine learning model.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <PartialDependencePlot
                            dataset={data.dataset}
                            features={state.selectedFeatures}
                            task={state.task}
                            pdpData={data.pdpData}
                        />
                    </CardContent>
                </Card>
                 <Card className='lg:col-span-2'>
                    <CardHeader>
                        <CardTitle className='flex items-center gap-2'><GitMerge className='w-5 h-5' />Decision Tree Snapshot</CardTitle>
                        <CardDescription>A visualization of a single decision tree from the forest, showing how splits are made.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <DecisionTreeSnapshot tree={data.decisionTree} />
                    </CardContent>
                </Card>
            </div>
        </TabsContent>
        <TabsContent value="performance" className="py-4">
            {state.task === 'regression' ? (
                <div className="grid grid-cols-1 gap-4 md:gap-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className='flex items-center gap-2'><Activity className='w-5 h-5' />Residual Plot</CardTitle>
                            <CardDescription>Plots the residuals (prediction errors) against the predicted values to check for patterns.</CardDescription>
                        </CardHeader>
                        <CardContent>
                           <ResidualPlot data={data.chartData} />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className='flex items-center gap-2'><BarChart3 className='w-5 h-5' />Prediction Error Histogram</CardTitle>
                             <CardDescription>A histogram of the prediction errors, showing their distribution.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <PredictionErrorHistogram data={data.chartData} />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className='flex items-center gap-2'><AreaChart className='w-5 h-5' />Cumulative Error Chart</CardTitle>
                            <CardDescription>Shows the percentage of predictions within a certain error margin.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <CumulativeErrorChart data={data.chartData} />
                        </CardContent>
                    </card>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className='flex items-center gap-2'><Activity className='w-5 h-5' />ROC Curve</CardTitle>
                            <CardDescription>A graph showing the performance of a classification model at all classification thresholds.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <RocCurveChart data={data.rocCurveData} />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className='flex items-center gap-2'><Target className='w-5 h-5' />Precision-Recall Curve</CardTitle>                            
                            <CardDescription>Shows the tradeoff between precision and recall for different thresholds.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <PrecisionRecallCurveChart data={data.prCurveData} />
                        </CardContent>
                    </Card>
                </div>
            )}
        </TabsContent>
        <TabsContent value="prediction" className="py-4">
            <RealTimePrediction 
                features={state.selectedFeatures} 
                taskType={state.task} 
                isLoading={isLoading || !data.metrics}
                onPredict={actions.predict}
            />
        </TabsContent>
      </Tabs>
    );
  };

  return (
    <>
      <Sidebar collapsible="icon" side="left" variant="inset">
        <DashboardSidebar
          state={state}
          actions={actions}
          status={status}
          datasetHeaders={Object.keys(data.dataset?.[0] ?? {})}
        />
      </Sidebar>
      <SidebarInset className="flex flex-col">
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 mb-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="md:hidden">
              <PanelLeft />
            </SidebarTrigger>
            <h1 className="text-2xl font-semibold">Forest Insights</h1>
          </div>
          <ThemeToggle />
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 pt-0 sm:px-6 sm:py-0 md:gap-8">
          {renderContent()}
        </main>
      </SidebarInset>
    </>
  );
}
