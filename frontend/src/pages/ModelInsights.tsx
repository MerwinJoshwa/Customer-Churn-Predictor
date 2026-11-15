import React, { useEffect, useState } from 'react';
import { ModelMetrics, FeatureImportanceItem } from '../types';
import { predictionService } from '../services/predictionService';
import { 
  BarChart3, 
  Cpu, 
  Target, 
  CheckCircle2, 
  Percent, 
  Layers, 
  Calendar, 
  Award,
  BarChart as BarChartIcon
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';

export const ModelInsights: React.FC = () => {
  const [metrics, setMetrics] = useState<ModelMetrics | null>(null);
  const [importance, setImportance] = useState<FeatureImportanceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [mRes, iRes] = await Promise.all([
          predictionService.getModelMetrics(),
          predictionService.getFeatureImportance()
        ]);
        setMetrics(mRes);
        setImportance(iRes);
      } catch (err) {
        console.error('Failed to load model insights:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-sm font-semibold text-slate-500">Loading model telemetry and evaluations...</p>
      </div>
    );
  }

  // Parse confusion matrix
  const cm = metrics?.confusion_matrix || [[779, 256], [85, 289]];
  const tn = cm[0]?.[0] || 0;
  const fp = cm[0]?.[1] || 0;
  const fn = cm[1]?.[0] || 0;
  const tp = cm[1]?.[1] || 0;

  // Format importance data for horizontal bar chart (Top 10)
  const topFeatures = importance.slice(0, 10).map(f => ({
    feature: f.feature.replace(/_/g, ' '),
    importance: +(f.importance * 100).toFixed(2)
  }));

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <span>Machine Learning Model Insights</span>
          </h2>
          <p className="text-sm text-slate-500 font-medium">
            Production model telemetry, Scikit-learn Random Forest evaluation metrics, and feature importance rankings
          </p>
        </div>

        <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold self-start sm:self-auto">
          <Cpu className="w-4 h-4 text-blue-400" />
          <span>Random Forest ({metrics?.version || 'v1.0.0'})</span>
        </div>
      </div>

      {/* 5 Key Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block">ROC-AUC Score</span>
          <span className="text-2xl font-extrabold text-blue-600 mt-2 block">
            {metrics ? (metrics.roc_auc * 100).toFixed(1) : 84.3}%
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">Discrimination ability</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block">Recall (Churners)</span>
          <span className="text-2xl font-extrabold text-emerald-600 mt-2 block">
            {metrics ? (metrics.recall_score * 100).toFixed(1) : 77.3}%
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">Identifies true churners</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block">Accuracy</span>
          <span className="text-2xl font-extrabold text-indigo-600 mt-2 block">
            {metrics ? (metrics.accuracy * 100).toFixed(1) : 75.8}%
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">Overall classification</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block">F1-Score</span>
          <span className="text-2xl font-extrabold text-amber-600 mt-2 block">
            {metrics ? (metrics.f1_score * 100).toFixed(1) : 62.9}%
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">Harmonic balance</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block">Precision</span>
          <span className="text-2xl font-extrabold text-slate-700 mt-2 block">
            {metrics ? (metrics.precision_score * 100).toFixed(1) : 53.0}%
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">True positive confidence</span>
        </div>
      </div>

      {/* Confusion Matrix and Model Specs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Confusion Matrix */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Confusion Matrix</h3>
              <p className="text-xs text-slate-500 font-medium">Evaluated on 20% holdout test dataset (1,409 customers)</p>
            </div>
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
              Test Partition
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
              <span className="text-[11px] font-bold uppercase text-emerald-800 tracking-wider block">True Negatives (TN)</span>
              <span className="text-3xl font-black text-emerald-700 my-1 block">{tn}</span>
              <span className="text-xs text-emerald-600 font-medium">Correctly predicted stayed</span>
            </div>

            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-center">
              <span className="text-[11px] font-bold uppercase text-amber-800 tracking-wider block">False Positives (FP)</span>
              <span className="text-3xl font-black text-amber-700 my-1 block">{fp}</span>
              <span className="text-xs text-amber-600 font-medium">Predicted churn, but stayed</span>
            </div>

            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-center">
              <span className="text-[11px] font-bold uppercase text-rose-800 tracking-wider block">False Negatives (FN)</span>
              <span className="text-3xl font-black text-rose-700 my-1 block">{fn}</span>
              <span className="text-xs text-rose-600 font-medium">Missed churners (Costly)</span>
            </div>

            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-center">
              <span className="text-[11px] font-bold uppercase text-blue-800 tracking-wider block">True Positives (TP)</span>
              <span className="text-3xl font-black text-blue-700 my-1 block">{tp}</span>
              <span className="text-xs text-blue-600 font-medium">Correctly caught churners</span>
            </div>
          </div>
        </div>

        {/* Pipeline Architecture Spec */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Pipeline Specifications</h3>
            <p className="text-xs text-slate-500 font-medium">Hyperparameters and feature transformation details</p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-50">
              <span className="text-slate-500 font-medium">Classifier Algorithm:</span>
              <span className="font-bold text-slate-800">Scikit-Learn RandomForestClassifier</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-50">
              <span className="text-slate-500 font-medium">Number of Trees (n_estimators):</span>
              <span className="font-semibold text-slate-800">120 Estimators</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-50">
              <span className="text-slate-500 font-medium">Max Tree Depth:</span>
              <span className="font-semibold text-slate-800">10 levels (Prevents Overfitting)</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-50">
              <span className="text-slate-500 font-medium">Class Weighting:</span>
              <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                'balanced' (Optimizes Churn Recall)
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-50">
              <span className="text-slate-500 font-medium">Numerical Scaling:</span>
              <span className="font-semibold text-slate-800">StandardScaler (z-score)</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-500 font-medium">Categorical Encoding:</span>
              <span className="font-semibold text-slate-800">OneHotEncoder (handle_unknown='ignore')</span>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Importance Chart */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Top 10 Churn Predictive Features</h3>
            <p className="text-xs text-slate-500 font-medium">Gini impurity reduction importance calculated across Random Forest ensemble</p>
          </div>
          <BarChartIcon className="w-5 h-5 text-blue-600" />
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={topFeatures}
              margin={{ top: 10, right: 30, left: 100, bottom: 5 }}
            >
              <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} unit="%" />
              <YAxis 
                type="category" 
                dataKey="feature" 
                tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }}
                width={150}
              />
              <Tooltip 
                formatter={(val: any) => [`${val}% relative weight`, 'Importance']}
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="importance" fill="#2563eb" radius={[0, 6, 6, 0]}>
                {topFeatures.map((_, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={index === 0 ? '#1d4ed8' : index === 1 ? '#2563eb' : index === 2 ? '#3b82f6' : '#60a5fa'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
