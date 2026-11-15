import React, { useState, useEffect } from 'react';
import { Customer } from '../../types';
import { X, Save, AlertCircle } from 'lucide-react';

interface CustomerFormProps {
  initialData?: Partial<Customer> | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Customer>) => Promise<void>;
  title?: string;
}

export const CustomerForm: React.FC<CustomerFormProps> = ({
  initialData,
  isOpen,
  onClose,
  onSubmit,
  title = 'Customer Form'
}) => {
  const [formData, setFormData] = useState<Partial<Customer>>({
    customer_code: '',
    gender: 'Male',
    senior_citizen: false,
    partner: 'No',
    dependents: 'No',
    tenure: 1,
    phone_service: 'Yes',
    multiple_lines: 'No',
    internet_service: 'DSL',
    online_security: 'No',
    online_backup: 'No',
    device_protection: 'No',
    tech_support: 'No',
    streaming_tv: 'No',
    streaming_movies: 'No',
    contract: 'Month-to-month',
    paperless_billing: 'Yes',
    payment_method: 'Electronic check',
    monthly_charges: 29.85,
    total_charges: 29.85,
    actual_churn: null
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        customer_code: `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
        gender: 'Male',
        senior_citizen: false,
        partner: 'No',
        dependents: 'No',
        tenure: 1,
        phone_service: 'Yes',
        multiple_lines: 'No',
        internet_service: 'DSL',
        online_security: 'No',
        online_backup: 'No',
        device_protection: 'No',
        tech_support: 'No',
        streaming_tv: 'No',
        streaming_movies: 'No',
        contract: 'Month-to-month',
        paperless_billing: 'Yes',
        payment_method: 'Electronic check',
        monthly_charges: 29.85,
        total_charges: 29.85,
        actual_churn: null
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'tenure' || name === 'monthly_charges' || name === 'total_charges') {
      const numVal = parseFloat(value) || 0;
      setFormData(prev => ({
        ...prev,
        [name]: numVal,
        ...(name === 'monthly_charges' && (!prev.total_charges || prev.total_charges === prev.monthly_charges) 
          ? { total_charges: numVal * (prev.tenure || 1) } 
          : {})
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!formData.customer_code?.trim()) {
      setError('Customer code is required.');
      return;
    }

    try {
      setLoading(true);
      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'An error occurred while saving.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <h3 className="font-bold text-slate-800 text-lg">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Section: Demographics */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-3">1. Customer Identification & Demographics</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Customer Code *</label>
                <input
                  type="text"
                  name="customer_code"
                  value={formData.customer_code || ''}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                <select
                  name="gender"
                  value={formData.gender || 'Male'}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-hidden"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Partner</label>
                <select
                  name="partner"
                  value={formData.partner || 'No'}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-hidden"
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Dependents</label>
                <select
                  name="dependents"
                  value={formData.dependents || 'No'}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-hidden"
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="senior_citizen"
                  name="senior_citizen"
                  checked={formData.senior_citizen || false}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 rounded-sm border-slate-300 focus:ring-blue-500"
                />
                <label htmlFor="senior_citizen" className="text-sm font-medium text-slate-700">Senior Citizen</label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tenure (Months)</label>
                <input
                  type="number"
                  name="tenure"
                  min="0"
                  value={formData.tenure ?? 1}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Section: Services */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-3">2. Subscribed Services</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Service</label>
                <select
                  name="phone_service"
                  value={formData.phone_service || 'Yes'}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-hidden"
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Internet Service</label>
                <select
                  name="internet_service"
                  value={formData.internet_service || 'DSL'}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-hidden"
                >
                  <option value="DSL">DSL</option>
                  <option value="Fiber optic">Fiber optic</option>
                  <option value="No">No</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Online Security</label>
                <select
                  name="online_security"
                  value={formData.online_security || 'No'}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-hidden"
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                  <option value="No internet service">No internet service</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tech Support</label>
                <select
                  name="tech_support"
                  value={formData.tech_support || 'No'}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-hidden"
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                  <option value="No internet service">No internet service</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section: Contract & Billing */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-3">3. Contract & Billing</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Contract Type</label>
                <select
                  name="contract"
                  value={formData.contract || 'Month-to-month'}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-hidden"
                >
                  <option value="Month-to-month">Month-to-month</option>
                  <option value="One year">One year</option>
                  <option value="Two year">Two year</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method</label>
                <select
                  name="payment_method"
                  value={formData.payment_method || 'Electronic check'}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-hidden"
                >
                  <option value="Electronic check">Electronic check</option>
                  <option value="Mailed check">Mailed check</option>
                  <option value="Bank transfer (automatic)">Bank transfer (automatic)</option>
                  <option value="Credit card (automatic)">Credit card (automatic)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Monthly Charges ($)</label>
                <input
                  type="number"
                  step="0.01"
                  name="monthly_charges"
                  value={formData.monthly_charges ?? 29.85}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Total Charges ($)</label>
                <input
                  type="number"
                  step="0.01"
                  name="total_charges"
                  value={formData.total_charges ?? 29.85}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md shadow-blue-600/20 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving...' : 'Save Customer'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
