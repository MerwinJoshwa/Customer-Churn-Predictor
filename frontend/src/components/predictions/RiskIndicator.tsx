import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon } from 'lucide-react';

interface RiskIndicatorProps {
  level: 'LOW' | 'MEDIUM' | 'HIGH';
  probability?: number;
  showBadgeOnly?: boolean;
}

export const RiskIndicator: React.FC<RiskIndicatorProps> = ({
  level,
  probability,
  showBadgeOnly = false
}) => {
  const config = {
    LOW: {
      label: 'Low Risk',
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      bar: 'bg-emerald-500',
      icon: ShieldCheck,
      desc: 'Customer is stable and likely to stay with the company.'
    },
    MEDIUM: {
      label: 'Medium Risk',
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      bar: 'bg-amber-500',
      icon: AlertTriangle,
      desc: 'Customer exhibits moderate attrition signs; proactive engagement recommended.'
    },
    HIGH: {
      label: 'High Risk',
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-200',
      bar: 'bg-rose-500',
      icon: AlertOctagon,
      desc: 'High churn probability. Immediate retention action or promotion required.'
    }
  }[level] || {
    label: 'Unknown',
    bg: 'bg-slate-50',
    text: 'text-slate-700',
    border: 'border-slate-200',
    bar: 'bg-slate-400',
    icon: ShieldCheck,
    desc: 'Unclassified risk level'
  };

  const Icon = config.icon;

  if (showBadgeOnly) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${config.bg} ${config.text} border ${config.border}`}>
        <Icon className="w-3.5 h-3.5" />
        <span>{config.label}</span>
      </span>
    );
  }

  const probPercent = probability !== undefined ? Math.round(probability * 100) : 0;

  return (
    <div className={`rounded-2xl p-5 ${config.bg} border ${config.border} flex flex-col gap-3`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-xl bg-white shadow-xs ${config.text}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <span className={`text-base font-extrabold ${config.text}`}>{config.label}</span>
            <span className="block text-xs text-slate-500 font-medium">Risk Assessment</span>
          </div>
        </div>
        {probability !== undefined && (
          <div className="text-right">
            <span className={`text-2xl font-black ${config.text}`}>{probPercent}%</span>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Churn Likelihood</span>
          </div>
        )}
      </div>

      {probability !== undefined && (
        <div className="w-full bg-white/80 rounded-full h-2.5 overflow-hidden p-0.5 border border-slate-200">
          <div
            className={`h-full rounded-full transition-all duration-500 ${config.bar}`}
            style={{ width: `${Math.min(probPercent, 100)}%` }}
          />
        </div>
      )}

      <p className="text-xs text-slate-600 font-medium leading-relaxed">{config.desc}</p>
    </div>
  );
};
