

'use client';

import Image from 'next/image';
import { TreePine, BarChart3, Target, PanelLeft, LineChart, BeakerIcon, AreaChart, Lightbulb, GitMerge, BrainCircuit, Activity, TestTube2, HelpCircle, BookOpen } from 'lucide-react';
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
import { Metric, RegressionMetric, ClassificationMetric, DatasetMetadata } from '@/lib/types';
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
import { ProblemStatement } from '@/components/problem-statement';

const domainSpecificText = {
  'california-housing': {
    forest: "A Random Forest is like a team of 'expert' appraisers (Decision Trees). Each one gives a price estimate for a house, and the final prediction is the average of all their estimates. Click each tree to see its logic.",
    featureImportance: "Shows which housing attributes (like median income or house age) are most influential in predicting a home's value.",
    predictionPlot: "Compares the model's predicted home values against the actual sale prices. The closer the dots are to the straight line, the more accurate the model.",
    residualPlot: "Examines the model's prediction errors. Ideally, the dots should be randomly scattered around the zero line, which means the model's mistakes are random and not biased.",
    errorHistogram: "Shows the distribution of price prediction errors. A tall bar in the center means most predictions were very close to the real price.",
    cumulativeError: "Tells you what percentage of predictions were 'close enough'. For example, it might show that 80% of predictions were within $20,000 of the actual price.",
    pdp: "Shows how a single factor, like the number of rooms, affects the predicted house price, assuming all other factors stay the same.",
    summary: "Provides a quick overview of your data, like the average number of rooms and the age range of the houses in the dataset.",
    correlation: "Reveals how different housing features relate to each other. For example, do houses with more rooms tend to be newer?",
    aggregation: {
      finalPrediction: "The final prediction is the average of price predictions from all individual 'expert' trees in the forest.",
      predictionSpread: "Measures how much the price predictions vary from tree to tree. Low variance means the 'experts' agree.",
      individualPredictions: "Comparison of price predictions from each individual 'expert' tree in the forest.",
      summaryTable: "A detailed breakdown of each tree's predicted price and its contribution to the final averaged outcome."
    },
    prediction: {
        title: "Predict House Price",
        description: "Enter the values for the housing features to get a real-time prediction of the median house value.",
        resultTitle: "Predicted House Value",
        resultDescription: "This is the model's predicted median house value based on the input values you provided.",
        idleText: "Submit feature values to see a house value prediction."
    },
    metrics: {
        r2: "Think of this as the model's confidence score. A score of 0.8 means the model is 80% confident it can predict house prices correctly based on the data.",
        rmse: "This is the average dollar amount the model's price predictions are off by. A lower number is better because it means the model is more accurate.",
        mae: "Similar to RMSE, this also shows the average prediction error in dollars. It's less sensitive to a few very wrong predictions."
    }
  },
  'diabetes': {
    forest: "The Random Forest acts like a panel of doctors. Each tree (doctor) provides a score for disease progression, and the final prediction is the average of all their scores. Click each tree to see its reasoning.",
    featureImportance: "Highlights which clinical measurements (like BMI or blood pressure) are most critical for predicting disease progression a year later.",
    predictionPlot: "Compares the model's predicted disease progression score against the actual measured score. A tighter cluster of dots along the line means a better model.",
    residualPlot: "Checks if the model's prediction errors are random. If the dots form a pattern, the model might have a hidden bias (e.g., always underestimating for older patients).",
    errorHistogram: "Visualizes how far off the predictions are. Ideally, you want a big spike at zero, meaning most predictions were spot-on.",
    cumulativeError: "Shows how many predictions were within a certain range of the true score. A steep curve is good, showing high accuracy for most cases.",
    pdp: "Isolates one factor, like BMI, to see its direct impact on the predicted disease progression, independent of other measurements.",
    summary: "Provides key statistics for each clinical measurement, such as the average BMI and blood pressure in the patient group.",
    correlation: "Shows relationships between different clinical markers. For instance, is higher BMI usually associated with higher blood pressure in this dataset?",
    aggregation: {
      finalPrediction: "The final prediction is the average of disease progression scores from all individual trees.",
      predictionSpread: "Measures the variance in predicted scores across all trees. Lower variance suggests higher confidence.",
      individualPredictions: "Shows the predicted disease progression score from each tree in the forest.",
      summaryTable: "Detailed breakdown of each tree's prediction and its influence on the final averaged score."
    },
    prediction: {
        title: "Predict Disease Progression",
        description: "Enter the values for the clinical measurements to get a real-time prediction of disease progression.",
        resultTitle: "Predicted Progression Score",
        resultDescription: "This is the model's predicted disease progression score based on the input values you provided.",
        idleText: "Submit feature values to see a disease progression prediction."
    },
    metrics: {
        r2: "This is like a grade for the model, from 0 to 100%. It tells you how much of the change in disease progression the model can explain. Higher is better.",
        rmse: "This is the average amount the model's prediction was 'off' by. A smaller number means the model's predictions are closer to the real-life outcomes.",
        mae: "Similar to RMSE, this also shows the average error. It gives a straightforward idea of how far off the predictions are, on average."
    }
  },
  'linnerud': {
    forest: "Think of the Random Forest as a group of fitness coaches. Each tree (coach) predicts an athlete's weight based on their exercises. The final prediction is the average of all their predictions. Click a tree to view its analysis.",
    featureImportance: "Shows which exercises (like Chinups or Situps) have the biggest impact on predicting a person's weight.",
    predictionPlot: "Compares the model's predicted weight against the athlete's actual weight. The closer the dots are to the line, the better the prediction.",
    residualPlot: "Analyzes if prediction errors for an athlete's weight have a pattern. Randomly scattered dots are a good sign of an unbiased model.",
    errorHistogram: "Displays how often the model is off by a certain amount. A large bar in the middle means the model is frequently accurate.",
    cumulativeError: "Shows how many weight predictions are within a certain number of pounds of the actual weight. A steep curve means most predictions are very close.",
    pdp: "Shows how improving in one exercise, like situps, is predicted to affect an athlete's weight, keeping other exercises the same.",
    summary: "Gives a simple statistical summary of the athletes' performance, like the average number of chinups and situps.",
    correlation: "Examines if doing well in one exercise is related to doing well in another. For example, do athletes who do more chinups also do more situps?",
    aggregation: {
      finalPrediction: "The final prediction is the average of weight predictions from all individual trees.",
      predictionSpread: "Shows the agreement among the trees' weight predictions. Less spread means more consensus.",
      individualPredictions: "A look at the weight prediction made by each individual tree in the ensemble.",
      summaryTable: "A detailed list of each tree's weight prediction and how much it contributed to the final result."
    },
    prediction: {
        title: "Predict Athlete's Weight",
        description: "Enter the values for exercise performance to get a real-time prediction of an athlete's weight.",
        resultTitle: "Predicted Weight (lbs)",
        resultDescription: "This is the model's predicted weight based on the input values you provided.",
        idleText: "Submit feature values to see a weight prediction."
    },
    metrics: {
        r2: "A score from 0 to 100% that shows how well the exercises can predict an athlete's weight. A higher score means the model is more effective.",
        rmse: "This is the average number of pounds by which the model's weight prediction is typically wrong. A smaller number is better.",
        mae: "This also shows the average error in pounds, giving you a clear and direct sense of the model's accuracy."
    }
  },
  'wine-quality': {
    forest: "A Random Forest is like a panel of wine tasters (Decision Trees). Each one votes on whether a wine is 'Good' or 'Bad', and the majority vote becomes the final prediction. Click each tree to see how it voted.",
    featureImportance: "Reveals which chemical properties (like alcohol content or acidity) are the strongest clues for guessing if a wine is 'Good' or 'Bad'.",
    confusionMatrix: "This is a report card for the model. It shows how many times the model correctly identified 'Good' and 'Bad' wines, and where it got confused.",
    rocCurve: "Measures the model's ability to be a good 'Good wine' detector. A curve that bows up and to the left means the model is excellent at telling the two qualities apart.",
    prCurve: "This shows the balance between being right when predicting a 'Good' wine and not missing any of the actual 'Good' wines. Higher and to the right is better.",
    pdp: "Isolates a single ingredient, like 'alcohol', to see how its concentration level alone impacts the chance of the wine being rated as 'Good'.",
    summary: "Provides an overview of the chemical properties across all wines in the dataset, such as the average alcohol content and pH range.",
    correlation: "Shows how different chemical properties are related. For example, does higher alcohol content often go with lower sugar?",
    aggregation: {
      finalPrediction: "The final quality rating is decided by a vote; each tree casts a vote for 'Good' or 'Bad' quality.",
      predictionSpread: "Shows the distribution of votes. A strong majority for one class indicates a high-confidence prediction.",
      individualPredictions: "Visualizes the proportion of trees that voted for 'Good' vs. 'Bad' quality.",
      summaryTable: "A detailed log of each tree's individual vote for the wine's quality."
    },
     prediction: {
        title: "Predict Wine Quality",
        description: "Enter the chemical properties of the wine to get a real-time prediction of its quality.",
        resultTitle: "Predicted Quality",
        resultDescription: "This is the model's predicted quality (0 for bad, 1 for good) based on the input values you provided.",
        idleText: "Submit feature values to see a wine quality prediction."
    },
     metrics: {
        accuracy: "The percentage of wines the model correctly classified as 'Good' or 'Bad'. A higher percentage is better.",
        precision: "Out of all the wines the model called 'Good', what percentage were actually good? High precision means the model makes few false alarms.",
        recall: "Out of all the wines that were actually 'Good', what percentage did the model correctly find? High recall means the model misses very few good wines."
    }
  },
  'breast-cancer': {
    forest: "The Random Forest acts as a group of virtual pathologists. Each tree examines the tumor data and votes 'Malignant' or 'Benign'. The final diagnosis is based on the majority vote. Click a tree to see its individual analysis.",
    featureImportance: "Pinpoints which tumor measurements (like its size or texture) are the most important clues for making a diagnosis.",
    confusionMatrix: "This is a summary of the model's performance. It shows how many 'Malignant' and 'Benign' cases it correctly identified and where it made mistakes.",
    rocCurve: "Evaluates how well the model can distinguish between 'Malignant' and 'Benign' tumors. A curve that goes high and to the left is a sign of a very accurate model.",
    prCurve: "Shows the trade-off between being sure a tumor is 'Malignant' (Precision) and correctly finding all 'Malignant' tumors (Recall). For medical tests, both are critical.",
    pdp: "Shows how a single tumor measurement, like 'mean radius', influences the model's diagnosis, assuming all other factors are kept constant.",
    summary: "Gives a statistical overview of the tumor measurements, like the average radius and texture of the cells in the dataset.",
    correlation: "Reveals relationships between tumor characteristics. For example, do larger tumors tend to have a rougher texture?",
    aggregation: {
      finalPrediction: "The final diagnosis ('Malignant' or 'Benign') is determined by a majority vote from all trees in the forest.",
      predictionSpread: "Shows how many trees voted for each diagnosis, indicating the model's confidence.",
      individualPredictions: "A pie chart showing the breakdown of votes for 'Malignant' vs. 'Benign' from all trees.",
      summaryTable: "A detailed record of each tree's diagnostic vote."
    },
    prediction: {
        title: "Predict Cancer Diagnosis",
        description: "Enter the tumor measurement values to get a real-time prediction of the diagnosis.",
        resultTitle: "Predicted Diagnosis",
        resultDescription: "This is the model's predicted diagnosis (0 for malignant, 1 for benign) based on the input values.",
        idleText: "Submit feature values to see a diagnosis prediction."
    },
    metrics: {
        accuracy: "The overall percentage of correct diagnoses ('Malignant' or 'Benign') made by the model. Higher is better.",
        precision: "When the model says a tumor is 'Malignant', how often is it right? This is critical for avoiding false alarms and unnecessary stress.",
        recall: "Of all the tumors that were actually 'Malignant', how many did the model successfully find? This is critical for not missing any cancers."
    }
  },
  'digits': {
    forest: "The Random Forest works like a committee of handwriting experts. Each tree looks at the pixel image and votes on what digit it is (0-9). The digit with the most votes becomes the final prediction. Click any tree to see its logic.",
    featureImportance: "Identifies which pixel areas are most important for the model to tell one number from another. It shows what parts of the image the model 'looks' at.",
    confusionMatrix: "This is a chart showing the model's mistakes. It helps you see if it consistently confuses certain digits, like mistaking a '3' for an '8'.",
    rocCurve: "Measures the model's ability to distinguish one specific digit from all the others. A high-arching curve means it's a good identifier.",
    prCurve: "For any given digit, this shows the balance between being correct when you predict that digit (Precision) and finding all instances of it (Recall).",
    pdp: "Shows how changing the brightness of a single pixel region influences the model's decision on what digit it is, showing which pixels are key.",
    summary: "Provides simple statistics on pixel brightness values across the entire dataset of handwritten images.",
    correlation: "Shows if the brightness of one pixel is related to the brightness of another. This can help reveal common stroke patterns in the handwriting.",
    aggregation: {
      finalPrediction: "The final recognized digit is based on a majority vote from all decision trees.",
      predictionSpread: "Illustrates the consensus among the trees, showing the vote count for each possible digit.",
      individualPredictions: "A visual breakdown of how many trees voted for each digit (0-9).",
      summaryTable: "A detailed log of the digit predicted by each individual tree."
    },
    prediction: {
        title: "Recognize Handwritten Digit",
        description: "Enter the pixel intensity values to get a real-time prediction of the handwritten digit.",
        resultTitle: "Predicted Digit",
        resultDescription: "This is the model's predicted digit based on the input pixel values you provided.",
        idleText: "Submit feature values to see a digit prediction."
    },
    metrics: {
        accuracy: "What percentage of handwritten digits did the model correctly guess? It's the model's overall score.",
        precision: "When the model predicts a digit is a '7', how often is it actually a '7'? High precision means the model is very sure of its predictions.",
        recall: "Out of all the handwritten '7's in the dataset, how many did the model find? High recall means the model is good at not missing any."
    }
  },
  default: {
    forest: "A Random Forest is an ensemble of Decision Trees. The final prediction is obtained by aggregating the outputs of all trees (averaging for regression, voting for classification). Click each tree to see its structure.",
    featureImportance: "Shows which pieces of information (features) were most helpful to the model in making its predictions.",
    predictionPlot: "Compares the model's predictions against the actual values. The closer the dots are to the straight line, the better the model.",
    confusionMatrix: "A simple report card showing where the model was right and where it was wrong in its classifications.",
    residualPlot: "This chart shows the model's prediction errors. If the dots are scattered randomly around the middle line, it means the model isn't making any systematic mistakes.",
    errorHistogram: "This bar chart shows how big the prediction errors are. A tall bar in the middle is good—it means most errors are small.",
    cumulativeError: "Tells you what percentage of predictions were 'close enough'. A steep curve means most predictions were very accurate.",
    rocCurve: "This shows how good the model is at telling two different classes apart. A curve that is high and to the left means the model is very effective.",
    prCurve: "This curve shows the trade-off between making a correct positive prediction and finding all the positive cases. A curve that is high and to the right is better.",
    pdp: "Shows how changing just one factor affects the final prediction, which helps you understand what the model thinks is important.",
    summary: "Provides a basic statistical overview of your data, like averages and value ranges, in a simple table.",
    correlation: "This colorful grid shows you which of your data features are related to each other. For example, do two things tend to increase together or does one go up when the other goes down?",
    aggregation: {
      finalPrediction: "The final prediction is the result of aggregating the outputs of all individual trees.",
      predictionSpread: "Measures the variance or vote distribution of predictions across all trees.",
      individualPredictions: "Comparison of predictions from different trees in the forest.",
      summaryTable: "Detailed predictions from each tree in the forest."
    },
    prediction: {
        title: "Make a Prediction",
        description: "Enter values for the features below to get a real-time prediction.",
        resultTitle: "Prediction Result",
        resultDescription: "This is the model's prediction based on the input values you provided.",
        idleText: "Submit feature values to see a prediction."
    },
    metrics: {
        r2: "A score from 0 to 100% that shows how well the model can predict outcomes. Higher is better.",
        rmse: "The average amount the model's prediction was 'off' by. A smaller number is better.",
        mae: "Similar to RMSE, this also shows the average error, giving a straightforward idea of the typical error size.",
        accuracy: "The percentage of correct predictions the model made. Higher is better.",
        precision: "When the model makes a positive prediction, how often is it right? High precision means fewer false alarms.",
        recall: "Of all the actual positive cases, how many did the model find? High recall means the model doesn't miss much."
    }
  }
};


