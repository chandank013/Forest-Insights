

export type TaskType = 'regression' | 'classification';

export type Hyperparameters = {
  n_estimators: number;
  max_depth: number;
  min_samples_split: number;
  min_samples_leaf: number;
  max_features: 'sqrt' | 'log2' | null;
  bootstrap: boolean;
  min_impurity_decrease: number;
  criterion: 'gini' | 'entropy';
  class_weight: 'balanced' | 'balanced_subsample' | null;
};

export type RegressionMetric = {
  r2: number;
  rmse: number;
  mae: number;
};

export type ClassificationMetric = {
  accuracy: number;
  precision: number;
  recall: number;
  confusionMatrix: number[][];
};

export type Metric = RegressionMetric | ClassificationMetric;

export type FeatureImportance = {
  feature: string;
  importance: number;
};

export type Prediction = {
  id: string;
  date: string;
  features: Record<string, number>;
  actual: number;
  prediction: number;
};

export type ChartDataPoint = {
  actual: number;
  prediction: number;
};

export type LeafNode = {
  type: 'leaf';
  value: number[]; // For regression: [value]. For classification: [class1_count, class2_count, ...]
  samples: number;
};

export type DecisionNode = {
  type: 'node';
  feature: string;
  threshold: number;
  samples: number;
  impurity: number;
  criterion: 'MSE' | 'Gini' | 'Entropy';
  value: number[]; // For regression: [value]. For classification: [class1-count, class2_count, ...]
  children: [DecisionTree, DecisionTree];
};

export type DecisionTree = DecisionNode | LeafNode;

export type CurveDataPoint = {
  x: number;
  y: number;
};

export type PdpPoint = {
  featureValue: number;
  prediction: number;
};

export type PdpData = {
  [feature: string]: PdpPoint[];
};

export type TreeSimulation = {
    id: number;
    prediction: number;
    keyFeatures: string[];
    tree: DecisionTree;
    samples: number;
};

export type ForestSimulation = {
    trees: TreeSimulation[];
};

export type DatasetOption = {
    name: string;
    value: string;
    data: Record<string, any>[];
    target: string;
}
