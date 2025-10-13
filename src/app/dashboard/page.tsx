'use client';

import { BarChart3, Target, PanelLeft, LineChart, BeakerIcon, AreaChart, Lightbulb, GitMerge, BrainCircuit, Activity, TestTube2 } from 'lucide-react';
import { useRandomForest } from '@/hooks/use-random-forest';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    if (status === 'idle' && !data.baselineMetrics) {
      return (
        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
          <div className="flex flex-col items-center gap-2 text-center">
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

    if (isLoading && !data.metrics && !data.baselineMetrics) {
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
    
    return (
      <Tabs defaultValue="dashboard">
        <div className="flex items-center">
          <TabsList>
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
                                {hasBaseline && (
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
                    </CardHeader>
                    <CardContent>
                      <ChartContainer config={{}} className="h-auto w-full">
                        <SummaryStatistics dataset={data.dataset} task={state.task} targetColumn={state.targetColumn} />
                      </ChartContainer>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Missing Values</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <MissingValuesChart dataset={data.dataset} />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Feature Distributions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer config={{}} className="h-auto w-full">
                        <FeatureDistributionChart 
                          dataset={data.dataset} 
                          features={state.selectedFeatures} 
                        />
                      </ChartContainer>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Correlation Heatmap</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer config={{}} className="h-auto w-full">
                        <CorrelationHeatmap dataset={data.dataset} />
                      </ChartContainer>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Pair Plot</CardTitle>
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
                    </CardHeader>
                    <CardContent>
                        <PartialDependencePlot
                            dataset={data.dataset}
                            features={state.selectedFeatures}
                            task={state.task}
                        />
                    </CardContent>
                </Card>
                 <Card className='lg:col-span-2'>
                    <CardHeader>
                        <CardTitle className='flex items-center gap-2'><GitMerge className='w-5 h-5' />Decision Tree Snapshot</CardTitle>
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
                        </CardHeader>
                        <CardContent>
                           <ResidualPlot data={data.chartData} />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className='flex items-center gap-2'><BarChart3 className='w-5 h-5' />Prediction Error Histogram</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <PredictionErrorHistogram data={data.chartData} />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className='flex items-center gap-2'><AreaChart className='w-5 h-5' />Cumulative Error Chart</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CumulativeErrorChart data={data.chartData} />
                        </CardContent>
                    </Card>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className='flex items-center gap-2'><Activity className='w-5 h-5' />ROC Curve</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <RocCurveChart />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className='flex items-center gap-2'><Target className='w-5 h-5' />Precision-Recall Curve</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <PrecisionRecallCurveChart />
                        </CardContent>
                    </Card>
                </div>
            )}
        </TabsContent>
        <TabsContent value="prediction" className="py-4">
            <RealTimePrediction 
                features={state.selectedFeatures} 
                taskType={state.task} 
                isLoading={isLoading} 
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
