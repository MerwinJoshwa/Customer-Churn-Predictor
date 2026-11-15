import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface RiskChartProps {
  low: number;
  medium: number;
  high: number;
}

export const RiskChart: React.FC<RiskChartProps> = ({ low, medium, high }) => {
  const data = [
    { name: 'Low Risk (<40%)', count: low, color: '#10b981' },
    { name: 'Medium (40-70%)', count: medium, color: '#f59e0b' },
    { name: 'High Risk (≥70%)', count: high, color: '#ef4444' }
  ];

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-slate-800 text-base">Prediction Risk Distribution</h3>
          <p className="text-xs text-slate-500 font-medium">Model classified risk levels</p>
        </div>
      </div>

      <div className="flex-1 min-h-[240px]">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data} margin={{ top: 20, right: 10, left: -20, bottom: 10 }}>
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <Tooltip
              formatter={(val: any) => [`${Number(val).toLocaleString()} predictions`, 'Volume']}
              contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Bar dataKey="count" radius={[8, 8, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
