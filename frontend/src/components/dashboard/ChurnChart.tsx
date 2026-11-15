import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface ChurnChartProps {
  churned: number;
  retained: number;
}

export const ChurnChart: React.FC<ChurnChartProps> = ({ churned, retained }) => {
  const data = [
    { name: 'Retained Customers', value: retained, color: '#10b981' },
    { name: 'Churned Customers', value: churned, color: '#ef4444' }
  ];

  const total = churned + retained;
  const churnRate = total > 0 ? ((churned / total) * 100).toFixed(1) : '0';

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-slate-800 text-base">Churn vs. Retention</h3>
          <p className="text-xs text-slate-500 font-medium">Historical ratio across dataset</p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
          {total.toLocaleString()} Total
        </span>
      </div>

      <div className="relative flex-1 min-h-[240px] flex items-center justify-center">
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={90}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: any) => [`${Number(value).toLocaleString()} customers`, '']}
              contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36} 
              iconType="circle"
              formatter={(value) => <span className="text-xs font-semibold text-slate-700">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Center label */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-9 text-center pointer-events-none">
          <span className="text-2xl font-black text-slate-900">{churnRate}%</span>
          <span className="block text-[11px] font-bold uppercase text-slate-400">Churn Rate</span>
        </div>
      </div>
    </div>
  );
};
