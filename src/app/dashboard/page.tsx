
'use client';

import Image from 'next/image';
import { TreePine, BarChart3, Target, PanelLeft, LineChart, BeakerIcon, AreaChart, Lightbulb, GitMerge, BrainCircuit, Activity, TestTube2, HelpCircle } from 'lucide-react';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ForestVisualization } from '@/components/forest-visualization';
import { AggregationResultsDashboard } from '@/components/aggregation-results-dashboard';

const domainSpecificText = {
  'california-housing': {
    featureImportance: "Shows which housing attributes (like median income or house age) are most influential in predicting a home's value.",
    predictionPlot: "Compares the model's predicted home values against the actual sale prices.",
    residualPlot: "Examines if the model's price prediction errors are random or if they follow a pattern (e.g., consistently overpricing cheaper homes).",
    errorHistogram: "Shows the distribution of price prediction errors. Ideally, most errors should be close to zero.",
    cumulativeError: "Shows what percentage of home price predictions fall within a certain dollar amount of the actual price.",
    pdp: "Shows how changing a single factor, like the number of rooms, affects the predicted house price, holding all other factors constant.",
    summary: "Provides an overview of the housing data, like average number of rooms and the range of house ages.",
    correlation: "Reveals how different housing features relate to each other, like whether older houses tend to have fewer rooms.",
  },
  'diabetes': {
    featureImportance: "Highlights which clinical measurements (like BMI or blood pressure) are most critical for predicting disease progression a year later.",
    predictionPlot: "Compares the model's predicted disease progression score against the actual measured score.",
    residualPlot: "Checks if the model's prediction errors are random or if they have a bias (e.g., underestimating progression in older patients).",
    errorHistogram: "Visualizes the spread of prediction errors. A tight cluster around zero is ideal.",
    cumulativeError: "Shows the percentage of predictions that are within a certain range of the true disease progression score.",
    pdp: "Isolates one factor, like BMI, to see its direct impact on the predicted disease progression, independent of other measurements.",
    summary: "Provides key statistics for each clinical measurement, such as the average BMI and blood pressure in the patient group.",
    correlation: "Shows relationships between different clinical markers, like whether higher BMI is associated with higher blood pressure.",
  },
  'linnerud': {
    featureImportance: "Shows which exercises (like Chinups or Situps) have the biggest impact on a person's physiological measurements (like Weight).",
    predictionPlot: "Compares the model's predicted weight against the athlete's actual weight.",
    residualPlot: "Analyzes if prediction errors for an athlete's weight have a pattern, or if they are random.",
    errorHistogram: "Displays the distribution of weight prediction errors. Most errors should ideally be small.",
    cumulativeError: "Shows how many weight predictions are within a certain number of pounds of the actual weight.",
    pdp: "Shows how changing performance in one exercise, like situps, is predicted to affect an athlete's weight, keeping other exercises constant.",
    summary: "Gives a statistical summary of the athletes' performance, including average number of chinups and situps.",
    correlation: "Examines if performance in one exercise, like chinups, is related to performance in another, like situps.",
  },
  'wine-quality': {
    featureImportance: "Reveals which chemical properties (like alcohol content or acidity) are the strongest predictors of wine quality.",
    confusionMatrix: "Shows how well the model distinguishes between 'Good' and 'Bad' quality wines. It highlights where mistakes are made.",
    rocCurve: "Measures the model's ability to correctly identify a 'Good' quality wine without incorrectly flagging a 'Bad' one.",
    prCurve: "Shows the trade-off between being right about a 'Good' wine prediction (Precision) and finding all 'Good' wines (Recall).",
    pdp: "Isolates a single ingredient, like 'sulphates', to see how its concentration level impacts the predicted quality of the wine.",
    summary: "Provides an overview of the chemical properties, such as the average alcohol content and pH range across all wines.",
    correlation: "Shows how different chemical properties are related, such as whether higher acidity is linked to lower pH.",
  },
  'breast-cancer': {
    featureImportance: "Pinpoints which tumor characteristics (like radius or texture) are the most significant indicators for a diagnosis.",
    confusionMatrix: "Summarizes the model's diagnostic accuracy, showing correct vs. incorrect classifications for 'Malignant' and 'Benign' cases.",
    rocCurve: "Evaluates how well the model can distinguish between 'Malignant' and 'Benign' tumors.",
    prCurve: "Demonstrates the trade-off between the accuracy of a 'Malignant' prediction (Precision) and correctly identifying all malignant cases (Recall).",
    pdp: "Shows how a single tumor measurement, like 'mean radius', influences the model's diagnosis, holding other factors constant.",
    summary: "Gives a statistical overview of the tumor measurements, like the average radius and texture of the cells.",
    correlation: "Reveals relationships between tumor characteristics, like whether a larger radius is correlated with higher compactness.",
  },
  'digits': {
    featureImportance: "Identifies which pixel areas are most important for the model to recognize a handwritten digit.",
    confusionMatrix: "Shows a breakdown of which digits the model confuses. For example, does it often mistake a '3' for an '8'?",
    rocCurve: "Measures the model's ability to distinguish one digit from another (e.g., telling a '7' from all other digits).",
    prCurve: "For a specific digit, this shows the balance between making sure a prediction is correct (Precision) and not missing any instances of that digit (Recall).",
    pdp: "Shows how the brightness of a single pixel region influences the model's decision on what digit it is.",
    summary: "Provides statistics on pixel intensity values across the dataset of images.",
    correlation: "Shows if the brightness of one pixel is related to the brightness of another, which can reveal stroke patterns.",
  },
  default: {
    featureImportance: "Shows the relative importance of each feature in predicting the target variable.",
    predictionPlot: "Compares the model's predictions against the actual values.",
    confusionMatrix: "A visual breakdown of the model's prediction accuracy for each class.",
    residualPlot: "This chart plots the model's prediction errors (residuals) against the predicted values. It helps to check for patterns in the errors, which can indicate if the model has a systematic bias.",
    errorHistogram: "This histogram shows the distribution of prediction errors. An ideal histogram would be centered at zero, indicating that the model's errors are unbiased.",
    cumulativeError: "This chart shows the percentage of predictions that fall within a certain error margin. A steep curve indicates that most predictions have small errors.",
    rocCurve: "The Receiver Operating Characteristic (ROC) curve shows the model's ability to distinguish between classes. A curve that bows toward the top-left corner indicates a better-performing model.",
    prCurve: "This curve demonstrates the trade-off between precision (the accuracy of positive predictions) and recall (the ability to find all positive samples). A curve that bows out toward the top-right indicates a better model.",
    pdp: "Shows the marginal effect of a feature on the predicted outcome.",
    summary: "Provides a summary of basic statistics for each numeric feature in the dataset.",
    correlation: "Displays a heatmap showing the correlation between numeric features.",
  }
};


