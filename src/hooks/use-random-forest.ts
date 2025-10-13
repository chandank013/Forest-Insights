'use client';
import { useState, useReducer, useCallback, useEffect } from 'react';
import type {
  TaskType,
  Hyperparameters,
  Metrics,
  FeatureImportance,
  Prediction,
  ChartDataPoint,
  DecisionTree,
} from '@/lib/types';
import housingDataset from '@/lib/data/california-housing.json';
import wineDataset from '@/lib/data/wine-quality.json';
import { getFeatureImportanceInsights } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';

type Status = 'idle' | 'loading' | 'success' | 'error';

const BASELINE_HYPERPARAMETERS: Hyperparameters = {
  n_estimators: 100,
  max_depth: 10,
  min_samples_split: 2,
  min_samples_leaf: 1,
  max_features: 'sqrt',
  bootstrap: true,
  min_impurity_decrease: 0.0,
  criterion: 'gini',
  class_weight: null,
};


const regressionInitialState = {
  task: 'regression' as TaskType,
  hyperparameters: BASELINE_HYPERPARAMETERS,
  selectedFeatures: [
    'MedInc',
    'HouseAge',
    'AveRooms',
    'AveBedrms',
    'Population',
    'AveOccup',
    'Latitude',
    'Longitude',
  ],
  targetColumn: 'MedHouseVal',
  testSize: 0.2,
};

const classificationInitialState = {
  task: 'classification' as TaskType,
  hyperparameters: BASELINE_HYPERPARAMETERS,
  selectedFeatures: [
    'fixed_acidity',
    'volatile_acidity',
    'citric_acid',
    'residual_sugar',
    'chlorides',
    'free_sulfur_dioxide',
    'total_sulfur_dioxide',
    'density',
    'pH',
    'sulphates',
    'alcohol',
  ],
  targetColumn: 'quality',
  testSize: 0.2,
};


type State = {
  task: TaskType;
  hyperparameters: Hyperparameters;
  selectedFeatures: string[];
  targetColumn: string;
  testSize: number;
};

type Data = {
  dataset: Record<string, any>[];
  metrics: (Metrics & { confusionMatrix?: number[][] }) | null;
  featureImportance: FeatureImportance[];
  history: Prediction[];
  chartData: ChartDataPoint[] | null;
  insights: string;
  baselineMetrics: (Metrics & { confusionMatrix?: number[][] }) | null;
  baselineFeatureImportance: FeatureImportance[];
  baselineChartData: ChartDataPoint[] | null;
  decisionTree: DecisionTree | null;
};

type Action =
  | { type: 'SET_TASK'; payload: TaskType }
  | { type: 'SET_HYPERPARAMETERS'; payload: Partial<Hyperparameters> }
  | { type: 'SET_SELECTED_FEATURES'; payload: string[] }
  | { type: 'SET_TARGET_COLUMN'; payload: string }
  | { type: 'SET_TEST_SIZE'; payload: number };

const initialState: State = regressionInitialState;

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_TASK': {
        if (action.payload === 'regression') {
            return regressionInitialState;
        } else {
            return classificationInitialState;
        }
    }
    case 'SET_HYPERPARAMETERS':
      return { ...state, hyperparameters: { ...state.hyperparameters, ...action.payload } };
    case 'SET_SELECTED_FEATURES':
      return { ...state, selectedFeatures: action.payload };
    case 'SET_TARGET_COLUMN': {
      const currentDataset = state.task === 'regression' ? housingDataset : wineDataset;
      const allHeaders = Object.keys(currentDataset[0] ?? {});
      const newFeatures = allHeaders.filter(h => h !== action.payload);
      return { ...state, targetColumn: action.payload, selectedFeatures: newFeatures };
    }
    case 'SET_TEST_SIZE':
        return { ...state, testSize: action.payload };
    default:
      return state;
  }
};

const generateMockTree = (features: string[], depth: number = 0, maxDepth: number = 2): DecisionTree => {
    if (depth === maxDepth || Math.random() < 0.4) {
        const value = Math.random() > 0.5 ? 'Class 1' : 'Class 0';
        return {
            type: 'leaf',
            value,
            samples: Math.floor(Math.random() * 50 + 10)
        };
    }

    const feature = features[Math.floor(Math.random() * features.length)];
    const threshold = (Math.random() * 10 + 5).toFixed(2);
    
    return {
        type: 'node',
        feature,
        threshold: parseFloat(threshold),
        samples: Math.floor(Math.random() * 200 + 50),
        children: [
            generateMockTree(features, depth + 1, maxDepth),
            generateMockTree(features, depth + 1, maxDepth)
        ]
    };
};

