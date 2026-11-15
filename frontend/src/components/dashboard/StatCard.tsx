import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  badge?: string;
  color?: 'blue' | 'rose' | 'amber' | 'emerald';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  description,
  badge,
  color = 'blue'
}) => {
  const colorStyles = {
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      border: 'border-blue-100',
      accent: 'bg-blue-600'
    },
    rose: {
      bg: 'bg-rose-50',
      text: 'text-rose-600',
      border: 'border-rose-100',
      accent: 'bg-rose-600'
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      border: 'border-amber-100',
      accent: 'bg-amber-600'
    },
    emerald: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      border: 'border-emerald-100',
      accent: 'bg-emerald-600'
    }
  }[color];

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <span className="text-sm font-semibold text-slate-500">{title}</span>
        <div className={`p-2.5 rounded-xl ${colorStyles.bg} ${colorStyles.text} ${colorStyles.border} border`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{value}</span>
          {badge && (
            <span className={`text-xs px-2 py-0.5 rounded-md font-bold ${colorStyles.bg} ${colorStyles.text}`}>
              {badge}
            </span>
          )}
        </div>
        {description && (
          <p className="text-xs text-slate-500 mt-1 font-medium">{description}</p>
        )}
      </div>
    </div>
  );
};