export default function DashboardPage() {
  const { state, data, status, actions, availableDatasets } = useRandomForest();
  const isLoading = status === 'loading';

  const descriptions = domainSpecificText[state.datasetName as keyof typeof domainSpecificText] || domainSpecificText.default;

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
        <div className="flex flex-1 justify-center rounded-lg border border-dashed shadow-sm pt-10">
          <div className="flex flex-col items-center text-center">
            <Image src="/logo.png" alt="Logo" width={400} height={400} />
            <h3 className="text-2xl font-bold tracking-tight mb-2">Welcome to Forest Insights</h3>
            <p className="text-muted-foreground mb-4">
              Train a baseline model or adjust parameters in the sidebar to begin.
            </p>
            <Button onClick={actions.trainBaselineModel}>
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
      <TooltipProvider>
        <Tabs defaultValue="dashboard">
          <div className="flex items-center">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="explore">Explore</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
              <TabsTrigger value="prediction">Prediction</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="dashboard" className="py-4 space-y-4 md:space-y-8">
              <div className="grid w-full gap-4 md:gap-8">
                  <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                      {renderKpiCards(data.metrics, data.baselineMetrics)}
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7 md:gap-8">
                      <Card className="lg:col-span-4">
                          <CardHeader>
                            <CardTitle>Feature Importance</CardTitle>
                            <CardDescription>{descriptions.featureImportance}</CardDescription>
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
                              <CardTitle className="flex items-center gap-2">
                                  {state.task === 'regression' ? 'Prediction vs. Actual' : 'Confusion Matrix'}
                                  {state.task === 'classification' && (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                                      </TooltipTrigger>
                                      <TooltipContent side="top" className="max-w-xs">
                                        <p>This table summarizes the performance of the classification model. It shows how many predictions were correct versus incorrect for each class.</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  )}
                              </CardTitle>
                              <CardDescription>
                                  {state.task === 'regression' ? descriptions.predictionPlot : descriptions.confusionMatrix}
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
              <div className="grid grid-cols-1 gap-4 md:gap-8">
                <h2 className="text-xl font-semibold">Model Performance Analysis</h2>
              </div>
               {state.task === 'regression' ? (
                  <div className="grid grid-cols-1 gap-4 md:gap-8">
                      <Card>
                          <CardHeader>
                              <CardTitle className='flex items-center gap-2'><Activity className='w-5 h-5' />Residual Plot</CardTitle>
                              <CardDescription>{descriptions.residualPlot}</CardDescription>
                          </CardHeader>
                          <CardContent>
                             <ResidualPlot data={data.chartData} />
                          </CardContent>
                      </Card>
                      <Card>
                          <CardHeader>
                              <CardTitle className='flex items-center gap-2'><BarChart3 className='w-5 h-5' />Prediction Error Histogram</CardTitle>
                               <CardDescription>{descriptions.errorHistogram}</CardDescription>
                          </CardHeader>
                          <CardContent>
                              <PredictionErrorHistogram data={data.chartData} />
                          </CardContent>
                      </Card>
                      <Card>
                          <CardHeader>
                              <CardTitle className='flex items-center gap-2'><AreaChart className='w-5 h-5' />Cumulative Error Chart</CardTitle>
                              <CardDescription>{descriptions.cumulativeError}</CardDescription>
                          </CardHeader>
                          <CardContent>
                              <CumulativeErrorChart data={data.chartData} />
                          </CardContent>
                      </Card>
                  </div>
              ) : (
                  <div className="grid grid-cols-1 gap-4 md:gap-8">
                      <Card>
                          <CardHeader>
                              <CardTitle className='flex items-center gap-2'><Activity className='w-5 h-5' />ROC Curve</CardTitle>
                              <CardDescription>{descriptions.rocCurve}</CardDescription>
                          </CardHeader>
                          <CardContent>
                              <RocCurveChart data={data.rocCurveData} />
                          </CardContent>
                      </Card>
                      <Card>
                          <CardHeader>
                              <CardTitle className='flex items-center gap-2'><Target className='w-5 h' />Precision-Recall Curve</CardTitle>                            
                              <CardDescription>{descriptions.prCurve}</CardDescription>
                          </CardHeader>
                          <CardContent>
                              <PrecisionRecallCurveChart data={data.prCurveData} />
                          </CardContent>
                      </Card>
                  </div>
              )}
          </TabsContent>
          <TabsContent value="explore" className="py-4">
               <div className="grid grid-cols-1 gap-4 md:gap-8">
                   <Card>
                      <CardHeader>
                          <CardTitle>Summary Statistics</CardTitle>
                          <CardDescription>{descriptions.summary}</CardDescription>
                      </CardHeader>
                      <CardContent>
                          <SummaryStatistics dataset={data.dataset} task={state.task} targetColumn={state.targetColumn} />
                      </CardContent>
                  </Card>
                   <Card>
                      <CardHeader>
                          <CardTitle>Missing Values</CardTitle>
                          <CardDescription>Shows the percentage of missing values for each feature in the dataset.</CardDescription>
                      </CardHeader>
                      <CardContent>
                          <MissingValuesChart dataset={data.dataset} />
                      </CardContent>
                  </Card>
                  <Card>
                      <CardHeader>
                          <CardTitle>Feature Distributions</CardTitle>
                          <CardDescription>Visualizes the distribution of values for a selected feature.</CardDescription>
                      </CardHeader>
                       <CardContent>
                          <FeatureDistributionChart 
                            dataset={data.dataset} 
                            features={state.selectedFeatures} 
                          />
                      </CardContent>
                  </Card>
                  <Card className="mb-8">
                      <CardHeader>
                          <CardTitle>Correlation Heatmap</CardTitle>
                          <CardDescription>{descriptions.correlation}</CardDescription>
                      </CardHeader>
                      <CardContent>
                          <CorrelationHeatmap dataset={data.dataset} task={state.task} targetColumn={state.targetColumn} />
                      </CardContent>
                  </Card>
                   <Card>
                      <CardHeader>
                          <CardTitle>Pair Plot</CardTitle>
                          <CardDescription>Presents scatter plots for pairs of features to visualize their relationships.</CardDescription>
                      </CardHeader>
                      <CardContent>
                          <PairPlot dataset={data.dataset} targetColumn={state.targetColumn} task={state.task} />
                      </CardContent>
                  </Card>
               </div>
          </TabsContent>
          <TabsContent value="insights" className="py-4 space-y-4 md:space-y-8">
              <div className="grid grid-cols-1 gap-4 md:gap-8">
                   <Card>
                      <CardHeader>
                          <CardTitle className='flex items-center gap-2'><Lightbulb className='w-5 h-5' />Partial Dependence Plot</CardTitle>
                          <CardDescription>{descriptions.pdp}</CardDescription>
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
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
                   <ForestVisualization
                      simulationData={data.forestSimulation}
                      taskType={state.task}
                      isLoading={isLoading && !data.metrics}
                      onRetrain={actions.trainModel}
                    />
                   <AggregationResultsDashboard
                      simulationData={data.forestSimulation}
                      taskType={state.task}
                      isLoading={isLoading && !data.metrics}
                   />
              </div>
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
      </TooltipProvider>
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
          availableDatasets={availableDatasets}
        />
      </Sidebar>
      <SidebarInset className="flex flex-col">
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 mb-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="md:hidden">
              <PanelLeft />
            </SidebarTrigger>
            <div className="flex items-center gap-2">
                <Image src="/logo.png" alt="Logo" width={32} height={32} />
                <h1 className="text-2xl font-semibold">Forest Insights</h1>
            </div>
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
