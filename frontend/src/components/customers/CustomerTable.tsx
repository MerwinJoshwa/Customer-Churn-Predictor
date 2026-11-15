import React from 'react';
import { Customer } from '../../types';
import { Eye, Zap, Trash2, Edit3, ShieldAlert, CheckCircle2, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CustomerTableProps {
  customers: Customer[];
  onEdit?: (customer: Customer) => void;
  onDelete?: (id: number) => void;
  onSelect?: (customer: Customer) => void;
}

export const CustomerTable: React.FC<CustomerTableProps> = ({
  customers,
  onEdit,
  onDelete,
  onSelect
}) => {
  const navigate = useNavigate();

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            <th className="py-3.5 px-4">Customer ID</th>
            <th className="py-3.5 px-4">Contract</th>
            <th className="py-3.5 px-4">Tenure</th>
            <th className="py-3.5 px-4">Internet</th>
            <th className="py-3.5 px-4">Monthly Fee</th>
            <th className="py-3.5 px-4">Total Paid</th>
            <th className="py-3.5 px-4">Actual Status</th>
            <th className="py-3.5 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm">
          {customers.length === 0 ? (
            <tr>
              <td colSpan={8} className="py-12 text-center text-slate-400">
                No customer records found matching criteria.
              </td>
            </tr>
          ) : (
            customers.map((c) => (
              <tr 
                key={c.id} 
                className="hover:bg-blue-50/40 transition-colors group"
              >
                <td className="py-3.5 px-4 font-semibold text-slate-900 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  {c.customer_code}
                </td>
                <td className="py-3.5 px-4">
                  <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${
                    c.contract === 'Month-to-month' 
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {c.contract}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-slate-600 font-medium">
                  {c.tenure} mos
                </td>
                <td className="py-3.5 px-4 text-slate-600">
                  {c.internet_service || 'None'}
                </td>
                <td className="py-3.5 px-4 font-semibold text-slate-900">
                  ${Number(c.monthly_charges).toFixed(2)}
                </td>
                <td className="py-3.5 px-4 text-slate-600">
                  ${Number(c.total_charges).toFixed(2)}
                </td>
                <td className="py-3.5 px-4">
                  {c.actual_churn === true ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                      <ShieldAlert className="w-3 h-3" /> Churned
                    </span>
                  ) : c.actual_churn === false ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" /> Retained
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
                      <HelpCircle className="w-3 h-3" /> Unknown
                    </span>
                  )}
                </td>
                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-1.5 opacity-90 group-hover:opacity-100">
                    <button
                      onClick={() => navigate('/predict', { state: { customer: c } })}
                      title="Run ML Churn Prediction"
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white transition-colors"
                    >
                      <Zap className="w-3 h-3" />
                      <span>Predict</span>
                    </button>
                    <button
                      onClick={() => navigate(`/customers/${c.id}`)}
                      title="View Customer Details"
                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {onEdit && (
                      <button
                        onClick={() => onEdit(c)}
                        title="Edit Customer"
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(c.id)}
                        title="Delete Customer"
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
