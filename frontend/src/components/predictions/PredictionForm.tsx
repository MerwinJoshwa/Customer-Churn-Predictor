import React, { useState } from 'react';
import { PredictionInput, Customer } from '../../types';
import { Zap, RotateCcw, UserCheck, Layers, CreditCard, Shield } from 'lucide-react';

interface PredictionFormProps {
  initialValues?: Partial<PredictionInput>;
  customers?: Customer[];
  onSubmit: (input: PredictionInput) => Promise<void>;
  loading?: boolean;
}

export const PredictionForm: React.FC<PredictionFormProps> = ({
  initialValues,
  customers = [],
  onSubmit,
  loading = false
}) => {
  const defaultValues: PredictionInput = {
    gender: 'Male',
    SeniorCitizen: 0,
    Partner: 'No',
    Dependents: 'No',
    tenure: 1,
    PhoneService: 'Yes',
    MultipleLines: 'No',
    InternetService: 'DSL',
    OnlineSecurity: 'No',
    OnlineBackup: 'No',
    DeviceProtection: 'No',
    TechSupport: 'No',
    StreamingTV: 'No',
    StreamingMovies: 'No',
    Contract: 'Month-to-month',
    PaperlessBilling: 'Yes',
    PaymentMethod: 'Electronic check',
    MonthlyCharges: 29.85,
    TotalCharges: 29.85
  };

  const [formData, setFormData] = useState<PredictionInput>({
    ...defaultValues,
    ...initialValues
  });

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');

  const handleCustomerSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const custId = e.target.value;
    setSelectedCustomerId(custId);
    if (!custId) return;

    const cust = customers.find(c => c.id === Number(custId));
    if (cust) {
      setFormData({
        customer_id: cust.id,
        gender: cust.gender || 'Male',
        SeniorCitizen: cust.senior_citizen ? 1 : 0,
        Partner: cust.partner || 'No',
        Dependents: cust.dependents || 'No',
        tenure: cust.tenure || 1,
        PhoneService: cust.phone_service || 'Yes',
        MultipleLines: cust.multiple_lines || 'No',
        InternetService: cust.internet_service || 'DSL',
        OnlineSecurity: cust.online_security || 'No',
        OnlineBackup: cust.online_backup || 'No',
        DeviceProtection: cust.device_protection || 'No',
        TechSupport: cust.tech_support || 'No',
        StreamingTV: cust.streaming_tv || 'No',
        StreamingMovies: cust.streaming_movies || 'No',
        Contract: cust.contract || 'Month-to-month',
        PaperlessBilling: cust.paperless_billing || 'Yes',
        PaymentMethod: cust.payment_method || 'Electronic check',
        MonthlyCharges: cust.monthly_charges || 29.85,
        TotalCharges: cust.total_charges || 29.85
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'SeniorCitizen') {
      setFormData(prev => ({ ...prev, SeniorCitizen: Number(value) }));
    } else if (name === 'tenure' || name === 'MonthlyCharges' || name === 'TotalCharges') {
      const numVal = parseFloat(value) || 0;
      setFormData(prev => ({
        ...prev,
        [name]: numVal,
        ...(name === 'MonthlyCharges' && (!prev.TotalCharges || prev.TotalCharges === prev.MonthlyCharges)
          ? { TotalCharges: numVal * (prev.tenure || 1) }
          : {})
      }));
    } else if (name === 'PhoneService' && value === 'No') {
      setFormData(prev => ({ ...prev, PhoneService: 'No', MultipleLines: 'No phone service' }));
    } else if (name === 'InternetService' && value === 'No') {
      setFormData(prev => ({
        ...prev,
        InternetService: 'No',
        OnlineSecurity: 'No internet service',
        OnlineBackup: 'No internet service',
        DeviceProtection: 'No internet service',
        TechSupport: 'No internet service',
        StreamingTV: 'No internet service',
        StreamingMovies: 'No internet service'
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleReset = () => {
    setFormData(defaultValues);
    setSelectedCustomerId('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Customer Quick Selector */}
      {customers.length > 0 && (
        <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <UserCheck className="w-5 h-5 text-blue-600 shrink-0" />
            <div>
              <span className="text-xs font-bold text-blue-900 block">Select Saved Customer Profile</span>
              <span className="text-[11px] text-blue-700">Auto-fill 19 features directly from the database</span>
            </div>
          </div>
          <select
            value={selectedCustomerId}
            onChange={handleCustomerSelect}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-white border border-blue-300 text-slate-800 shadow-xs focus:ring-2 focus:ring-blue-500 outline-hidden max-w-xs"
          >
            <option value="">-- Or enter custom input --</option>
            {customers.slice(0, 100).map(c => (
              <option key={c.id} value={c.id}>
                {c.customer_code} ({c.contract}, ${c.monthly_charges}/mo)
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Section A: Customer Information */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
          <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 text-xs font-black flex items-center justify-center">A</span>
          <h3 className="font-bold text-slate-800 text-sm">Customer Demographics & Profile</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-hidden"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Senior Citizen</label>
            <select
              name="SeniorCitizen"
              value={formData.SeniorCitizen}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-hidden"
            >
              <option value={0}>No (0)</option>
              <option value={1}>Yes (1)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Partner</label>
            <select
              name="Partner"
              value={formData.Partner}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-hidden"
            >
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Dependents</label>
            <select
              name="Dependents"
              value={formData.Dependents}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-hidden"
            >
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Tenure (Months with Company)</label>
            <input
              type="number"
              name="tenure"
              min="0"
              max="120"
              value={formData.tenure}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-hidden font-semibold"
            />
          </div>
        </div>
      </div>

      {/* Section B: Services */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
          <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 text-xs font-black flex items-center justify-center">B</span>
          <h3 className="font-bold text-slate-800 text-sm">Telecom & Digital Subscriptions</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Service</label>
            <select
              name="PhoneService"
              value={formData.PhoneService}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-hidden"
            >
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Multiple Lines</label>
            <select
              name="MultipleLines"
              value={formData.MultipleLines}
              disabled={formData.PhoneService === 'No'}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-hidden disabled:bg-slate-100 disabled:text-slate-400"
            >
              <option value="No">No</option>
              <option value="Yes">Yes</option>
              <option value="No phone service">No phone service</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Internet Service</label>
            <select
              name="InternetService"
              value={formData.InternetService}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-hidden"
            >
              <option value="DSL">DSL</option>
              <option value="Fiber optic">Fiber optic</option>
              <option value="No">No</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Tech Support</label>
            <select
              name="TechSupport"
              value={formData.TechSupport}
              disabled={formData.InternetService === 'No'}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-hidden disabled:bg-slate-100 disabled:text-slate-400"
            >
              <option value="No">No</option>
              <option value="Yes">Yes</option>
              <option value="No internet service">No internet service</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Online Security</label>
            <select
              name="OnlineSecurity"
              value={formData.OnlineSecurity}
              disabled={formData.InternetService === 'No'}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-hidden disabled:bg-slate-100 disabled:text-slate-400"
            >
              <option value="No">No</option>
              <option value="Yes">Yes</option>
              <option value="No internet service">No internet service</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Online Backup</label>
            <select
              name="OnlineBackup"
              value={formData.OnlineBackup}
              disabled={formData.InternetService === 'No'}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-hidden disabled:bg-slate-100 disabled:text-slate-400"
            >
              <option value="No">No</option>
              <option value="Yes">Yes</option>
              <option value="No internet service">No internet service</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Device Protection</label>
            <select
              name="DeviceProtection"
              value={formData.DeviceProtection}
              disabled={formData.InternetService === 'No'}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-hidden disabled:bg-slate-100 disabled:text-slate-400"
            >
              <option value="No">No</option>
              <option value="Yes">Yes</option>
              <option value="No internet service">No internet service</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Streaming TV</label>
            <select
              name="StreamingTV"
              value={formData.StreamingTV}
              disabled={formData.InternetService === 'No'}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-hidden disabled:bg-slate-100 disabled:text-slate-400"
            >
              <option value="No">No</option>
              <option value="Yes">Yes</option>
              <option value="No internet service">No internet service</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Streaming Movies</label>
            <select
              name="StreamingMovies"
              value={formData.StreamingMovies}
              disabled={formData.InternetService === 'No'}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-hidden disabled:bg-slate-100 disabled:text-slate-400"
            >
              <option value="No">No</option>
              <option value="Yes">Yes</option>
              <option value="No internet service">No internet service</option>
            </select>
          </div>
        </div>
      </div>

      {/* Section C: Billing & Contract */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
          <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-black flex items-center justify-center">C</span>
          <h3 className="font-bold text-slate-800 text-sm">Contract Terms & Billing Information</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Contract Type</label>
            <select
              name="Contract"
              value={formData.Contract}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-hidden font-medium"
            >
              <option value="Month-to-month">Month-to-month</option>
              <option value="One year">One year</option>
              <option value="Two year">Two year</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method</label>
            <select
              name="PaymentMethod"
              value={formData.PaymentMethod}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-hidden"
            >
              <option value="Electronic check">Electronic check</option>
              <option value="Mailed check">Mailed check</option>
              <option value="Bank transfer (automatic)">Bank transfer (automatic)</option>
              <option value="Credit card (automatic)">Credit card (automatic)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Paperless Billing</label>
            <select
              name="PaperlessBilling"
              value={formData.PaperlessBilling}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-hidden"
            >
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Monthly Charges ($)</label>
            <input
              type="number"
              step="0.05"
              min="10"
              max="200"
              name="MonthlyCharges"
              value={formData.MonthlyCharges}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-hidden font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Total Charges ($)</label>
            <input
              type="number"
              step="0.05"
              min="0"
              name="TotalCharges"
              value={formData.TotalCharges}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-hidden font-semibold"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-100 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset Form</span>
        </button>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50"
        >
          <Zap className="w-4 h-4 fill-current" />
          <span>{loading ? 'Evaluating Model...' : 'Predict Churn Risk'}</span>
        </button>
      </div>
    </form>
  );
};