export default function DashboardPage() {
  const { state, data, status, actions, availableDatasets } = useRandomForest();
  const isLoading = status === 'loading';

  const descriptions = domainSpecificText[state.datasetName as keyof typeof domainSpecificText] || domainSpecificText.default;
  const metricDescriptions = descriptions.metrics;

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
            tooltipDescription={metricDescriptions.r2}
          />
          <KpiCard
            title="RMSE"
            value={regMetrics?.rmse?.toFixed(3)}
            baselineValue={baseRegMetrics?.rmse?.toFixed(3)}
            icon={<LineChart className="size-4 text-muted-foreground" />}
            isLoading={isLoading}
            tooltipDescription={metricDescriptions.rmse}
          />
          <KpiCard
            title="MAE"
            value={regMetrics?.mae?.toFixed(3)}
            baselineValue={baseRegMetrics?.mae?.toFixed(3)}
            icon={<BeakerIcon className="size-4 text-muted-foreground" />}
            isLoading={isLoading}
            tooltipDescription={metricDescriptions.mae}
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
          tooltipDescription={metricDescriptions.accuracy}
        />
        <KpiCard
          title="Precision"
          value={classMetrics?.precision?.toFixed(3)}
          baselineValue={baseClassMetrics?.precision?.toFixed(3)}
          icon={<LineChart className="size-4 text-muted-foreground" />}
          isLoading={isLoading}
          tooltipDescription={metricDescriptions.precision}
        />
        <KpiCard
          title="Recall"
          value={classMetrics?.recall?.toFixed(3)}
          baselineValue={baseClassMetrics?.recall?.toFixed(3)}
          icon={<BeakerIcon className="size-4 text-muted-foreground" />}
          isLoading={isLoading}
          tooltipDescription={metricDescriptions.recall}
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
        <ProblemStatement metadata={data.metadata} datasetName={state.datasetName} />
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
                                  metadata={data.metadata}
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
                                      <ConfusionMatrix 
                                        data={(data.metrics as ClassificationMetric)?.confusionMatrix} 
                                        datasetName={state.datasetName}
                                      />
                                  </TabsContent>
                                  <TabsContent value="baseline">
                                      <ConfusionMatrix 
                                        data={(data.baselineMetrics as ClassificationMetric)?.confusionMatrix}
                                        datasetName={state.datasetName}
                                      />
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
                          <CardTitle>Feature Distributions</CardTitle>
                          <CardDescription>This chart shows how the values of a single feature are spread out. It helps you spot common values, outliers, and the overall range.</CardDescription>
                      </CardHeader>
                       <CardContent>
                          <FeatureDistributionChart 
                            dataset={data.dataset} 
                            features={state.selectedFeatures} 
                          />
                      </CardContent>
                  </Card>
                  <Card>
                      <CardHeader>
                          <CardTitle>Correlation Heatmap</CardTitle>
                          <CardDescription>{descriptions.correlation}</CardDescription>
                      </CardHeader>
                      <CardContent>
                          <CorrelationHeatmap dataset={data.dataset} task={state.task} targetColumn={state.targetColumn} metadata={data.metadata} />
                      </CardContent>
                  </Card>
                   <Card>
                      <CardHeader>
                          <CardTitle>Pair Plot</CardTitle>
                          <CardDescription>This grid of charts lets you compare every feature against every other feature. It's a powerful way to see relationships between pairs of data.</CardDescription>
                      </CardHeader>
                      <CardContent>
                          <PairPlot dataset={data.dataset} targetColumn={state.targetColumn} task={state.task} />
                      </CardContent>
                  </Card>
                  <Card>
                      <CardHeader>
                          <CardTitle>Summary Statistics</CardTitle>
                          <CardDescription>{descriptions.summary}</CardDescription>
                      </CardHeader>
                      <CardContent>
                          <SummaryStatistics dataset={data.dataset} task={state.task} targetColumn={state.targetColumn} metadata={data.metadata} />
                      </CardContent>
                  </Card>
                   <Card className="mb-8">
                      <CardHeader>
                          <CardTitle>Missing Values</CardTitle>
                          <CardDescription>This chart quickly shows you if any data is missing from your dataset. A long bar means a lot of data is missing for that feature.</CardDescription>
                      </CardHeader>
                      <CardContent>
                          <MissingValuesChart dataset={data.dataset} metadata={data.metadata} />
                      </CardContent>
                  </Card>
               </div>
          </TabsContent>
          <TabsContent value="insights" className="py-4 space-y-4 md:space-y-8">
            <div className="grid grid-cols-1 gap-4 md:gap-8">
                <ForestVisualization
                    simulationData={data.forestSimulation}
                    taskType={state.task}
                    isLoading={isLoading && !data.metrics}
                    onRetrain={actions.trainModel}
                    datasetName={state.datasetName}
                    description={descriptions.forest}
                />
                <AggregationResultsDashboard
                    simulationData={data.forestSimulation}
                    taskType={state.task}
                    isLoading={isLoading && !data.metrics}
                    descriptions={descriptions.aggregation}
                    datasetName={state.datasetName}
                />
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
          </TabsContent>
          
          <TabsContent value="prediction" className="py-4">
               <RealTimePrediction 
                  features={state.selectedFeatures} 
                  taskType={state.task} 
                  isLoading={isLoading || !data.metrics}
                  onPredict={actions.predict}
                  datasetName={state.datasetName}
                  descriptions={descriptions.prediction}
                  placeholderValues={data.placeholderValues}
                  metadata={data.metadata}
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
