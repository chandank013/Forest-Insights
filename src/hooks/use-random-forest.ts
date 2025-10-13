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

// Simple pseudo-random number generator for deterministic results
const pseudoRandom = (seed: number) => {
    let x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
};

const generateMockTree = (features: string[], depth: number = 0, maxDepth: number = 2, seed = 1): DecisionTree => {
    if (depth === maxDepth || pseudoRandom(seed) < 0.4) {
        const value = pseudoRandom(seed * 2) > 0.5 ? 'Class 1' : 'Class 0';
        return {
            type: 'leaf',
            value,
            samples: Math.floor(pseudoRandom(seed * 3) * 50 + 10)
        };
    }

    const feature = features[Math.floor(pseudoRandom(seed * 4) * features.length)];
    const threshold = (pseudoRandom(seed * 5) * 10 + 5).toFixed(2);
    
    return {
        type: 'node',
        feature,
        threshold: parseFloat(threshold),
        samples: Math.floor(pseudoRandom(seed * 6) * 200 + 50),
        children: [
            generateMockTree(features, depth + 1, maxDepth, seed + 1),
            generateMockTree(features, depth + 1, maxDepth, seed + 2)
        ]
    };
};

// Function to create a deterministic seed from hyperparameters
const createSeed = (hyperparameters: Hyperparameters) => {
    let seed = 0;
    seed += hyperparameters.n_estimators;
    seed += hyperparameters.max_depth * 100;
    seed += hyperparameters.min_samples_split * 1000;
    seed += hyperparameters.min_samples_leaf * 10000;
    return seed;
};


const mockTrainModel = async (
  state: State,
  dataset: Record<string, any>[],
  isBaseline: boolean = false,
): Promise<Omit<Data, 'dataset' | 'insights' | 'baselineMetrics' | 'baselineFeatureImportance' | 'baselineChartData'>> => {
  await new Promise((res) => setTimeout(res, 1500));

  const { task, selectedFeatures, targetColumn } = state;
  const hyperparameters = isBaseline ? BASELINE_HYPERPARAMETERS : state.hyperparameters;

  const seed = createSeed(hyperparameters);

  let metrics: Data['metrics'];
  if (task === 'regression') {
     const baseR2 = 0.65 + (hyperparameters.max_depth / 100) + (hyperparameters.n_estimators / 5000);
    const baseRmse = 0.5 - (hyperparameters.max_depth / 150) - (hyperparameters.n_estimators / 7000);
    metrics = {
      r2: baseR2 + pseudoRandom(seed) * 0.05,
      rmse: baseRmse - pseudoRandom(seed * 2) * 0.05,
      mae: baseRmse * 0.8 - pseudoRandom(seed * 3) * 0.05,
    };
  } else {
    const baseAccuracy = 0.85 + (hyperparameters.n_estimators / 10000) - (hyperparameters.min_samples_split / 100);
    metrics = {
      accuracy: baseAccuracy + pseudoRandom(seed) * 0.02,
      precision: baseAccuracy - 0.01 + pseudoRandom(seed * 2) * 0.03,
      recall: baseAccuracy + 0.01 + pseudoRandom(seed * 3) * 0.02,
      confusionMatrix: [
        [Math.floor(85 + pseudoRandom(seed * 4) * 10), Math.floor(1 + pseudoRandom(seed * 5) * 5)],
        [Math.floor(2 + pseudoRandom(seed * 6) * 5), Math.floor(90 + pseudoRandom(seed * 7) * 10)],
      ],
    };
  }

  const featureImportance = selectedFeatures
    .map((feature, i) => ({
      feature,
      importance: pseudoRandom(seed + i * 10),
    }))
    .sort((a, b) => b.importance - a.importance);

  const history: Prediction[] = dataset.slice(0, 15).map((row, i) => {
    const actual = row[targetColumn];
    let prediction: number;
    const predSeed = seed + i;

    if (task === 'regression') {
       prediction = actual * (0.8 + pseudoRandom(predSeed) * 0.4);
    } else {
        const threshold = 10.5;
        // Deterministic prediction based on alcohol and a pseudo-random factor
        prediction = (row['alcohol'] + pseudoRandom(predSeed) * 2) > threshold ? 1 : 0;
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
  const decisionTree = generateMockTree(selectedFeatures, 0, 2, seed);

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
                metrics: trainedData.metrics, // Also set main metrics
                featureImportance: trainedData.featureImportance, // Also set main feature importance
                chartData: trainedData.chartData, // Also set main chart data
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