const mockTrainModel = async (
  state: State,
  dataset: Record<string, any>[],
  isBaseline: boolean = false,
): Promise<Omit<Data, 'dataset' | 'insights' | 'baselineMetrics' | 'baselineFeatureImportance' | 'baselineChartData'>> => {
  await new Promise((res) => setTimeout(res, 1500));

  const { task, selectedFeatures, targetColumn } = state;
  const hyperparameters = isBaseline ? BASELINE_HYPERPARAMETERS : state.hyperparameters;

  if (Math.random() < 0.1 && !isBaseline) {
    throw new Error('Model training failed. Please try adjusting parameters.');
  }

  let metrics: Data['metrics'];
  if (task === 'regression') {
    metrics = {
      r2: Math.random() * 0.2 + 0.75,
      rmse: Math.random() * 0.2 + 0.3,
      mae: Math.random() * 0.2 + 0.2,
    };
  } else {
    metrics = {
      accuracy: Math.random() * 0.1 + 0.88,
      precision: Math.random() * 0.1 + 0.87,
      recall: Math.random() * 0.1 + 0.89,
      confusionMatrix: [
        [Math.floor(Math.random() * 10 + 85), Math.floor(Math.random() * 5 + 1)],
        [Math.floor(Math.random() * 5 + 2), Math.floor(Math.random() * 10 + 90)],
      ],
    };
  }

  const featureImportance = selectedFeatures
    .map((feature) => ({
      feature,
      importance: Math.random(),
    }))
    .sort((a, b) => b.importance - a.importance);

  const history: Prediction[] = dataset.slice(0, 15).map((row, i) => {
    const actual = row[targetColumn];
    let prediction: number;
    if (task === 'regression') {
      prediction = actual * (Math.random() * 0.4 + 0.8);
    } else {
        const threshold = 10;
        prediction = row['alcohol'] > threshold ? (Math.random() > 0.1 ? 1 : 0) : (Math.random() > 0.9 ? 1 : 0);
    }

    const features = selectedFeatures.reduce((acc, feat) => {
      acc[feat] = row[feat];
      return acc;
    }, {} as Record<string, number>);

    return {
      id: `pred_${Date.now()}_${i}`,
      date: new Date().toISOString(),
      features,
      actual: actual,
      prediction: task === 'classification' ? prediction : parseFloat(prediction.toFixed(3)),
    };
  });
  
  const chartData = history.map(p => ({ actual: p.actual, prediction: p.prediction }));
  const decisionTree = generateMockTree(selectedFeatures);

  return { metrics, featureImportance, history, chartData, decisionTree };
};

export const useRandomForest = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [data, setData] = useState<Data>({
    dataset: housingDataset,
    metrics: null,
    featureImportance: [],
    history: [],
    chartData: null,
    insights: '',
    baselineMetrics: null,
    baselineFeatureImportance: [],
    baselineChartData: null,
    decisionTree: null,
  });
  const [status, setStatus] = useState<Status>('idle');
  const { toast } = useToast();
  const [isDebouncing, setIsDebouncing] = useState(false);

  useEffect(() => {
    const newDataset = state.task === 'regression' ? housingDataset : wineDataset;
    setData(d => ({...d, dataset: newDataset, baselineMetrics: null, metrics: null, decisionTree: null}));
    dispatch({ type: 'SET_HYPERPARAMETERS', payload: BASELINE_HYPERPARAMETERS });
  }, [state.task]);

  const handleStateChange = <T extends Action['type']>(type: T) => (payload: Extract<Action, { type: T }>['payload']) => {
    dispatch({ type, payload } as Action);
  };
  
  const trainModel = useCallback(async (isBaseline = false) => {
      setStatus('loading');
      try {
        const currentDataset = state.task === 'regression' ? housingDataset : wineDataset;
        const trainedData = await mockTrainModel(state, currentDataset, isBaseline);
        
        if (isBaseline) {
            // When training baseline, set both baseline and tuned model data to the same values
            setData(d => ({ 
                ...d, 
                ...trainedData,
                baselineMetrics: trainedData.metrics, 
                baselineFeatureImportance: trainedData.featureImportance, 
                baselineChartData: trainedData.chartData,
                insights: '' // Clear insights when training baseline
             }));
        } else {
            setData(d => ({ ...d, ...trainedData, insights: '' }));

            const featureImportancesForAI = trainedData.featureImportance.reduce((acc, item) => {
                acc[item.feature] = item.importance;
                return acc;
            }, {} as Record<string, number>);

            getFeatureImportanceInsights({
                featureImportances: featureImportancesForAI,
                targetColumn: state.targetColumn,
            }).then(insights => {
                setData(d => ({ ...d, insights }));
            }).catch(err => {
                console.error("AI insight generation failed:", err);
                setData(d => ({ ...d, insights: 'Could not generate AI insights.' }));
            });
        }

        setStatus('success');
        toast({ title: `Model Trained Successfully`, description: `${isBaseline ? 'Baseline' : 'Tuned'} model results are ready.` });
      } catch (error) {
        setStatus('error');
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        toast({ title: 'Training Error', description: errorMessage, variant: 'destructive' });
         if (isBaseline) {
             setData(d => ({ ...d, baselineMetrics: null, baselineFeatureImportance: [] }));
         } else {
            setData(d => ({ ...d, metrics: null, featureImportance: [], history: [] }));
         }
      }
    }, [state, toast]);
    
  const actions = {
    setTask: handleStateChange('SET_TASK'),
    setHyperparameters: handleStateChange('SET_HYPERPARAMETERS'),
    setSelectedFeatures: handleStateChange('SET_SELECTED_FEATURES'),
    setTargetColumn: handleStateChange('SET_TARGET_COLUMN'),
    setTestSize: handleStateChange('SET_TEST_SIZE'),
    trainModel: () => trainModel(false),
    trainBaselineModel: () => trainModel(true),
  };

  useEffect(() => {
    if (status === 'idle' && !data.baselineMetrics) return;

    // Do not auto-train if there is no baseline model trained yet,
    // unless it's the very first action.
    if (status === 'success' && !data.baselineMetrics && data.metrics) return;


    setIsDebouncing(true);
    const handler = setTimeout(() => {
        setIsDebouncing(false);
        // Do not auto-train if there's no baseline. The user must click a button first.
        if (data.baselineMetrics) {
           trainModel(false);
        }
    }, 1200);

    return () => {
      clearTimeout(handler);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.hyperparameters, state.targetColumn, state.testSize]);

  return { state, data, status, actions };
};

    