import React, { useState } from 'react';
import { PredictionResult as IPredictionResult } from '../../types';
import { RiskIndicator } from './RiskIndicator';
import { 
  AlertCircle, 
  CheckCircle, 
  Info, 
  ChevronDown, 
  ChevronUp, 
  Calendar,
  Layers
} from 'lucide-react';

interface PredictionResultProps {
  result: IPredictionResult;
}

export const PredictionResult: React.FC<PredictionResultProps> = ({ result }) => {
  const [showSnapshot, setShowSnapshot] = useState(false);

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-lg space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Header Verdict */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Inference Result</span>
            {result.customer_code && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                {result.customer_code}
              </span>
            )}
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            {result.predicted_churn ? (
              <>
                <AlertCircle className="w-6 h-6 text-rose-600" />
                <span>Customer is Likely to Churn</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-6 h-6 text-emerald-600" />
                <span>Customer is Likely to Retain</span>
              </>
            )}
          </h2>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Layers className="w-4 h-4 text-blue-500" />
          <span>Model: <strong>{result.model_version}</strong></span>
        </div>
      </div>

      {/* Risk Indicator & Probability Gauge */}
      <RiskIndicator
        level={result.risk_level}
        probability={result.churn_probability}
      />

      {/* Key Risk Factors */}
      {result.top_risk_factors && result.top_risk_factors.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-blue-500" />
            <span>Key Contributing Risk Drivers</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {result.top_risk_factors.map((rf, idx) => (
              <div 
                key={idx}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex flex-col justify-between"
              >
                <span className="font-bold text-slate-800">{rf.factor}</span>
                <span className="text-[11px] text-slate-500 font-medium mt-1">{rf.impact}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Toggle Input Snapshot */}
      <div className="pt-2 border-t border-slate-100">
        <button
          onClick={() => setShowSnapshot(!showSnapshot)}
          className="flex items-center justify-between w-full text-xs font-bold text-slate-600 hover:text-slate-900 py-2 transition-colors"
        >
          <span>View Exact Features Input Snapshot</span>
          {showSnapshot ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showSnapshot && (
          <div className="mt-3 p-4 rounded-xl bg-slate-900 text-slate-200 text-xs font-mono overflow-x-auto max-h-56">
            <pre>{JSON.stringify(result.input_snapshot, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
};
