'use client';

import { BarChart3, Target, PanelLeft, LineChart, BeakerIcon } from 'lucide-react';
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
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                  {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)}
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7 md:gap-8">
                  <Skeleton className="lg:col-span-4 h-[300px] md:h-[400px]" />
                  <Skeleton className="lg:col-span-3 h-[300px] md:h-[400px]" />
                </div>
            </div>
          </div>
        );
    }

    const currentTabValue = (data.metrics && data.baselineMetrics) ? (data.metrics === data.baselineMetrics ? "baseline" : "tuned") : "tuned";

    return (
      <Tabs defaultValue={currentTabValue} className="grid w-full gap-4 md:gap-8">
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
            <div className="flex items-center md:col-span-2 lg:col-span-1">
                { data.baselineMetrics && (
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="baseline">Baseline</TabsTrigger>
                        <TabsTrigger value="tuned">Tuned</TabsTrigger>
                    </TabsList>
                )}
            </div>
            <div className="sm:col-span-2 md:col-span-2 lg:col-span-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
               {renderKpiCards(data.metrics, data.baselineMetrics)}
            </div>
        </div>

        <TabsContent value="tuned">
            <div className="grid gap-4 md:gap-8">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7 md:gap-8">
                    <Card className="lg:col-span-4">
                        <CardHeader>
                        <CardTitle>Feature Importance</CardTitle>
                        </CardHeader>
                        <CardContent className="pl-2">
                        {isLoading && !data.featureImportance.length ? (
                            <Skeleton className="h-[250px] md:h-[350px]" />
                        ) : (
                            <FeatureImportanceChart data={data.featureImportance} />
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
                        {isLoading && !data.chartData ? (
                            <Skeleton className="h-[250px] md:h-[350px]" />
                        ) : state.task === 'regression' ? (
                            <PredictionPlot data={data.chartData} />
                        ) : (
                            <ConfusionMatrix data={(data.metrics as ClassificationMetric)?.confusionMatrix} />
                        )}
                        </CardContent>
                    </Card>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7 md:gap-8">
                    <KpiCard
                        title="Feature Importance Insights"
                        value={data.insights}
                        isInsight
                        icon={<BarChart3 className="size-4 text-muted-foreground" />}
                        isLoading={isLoading && !data.insights}
                        cardClassName='lg:col-span-4'
                    />
                     <ExplainPrediction
                        prediction={data.history[0]}
                        featureNames={state.selectedFeatures}
                        taskType={state.task}
                        isLoading={isLoading}
                        cardClassName='lg:col-span-3'
                    />
                </div>
            </div>
        </TabsContent>
        <TabsContent value="baseline">
            <div className="grid gap-4 md:gap-8">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7 md:gap-8">
                    <Card className="lg:col-span-4">
                        <CardHeader>
                        <CardTitle>Feature Importance (Baseline)</CardTitle>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <FeatureImportanceChart data={data.baselineFeatureImportance} />
                        </CardContent>
                    </Card>
                    <Card className="lg:col-span-3">
                        <CardHeader>
                        <CardTitle>
                            {state.task === 'regression' ? 'Prediction vs. Actual (Baseline)' : 'Confusion Matrix (Baseline)'}
                        </CardTitle>
                        </CardHeader>
                        <CardContent className="pl-2">
                        {state.task === 'regression' ? (
                            <PredictionPlot data={data.baselineChartData} />
                        ) : (
                            <ConfusionMatrix data={(data.baselineMetrics as ClassificationMetric)?.confusionMatrix} />
                        )}
                        </CardContent>
                    </Card>
                </div>
                 <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7 md:gap-8">
                    <KpiCard
                        title="Feature Importance Insights"
                        value={data.insights}
                        isInsight
                        icon={<BarChart3 className="size-4 text-muted-foreground" />}
                        isLoading={isLoading && !data.insights}
                        cardClassName='lg:col-span-4'
                    />
                     <ExplainPrediction
                        prediction={data.history[0]}
                        featureNames={state.selectedFeatures}
                        taskType={state.task}
                        isLoading={isLoading}
                        cardClassName='lg:col-span-3'
                    />
                </div>
            </div>
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
