
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
  CurveDataPoint,
  PdpData,
  DecisionNode,
  ForestSimulation,
  TreeSimulation,
  DatasetOption,
} from '@/lib/types';
import housingDataset from '@/lib/data/california-housing.json';
import wineDataset from '@/lib/data/wine-quality.json';
import diabetesDataset from '@/lib/data/diabetes.json';
import linnerudDataset from '@/lib/data/linnerud.json';
import breastCancerDataset from '@/lib/data/breast-cancer.json';
import digitsDataset from '@/lib/data/digits.json';

import { getFeatureImportanceInsights } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';

type Status = 'idle' | 'loading' | 'success' | 'error';

const BASELINE_HYPERPARAMETERS: Hyperparameters = {
  n_estimators: 10,
  max_depth: 3,
  min_samples_split: 2,
  min_samples_leaf: 1,
  max_features: 'sqrt',
  bootstrap: true,
  min_impurity_decrease: 0.0,
  criterion: 'gini',
  class_weight: null,
};

const DATASETS: Record<TaskType, DatasetOption[]> = {
    regression: [
        { name: 'California Housing (Real Estate / Geography)', value: 'california-housing', data: housingDataset, target: 'MedHouseVal' },
        { name: 'Diabetes (Medical / Health)', value: 'diabetes', data: diabetesDataset, target: 'DiseaseProgression' },
        { name: 'Linnerud (Physiological / Sports)', value: 'linnerud', data: linnerudDataset, target: 'Weight' },
    ],
    classification: [
        { name: 'Wine Quality (Chemistry / Food)', value: 'wine-quality', data: wineDataset, target: 'quality' },
        { name: 'Breast Cancer Wisconsin (Medical / Health)', value: 'breast-cancer', data: breastCancerDataset, target: 'Diagnosis' },
        { name: 'Digits Recognition (Image Recognition)', value: 'digits', data: digitsDataset, target: 'Digit' },
    ]
};

const getInitialStateForTask = (task: TaskType, datasetName: string): State => {
    const datasetOption = DATASETS[task].find(d => d.value === datasetName) ?? DATASETS[task][0];
    const dataset = datasetOption.data;
    const allHeaders = Object.keys(dataset[0] ?? {});
    const targetColumn = datasetOption.target;
    const selectedFeatures = allHeaders.filter(h => h !== targetColumn);

    return {
        task,
        datasetName: datasetOption.value,
        hyperparameters: BASELINE_HYPERPARAMETERS,
        selectedFeatures,
        targetColumn,
        testSize: 0.2,
    };
};


type State = {
  task: TaskType;
  datasetName: string;
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
  rocCurveData: CurveDataPoint[] | null;
  prCurveData: CurveDataPoint[] | null;
  pdpData: PdpData | null;
  forestSimulation: ForestSimulation | null;
};

type Action =
  | { type: 'SET_TASK'; payload: TaskType }
  | { type: 'SET_DATASET'; payload: string }
  | { type: 'SET_HYPERPARAMETERS'; payload: Partial<Hyperparameters> }
  | { type: 'SET_SELECTED_FEATURES'; payload: string[] }
  | { type: 'SET_TARGET_COLUMN'; payload: string }
  | { type: 'SET_TEST_SIZE'; payload: number };

const initialState: State = getInitialStateForTask('regression', 'california-housing');

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_TASK': {
        return getInitialStateForTask(action.payload, DATASETS[action.payload][0].value);
    }
    case 'SET_DATASET': {
        return getInitialStateForTask(state.task, action.payload);
    }
    case 'SET_HYPERPARAMETERS':
      return { ...state, hyperparameters: { ...state.hyperparameters, ...action.payload } };
    case 'SET_SELECTED_FEATURES':
      return { ...state, selectedFeatures: action.payload };
    case 'SET_TARGET_COLUMN': {
      return { ...state, targetColumn: action.payload };
    }
    case 'SET_TEST_SIZE':
        return { ...state, testSize: action.payload };
    default:
      return state;
  }
};

const pseudoRandom = (seed: number) => {
    let x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
};

