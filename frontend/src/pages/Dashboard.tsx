import React, { useEffect, useState } from 'react';
import { 
  Users, 
  TrendingDown, 
  AlertTriangle, 
  Cpu, 
  Zap, 
  ArrowRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { StatCard } from '../components/dashboard/StatCard';
import { ChurnChart } from '../components/dashboard/ChurnChart';
import { RiskChart } from '../components/dashboard/RiskChart';
import { predictionService } from '../services/predictionService';
import { DashboardAnalytics } from '../types';
import { useNavigate } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await predictionService.getDashboardAnalytics();
      setData(res);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-slate-500">Loading Intelligence Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-center">
        <p className="text-sm font-semibold text-rose-700">{error || 'Could not load data'}</p>
        <button 
          onClick={fetchDashboardData}
          className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Executive Churn Overview</h2>
          <p className="text-sm text-slate-500 font-medium">Real-time telecommunications retention metrics and machine learning risk monitoring</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/predict')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-md shadow-blue-600/20 transition-all"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>New Prediction</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Customers"
          value={data.total_customers.toLocaleString()}
          icon={Users}
          description="Tracked enterprise accounts"
          color="blue"
        />

        <StatCard
          title="Overall Churn Rate"
          value={`${data.overall_churn_rate}%`}
          icon={TrendingDown}
          description="Historical baseline rate"
          color="rose"
        />

        <StatCard
          title="High-Risk Inferences"
          value={data.high_risk_count.toLocaleString()}
          icon={AlertTriangle}
          badge="Action Required"
          description="Probability ≥ 70%"
          color="amber"
        />

        <StatCard
          title="Total ML Predictions"
          value={data.total_predictions.toLocaleString()}
          icon={Cpu}
          description="Evaluated customer snapshots"
          color="emerald"
        />
      </div>

      {/* Visual Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChurnChart
          churned={data.churn_distribution.churned}
          retained={data.churn_distribution.retained}
        />

        <RiskChart
          low={data.low_risk_count}
          medium={data.medium_risk_count}
          high={data.high_risk_count}
        />
      </div>

      {/* Recent High-Risk Customers List */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent High-Risk Customer Alerts</h3>
            <p className="text-xs text-slate-500 font-medium">Inferences requiring proactive customer success intervention</p>
          </div>
          <button
            onClick={() => navigate('/predictions')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
          >
            <span>Full History</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {data.recent_high_risk.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-sm">
            No high-risk predictions recorded yet. Run a prediction to see immediate results.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.recent_high_risk.map((item) => (
              <div 
                key={item.id}
                className="p-4 rounded-xl border border-rose-100 bg-rose-50/40 hover:bg-rose-50/80 transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-slate-900">{item.customer_code}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                      HIGH RISK
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 font-medium mt-1 block">
                    Churn Likelihood: <strong className="text-rose-600 font-bold">{Math.round(item.churn_probability * 100)}%</strong>
                  </span>
                </div>

                {item.customer_id && (
                  <button
                    onClick={() => navigate(`/customers/${item.customer_id}`)}
                    className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 transition-colors"
                    title="Inspect Profile"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
