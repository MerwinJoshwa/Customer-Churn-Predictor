import api from './api';
import { 
  PredictionInput, 
  PredictionResult, 
  PredictionHistoryResponse, 
  DashboardAnalytics,
  ModelMetrics,
  FeatureImportanceItem
} from '../types';

export const predictionService = {
  predictChurn: async (inputData: PredictionInput): Promise<PredictionResult> => {
    const response = await api.post<PredictionResult>('/predictions', inputData);
    return response.data;
  },

  getPredictionHistory: async (
    page: number = 1,
    limit: number = 20,
    customer_code?: string,
    risk_level?: string
  ): Promise<PredictionHistoryResponse> => {
    const params: Record<string, any> = { page, limit };
    if (customer_code) params.customer_code = customer_code;
    if (risk_level && risk_level !== 'ALL') params.risk_level = risk_level;

    const response = await api.get<PredictionHistoryResponse>('/predictions', { params });
    return response.data;
  },

  getDashboardAnalytics: async (): Promise<DashboardAnalytics> => {
    const response = await api.get<DashboardAnalytics>('/analytics/overview');
    return response.data;
  },

  getModelMetrics: async (): Promise<ModelMetrics> => {
    const response = await api.get<ModelMetrics>('/model/metrics');
    return response.data;
  },

  getFeatureImportance: async (): Promise<FeatureImportanceItem[]> => {
    const response = await api.get<FeatureImportanceItem[]>('/model/feature-importance');
    return response.data;
  }
};