const generateMockTree = (
    features: string[],
    task: TaskType,
    hyperparameters: Hyperparameters,
    depth: number = 0,
    seed = 1
): DecisionTree => {
    const nodeSeed = seed + depth * 10;
    
    // Termination conditions
    if (depth >= hyperparameters.max_depth || depth >= 10) { // Add a safety depth limit
        const samples = Math.floor(pseudoRandom(nodeSeed * 6) * (200 / (depth + 1)) + 10);
        let value: number[];
        if (task === 'regression') {
            value = [pseudoRandom(nodeSeed * 2) * 3 + 1];
        } else {
            const class1Samples = Math.floor(pseudoRandom(nodeSeed * 2) * samples);
            value = [samples - class1Samples, class1Samples];
        }
        return {
            type: 'leaf',
            value: value,
            samples: samples
        };
    }
    
    const samples = Math.floor(pseudoRandom(nodeSeed * 6) * (200 / (depth + 1)) + 50);

    let value: number[];
    let impurity: number;
    let criterion: DecisionNode['criterion'] = 'MSE';

    if (task === 'regression') {
        const baseValue = pseudoRandom(nodeSeed * 2) * 3 + 1;
        impurity = pseudoRandom(nodeSeed * 3); 
        value = [baseValue];
        criterion = 'MSE';
    } else { // classification
        const class1Samples = Math.floor(pseudoRandom(nodeSeed * 2) * samples);
        const class0Samples = samples - class1Samples;
        const p0 = class0Samples / samples;
        const p1 = class1Samples / samples;
        
        if (hyperparameters.criterion === 'entropy') {
            impurity = - (p0 * Math.log2(p0 || 1)) - (p1 * Math.log2(p1 || 1));
            criterion = 'Entropy';
        } else { // gini
            impurity = 1 - (p0**2 + p1**2);
            criterion = 'Gini';
        }
        value = [class0Samples, class1Samples];
    }
    
    const feature = features[Math.floor(pseudoRandom(nodeSeed * 4) * features.length)];
    const threshold = pseudoRandom(nodeSeed * 5) * 10 + 5;

    return {
        type: 'node',
        feature,
        threshold: threshold,
        samples: samples,
        impurity,
        value,
        criterion,
        children: [
            generateMockTree(features, task, hyperparameters, depth + 1, seed + 1),
            generateMockTree(features, task, hyperparameters, depth + 1, seed + 2)
        ]
    };
};

const createSeed = (state: State, salt: string = '') => {
    let seed = 0;
    const str = JSON.stringify(state.hyperparameters) + state.testSize + state.targetColumn + state.task + state.datasetName + salt;
    for (let i = 0; i < str.length; i++) {
        seed = (seed << 5) - seed + str.charCodeAt(i);
        seed |= 0; 
    }
    return seed;
};

const generateRocCurveData = (seed: number): CurveDataPoint[] => {
    const data: CurveDataPoint[] = [{ x: 0, y: 0 }];
    let lastY = 0;
    for (let i = 1; i <= 10; i++) {
        const x = i / 10;
        // Ensure TPR (y) is always >= FPR (x) and is monotonically increasing
        let newY = lastY + pseudoRandom(seed + i) * (1 - lastY) * 0.5;
        newY = Math.max(newY, lastY); // Ensure monotonic
        if (newY < x) {
          newY = x + pseudoRandom(seed - i) * (1-x)*0.2;
        }
        lastY = Math.min(newY, 1);
        data.push({ x, y: lastY });
    }
    data.push({ x: 1, y: 1 });
    
    // Make sure y is always >= x
    return data.map(p => ({ x: p.x, y: Math.max(p.x, p.y) })).sort((a,b) => a.x - b.x);
};

const generatePrCurveData = (seed: number): CurveDataPoint[] => {
    const data: CurveDataPoint[] = [];
    let lastPrecision = 1.0;

    // Start with high precision at low recall
    data.push({ x: 0.0, y: 1.0 });
    data.push({ x: 0.1, y: 0.98 + pseudoRandom(seed - 1) * 0.02 });

    for (let i = 2; i <= 10; i++) {
        const recall = i / 10;
        // Precision tends to drop as recall increases.
        const dropFactor = Math.pow(recall, 1.5);
        const drop = pseudoRandom(seed + i) * 0.4 * dropFactor;
        let newPrecision = lastPrecision - drop;
        
        // Add some noise to make it less smooth
        newPrecision += (pseudoRandom(seed - i) - 0.5) * 0.1;
        newPrecision = Math.max(0, Math.min(lastPrecision, newPrecision)); // Ensure it's non-increasing

        data.push({ x: recall, y: newPrecision });
        lastPrecision = newPrecision;
    }
    
    // Ensure the curve ends at a reasonable point.
    data.push({ x: 1, y: Math.max(0.1, data[data.length-1].y - pseudoRandom(seed+11)*0.2) });

    return data.sort((a,b) => a.x - b.x);
};


