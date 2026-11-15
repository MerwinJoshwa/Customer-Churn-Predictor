import React, { useEffect, useState } from 'react';
import { PredictionHistoryItem } from '../types';
import { predictionService } from '../services/predictionService';
import { RiskIndicator } from '../components/predictions/RiskIndicator';
import { 
  History, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  X, 
  RotateCcw,
  Clock,
  Layers,
  UserCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const PredictionHistory: React.FC = () => {
  const [history, setHistory] = useState<PredictionHistoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [riskLevel, setRiskLevel] = useState('ALL');

  // Snapshot modal
  const [activeSnapshot, setActiveSnapshot] = useState<Record<string, any> | null>(null);

  const navigate = useNavigate();

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await predictionService.getPredictionHistory(page, limit, search, riskLevel);
      setHistory(res.items);
      setTotal(res.total);
    } catch (err) {
      console.error('Failed to load prediction history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [page, riskLevel]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchHistory();
  };

  const handleResetFilters = () => {
    setSearch('');
    setRiskLevel('ALL');
    setPage(1);
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <History className="w-6 h-6 text-blue-600" />
          <span>Prediction History Audit Log</span>
        </h2>
        <p className="text-sm text-slate-500 font-medium">
          Comprehensive log of model predictions with preserved input snapshots and probability records
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Customer ID (e.g. CUST-1042)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-hidden font-medium"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Risk Level:</span>
            <select
              value={riskLevel}
              onChange={(e) => {
                setRiskLevel(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-800 outline-hidden"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="LOW">Low Risk (&lt;40%)</option>
              <option value="MEDIUM">Medium Risk (40-70%)</option>
              <option value="HIGH">High Risk (≥70%)</option>
            </select>
          </div>

          {(search || riskLevel !== 'ALL') && (
            <button
              onClick={handleResetFilters}
              title="Reset Filters"
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
        {loading ? (
          <div className="py-16 text-center">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs font-semibold text-slate-500">Loading prediction log...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3.5 px-4">Customer ID</th>
                    <th className="py-3.5 px-4">Risk Level</th>
                    <th className="py-3.5 px-4">Probability</th>
                    <th className="py-3.5 px-4">Predicted Verdict</th>
                    <th className="py-3.5 px-4">Model Ver</th>
                    <th className="py-3.5 px-4">Evaluated By</th>
                    <th className="py-3.5 px-4">Timestamp</th>
                    <th className="py-3.5 px-4 text-right">Snapshot</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {history.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        No prediction history records found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    history.map((item) => (
                      <tr key={item.id} className="hover:bg-blue-50/40 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-slate-900">
                          {item.customer_id ? (
                            <button
                              onClick={() => navigate(`/customers/${item.customer_id}`)}
                              className="text-blue-600 hover:underline flex items-center gap-1.5"
                            >
                              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                              {item.customer_code}
                            </button>
                          ) : (
                            <span className="text-slate-700">{item.customer_code}</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <RiskIndicator level={item.risk_level} showBadgeOnly />
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-800">
                          {(item.churn_probability * 100).toFixed(1)}%
                        </td>
                        <td className="py-3.5 px-4">
                          {item.predicted_churn ? (
                            <span className="font-semibold text-rose-600">Likely to Churn</span>
                          ) : (
                            <span className="font-semibold text-emerald-600">Likely to Stay</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-xs font-mono text-slate-500">
                          {item.model_version}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-600 font-medium">
                          {item.created_by_name || 'Analyst'}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-500 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{item.created_at ? new Date(item.created_at).toLocaleString() : 'Recent'}</span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => setActiveSnapshot(item.input_snapshot)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-100">
              <span className="text-xs font-semibold text-slate-500">
                Showing {history.length} of {total.toLocaleString()} total inferences (Page {page} of {totalPages})
              </span>

              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Previous
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none"
                >
                  Next <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Snapshot Modal */}
      {activeSnapshot && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-800 text-sm">Input Snapshot at Prediction Time</h3>
              <button
                onClick={() => setActiveSnapshot(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto bg-slate-950 text-slate-200 text-xs font-mono rounded-b-2xl">
              <pre>{JSON.stringify(activeSnapshot, null, 2)}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
