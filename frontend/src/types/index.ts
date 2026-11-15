export interface User {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'ANALYST';
  created_at?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Customer {
  id: number;
  customer_code: string;
  gender: string;
  senior_citizen: boolean;
  partner: string;
  dependents: string;
  tenure: number;
  phone_service: string;
  multiple_lines: string;
  internet_service: string;
  online_security: string;
  online_backup: string;
  device_protection: string;
  tech_support: string;
  streaming_tv: string;
  streaming_movies: string;
  contract: string;
  paperless_billing: string;
  payment_method: string;
  monthly_charges: number;
  total_charges: number;
  actual_churn: boolean | null;
  created_at?: string;
  updated_at?: string;
}

export interface CustomerListResponse {
  total: number;
  page: number;
  limit: number;
  items: Customer[];
}

export interface PredictionInput {
  customer_id?: number;
  gender: string;
  SeniorCitizen: number;
  Partner: string;
  Dependents: string;
  tenure: number;
  PhoneService: string;
  MultipleLines: string;
  InternetService: string;
  OnlineSecurity: string;
  OnlineBackup: string;
  DeviceProtection: string;
  TechSupport: string;
  StreamingTV: string;
  StreamingMovies: string;
  Contract: string;
  PaperlessBilling: string;
  PaymentMethod: string;
  MonthlyCharges: number;
  TotalCharges: number;
}

export interface RiskFactor {
  factor: string;
  impact: string;
}

export interface PredictionResult {
  id?: number;
  customer_id?: number;
  customer_code?: string;
  predicted_churn: boolean;
  churn_probability: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  input_snapshot: Record<string, any>;
  model_version: string;
  created_at?: string;
  created_by_name?: string;
  top_risk_factors?: RiskFactor[];
}

export interface PredictionHistoryItem {
  id: number;
  customer_id?: number;
  customer_code: string;
  predicted_churn: boolean;
  churn_probability: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  input_snapshot: Record<string, any>;
  model_version: string;
  created_at: string;
  created_by_name: string;
}

export interface PredictionHistoryResponse {
  total: number;
  page: number;
  limit: number;
  items: PredictionHistoryItem[];
}

export interface DashboardAnalytics {
  total_customers: number;
  overall_churn_rate: number;
  high_risk_count: number;
  medium_risk_count: number;
  low_risk_count: number;
  total_predictions: number;
  churn_distribution: {
    churned: number;
    retained: number;
    unknown: number;
  };
  contract_distribution: Record<string, number>;
  payment_method_distribution: Record<string, number>;
  recent_high_risk: Array<{
    id: number;
    customer_id?: number;
    customer_code: string;
    churn_probability: number;
    risk_level: string;
    created_at: string;
  }>;
}

export interface ModelMetrics {
  id: number;
  version: string;
  model_name: string;
  accuracy: number;
  precision_score: number;
  recall_score: number;
  f1_score: number;
  roc_auc: number;
  confusion_matrix: number[][];
  trained_at?: string;
  is_active: boolean;
}

export interface FeatureImportanceItem {
  feature: string;
  importance: number;
}