const generatePdpData = (features: string[], dataset: Record<string, any>[], task: TaskType, seed: number): PdpData => {
    const pdp: PdpData = {};
    features.forEach((feature, i) => {
        const featureSeed = seed + i * 100;
        const featureData = dataset.map(row => row[feature]).filter(val => typeof val === 'number') as number[];
        if(featureData.length === 0) return;

        const sortedUniqueValues = [...new Set(featureData)].sort((a, b) => a - b);
        const basePrediction = task === 'regression' ? 2.5 : 0.6;
        
        const effect = sortedUniqueValues.map((val, j) => {
            const pointSeed = featureSeed + j;
            const noise = (pseudoRandom(pointSeed) - 0.5) * 0.1;
            const trend = Math.sin(j / sortedUniqueValues.length * Math.PI * 2) * (task === 'regression' ? 0.5 : 0.2);
            return basePrediction + trend + noise;
        });

        pdp[feature] = sortedUniqueValues.map((value, index) => ({
            featureValue: value,
            prediction: effect[index],
        }));
    });
    return pdp;
};

const generateForestSimulation = (state: State, seed: number): ForestSimulation => {
    const { hyperparameters, selectedFeatures, task } = state;
    const numTrees = hyperparameters.n_estimators;

    const trees: TreeSimulation[] = Array.from({ length: numTrees }, (_, i) => {
        const treeSeed = seed + i * 50;
        const shuffledFeatures = [...selectedFeatures].sort(() => pseudoRandom(treeSeed) - 0.5);
        const mockTree = generateMockTree(selectedFeatures, task, hyperparameters, 0, treeSeed + 3);

        let prediction: number;
        if (task === 'regression') {
            prediction = 1 + pseudoRandom(treeSeed + 1) * 4;
        } else {
            prediction = pseudoRandom(treeSeed + 2) > 0.4 ? 1 : 0;
        }

        return {
            id: i,
            prediction,
            keyFeatures: shuffledFeatures.slice(0, 3),
            tree: mockTree,
            samples: mockTree.samples
        };
    });

    return { trees };
}


