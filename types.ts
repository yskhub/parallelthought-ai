
export interface PerspectiveData {
  recommendation: string;
  confidence: number;
  reasoning: string;
  key_points: string[];
  metrics: Array<{ label: string; value: string }>;
}

export interface Perspectives {
  security: PerspectiveData;
  performance: PerspectiveData;
  cost: PerspectiveData;
  developer: PerspectiveData;
  business: PerspectiveData;
}

export interface ConflictResolution {
  conflict: string;
  resolution: string;
  tradeoff: string;
}

export interface Synthesis {
  final_recommendation: string;
  confidence: number;
  reasoning_chain: string[];
  consensus_points: string[];
  conflicts_resolved: ConflictResolution[];
  action_plan: string[];
  outcomes: Record<string, string>;
}

export interface Weights {
  security: number;
  performance: number;
  cost: number;
  developer: number;
  business: number;
}

export interface AnalysisResult {
  id?: string;
  timestamp?: number;
  problem: string;
  context: string;
  perspectives: Perspectives;
  synthesis: Synthesis;
  weights: Weights;
}

export interface SavedScenario {
  id: string;
  timestamp: number;
  problem: string;
  context: string;
  weights: Weights;
  result: AnalysisResult | null;
}