const mockTrainModel = async (
  state: State,
  dataset: Record<string, any>[],
  isBaseline: boolean = false,
): Promise<Omit<Data, 'dataset' | 'insights' | 'baselineMetrics' | 'baselineFeatureImportance' | 'baselineChartData'>> => {
  await new Promise((res) => setTimeout(res, 1500));

  const { task, selectedFeatures } = state;
  const hyperparameters = isBaseline ? BASELINE_HYPERPARAMETERS : state.hyperparameters;
  const stateForSeed = isBaseline ? { ...state, hyperparameters: BASELINE_HYPERPARAMETERS } : state;

  const seed = createSeed(stateForSeed, task);

  let metrics: Data['metrics'];
  let rocCurveData: CurveDataPoint[] | null = null;
  let prCurveData: CurveDataPoint[] | null = null;

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
    rocCurveData = generateRocCurveData(seed);
    prCurveData = generatePrCurveData(seed);
  }

  const featureImportance = selectedFeatures
    .map((feature, i) => ({
      feature,
      importance: pseudoRandom(seed + i * 10),
    }))
    .sort((a, b) => b.importance - a.importance);

  const history: Prediction[] = dataset.slice(0, 15).map((row, i) => {
    const actual = row[state.targetColumn];
    let prediction: number;
    const predSeed = seed + i;

    if (task === 'regression') {
       prediction = actual * (0.8 + pseudoRandom(predSeed) * 0.4);
    } else {
        const threshold = task === 'wine-quality' ? 10.5 : 0.5; // Different threshold for different datasets
        const featureToUse = task === 'wine-quality' ? 'alcohol' : selectedFeatures[0];
        prediction = (row[featureToUse] + pseudoRandom(predSeed) * 2) > threshold ? 1 : 0;
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
  const decisionTree = generateMockTree(selectedFeatures, task, hyperparameters, 0, seed);
  const pdpData = generatePdpData(selectedFeatures, dataset, task, seed);
  const forestSimulation = generateForestSimulation(state, seed);

  return { metrics, featureImportance, history, chartData, decisionTree, rocCurveData, prCurveData, pdpData, forestSimulation };
};

const mockPredict = (
    values: Record<string, number>,
    hyperparameters: Hyperparameters,
    taskType: TaskType,
    targetColumn: string,
    testSize: number
): Prediction => {
  const seedState = {
      hyperparameters,
      task: taskType,
      targetColumn,
      testSize,
      selectedFeatures: Object.keys(values),
      datasetName: ''
  };

  const seed = createSeed(seedState, 'predict');
  let prediction: number;

  if (taskType === 'regression') {
    prediction = Object.values(values).reduce((sum, v, i) => sum + v * pseudoRandom(seed + i), 0) / 
                 (Object.keys(values).length || 1);
    prediction = (prediction % 5) + pseudoRandom(seed+1) * 2;
  } else {
    const score = Object.values(values).reduce((sum, v, i) => sum + v * pseudoRandom(seed + i), 0);
    prediction = score > 50 ? 1 : 0;
  }

  return {
    id: `pred_${Date.now()}`,
    date: new Date().toISOString(),
    features: values,
    actual: -1, // No actual value for real-time prediction
    prediction: taskType === 'regression' ? parseFloat(prediction.toFixed(3)) : prediction,
  };
};

export const useRandomForest = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [data, setData] = useState<Data>({
    dataset: DATASETS['regression'][0].data,
    metrics: null,
    featureImportance: [],
    history: [],
    chartData: null,
    insights: '',
    baselineMetrics: null,
    baselineFeatureImportance: [],
    baselineChartData: null,
    decisionTree: null,
    rocCurveData: null,
    prCurveData: null,
    pdpData: null,
    forestSimulation: null,
  });
  const [status, setStatus] = useState<Status>('idle');
  const { toast } = useToast();
  const [isDebouncing, setIsDebouncing] = useState(false);

  useEffect(() => {
    const newDatasetOption = DATASETS[state.task].find(d => d.value === state.datasetName);
    const newDataset = newDatasetOption ? newDatasetOption.data : [];
    
    setData(d => ({
        ...d,
        dataset: newDataset,
        metrics: null,
        baselineMetrics: null,
        decisionTree: null,
        rocCurveData: null,
        prCurveData: null,
        pdpData: null,
        forestSimulation: null,
    }));
  }, [state.task, state.datasetName]);

  const handleStateChange = <T extends Action['type']>(type: T) => (payload: Extract<Action, { type: T }>['payload']) => {
    dispatch({ type, payload } as Action);
  };
  
  const trainModel = useCallback(async (isBaseline = false) => {
      if (isBaseline) {
        dispatch({ type: 'SET_HYPERPARAMETERS', payload: BASELINE_HYPERPARAMETERS });
      }
      setStatus('loading');
      try {
        const currentDataset = DATASETS[state.task].find(d => d.value === state.datasetName)?.data ?? [];
        
        const stateForTraining = isBaseline ? { ...state, hyperparameters: BASELINE_HYPERPARAMETERS } : state;

        const trainedData = await mockTrainModel(stateForTraining, currentDataset, isBaseline);
        
        const updateInsights = (featureImportance: FeatureImportance[]) => {
            if (featureImportance.length === 0) {
                setData(d => ({ ...d, insights: 'Could not generate AI insights.' }));
                return;
            }
            const featureImportancesForAI = featureImportance.reduce((acc, item) => {
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
        
        if (isBaseline) {
            setData(d => ({ 
                ...d, 
                baselineMetrics: trainedData.metrics, 
                baselineFeatureImportance: trainedData.featureImportance, 
                baselineChartData: trainedData.chartData,
                metrics: trainedData.metrics, // also set current metrics
                featureImportance: trainedData.featureImportance,
                chartData: trainedData.chartData,
                history: trainedData.history,
                decisionTree: trainedData.decisionTree,
                rocCurveData: trainedData.rocCurveData,
                prCurveData: trainedData.prCurveData,
                pdpData: trainedData.pdpData,
                forestSimulation: trainedData.forestSimulation,
                insights: '',
             }));
             updateInsights(trainedData.featureImportance);
        } else {
            setData(d => ({ ...d, ...trainedData, insights: '' }));
            updateInsights(trainedData.featureImportance);
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
    
    const predict = useCallback(async (values: Record<string, number>): Promise<Prediction> => {
        await new Promise(res => setTimeout(res, 1000));
        return mockPredict(values, state.hyperparameters, state.task, state.targetColumn, state.testSize);
    }, [state.hyperparameters, state.task, state.targetColumn, state.testSize]);

  const actions = {
    setTask: handleStateChange('SET_TASK'),
    setDataset: handleStateChange('SET_DATASET'),
    setHyperparameters: handleStateChange('SET_HYPERPARAMETERS'),
    setSelectedFeatures: handleStateChange('SET_SELECTED_FEATURES'),
    setTargetColumn: handleStateChange('SET_TARGET_COLUMN'),
    setTestSize: handleStateChange('SET_TEST_SIZE'),
    trainModel: () => trainModel(false),
    trainBaselineModel: () => trainModel(true),
    predict,
  };

  useEffect(() => {
    if (status === 'idle') return;

    setIsDebouncing(true);
    const handler = setTimeout(() => {
        setIsDebouncing(false);
        actions.trainModel();
    }, 1200);

    return () => {
      clearTimeout(handler);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(state.hyperparameters), state.targetColumn, state.testSize, state.datasetName]);

  return { state, data, status, actions, availableDatasets: DATASETS[state.task] };
};
