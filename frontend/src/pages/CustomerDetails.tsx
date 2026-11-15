import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Customer, PredictionResult as IPredictionResult } from '../types';
import { customerService } from '../services/customerService';
import { predictionService } from '../services/predictionService';
import { RiskIndicator } from '../components/predictions/RiskIndicator';
import { 
  ArrowLeft, 
  Zap, 
  CheckCircle, 
  AlertOctagon, 
  CreditCard, 
  Shield, 
  Wifi, 
  Tv, 
  Phone,
  Calendar,
  Layers,
  Edit3
} from 'lucide-react';

export const CustomerDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [prediction, setPrediction] = useState<IPredictionResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [predicting, setPredicting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomer = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await customerService.getCustomerById(Number(id));
        setCustomer(data);
      } catch (err: any) {
        setError(err?.response?.data?.detail || 'Customer not found');
      } finally {
        setLoading(false);
      }
    };
    fetchCustomer();
  }, [id]);

  const handleRunPrediction = async () => {
    if (!customer) return;
    try {
      setPredicting(true);
      const input = {
        customer_id: customer.id,
        gender: customer.gender,
        SeniorCitizen: customer.senior_citizen ? 1 : 0,
        Partner: customer.partner,
        Dependents: customer.dependents,
        tenure: customer.tenure,
        PhoneService: customer.phone_service,
        MultipleLines: customer.multiple_lines,
        InternetService: customer.internet_service,
        OnlineSecurity: customer.online_security,
        OnlineBackup: customer.online_backup,
        DeviceProtection: customer.device_protection,
        TechSupport: customer.tech_support,
        StreamingTV: customer.streaming_tv,
        StreamingMovies: customer.streaming_movies,
        Contract: customer.contract,
        PaperlessBilling: customer.paperless_billing,
        PaymentMethod: customer.payment_method,
        MonthlyCharges: customer.monthly_charges,
        TotalCharges: customer.total_charges
      };
      const res = await predictionService.predictChurn(input);
      setPrediction(res);
    } catch (err) {
      console.error('Error running prediction:', err);
    } finally {
      setPredicting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-sm font-semibold text-slate-500">Retrieving customer account...</p>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <p className="text-base font-bold text-rose-600 mb-3">{error || 'Customer not found'}</p>
        <button
          onClick={() => navigate('/customers')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Directory
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/customers')}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">{customer.customer_code}</h2>
              {customer.actual_churn === true ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700">Churned</span>
              ) : customer.actual_churn === false ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">Active Retained</span>
              ) : null}
            </div>
            <p className="text-xs text-slate-500 font-medium">Customer profile and historical metrics</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRunPrediction}
            disabled={predicting}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-md shadow-blue-600/20 transition-all disabled:opacity-50"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>{predicting ? 'Evaluating ML Model...' : 'Run Churn Prediction'}</span>
          </button>
        </div>
      </div>

      {/* Prediction Result Banner if run */}
      {prediction && (
        <div className="animate-in fade-in slide-in-from-top-3 duration-300">
          <RiskIndicator
            level={prediction.risk_level}
            probability={prediction.churn_probability}
          />
        </div>
      )}

      {/* 3 Detail Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Personal & Demographic */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Shield className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-sm">Demographic Profile</h3>
          </div>
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500 font-medium">Gender:</span>
              <span className="font-semibold text-slate-800">{customer.gender}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500 font-medium">Senior Citizen:</span>
              <span className="font-semibold text-slate-800">{customer.senior_citizen ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500 font-medium">Partner:</span>
              <span className="font-semibold text-slate-800">{customer.partner}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500 font-medium">Dependents:</span>
              <span className="font-semibold text-slate-800">{customer.dependents}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500 font-medium">Tenure:</span>
              <span className="font-bold text-blue-600">{customer.tenure} months</span>
            </div>
          </div>
        </div>

        {/* Subscribed Telecom Services */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Wifi className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm">Services & Features</h3>
          </div>
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500 font-medium">Phone Service:</span>
              <span className="font-semibold text-slate-800">{customer.phone_service}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500 font-medium">Multiple Lines:</span>
              <span className="font-semibold text-slate-800">{customer.multiple_lines}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500 font-medium">Internet Service:</span>
              <span className="font-semibold text-slate-800">{customer.internet_service}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500 font-medium">Tech Support:</span>
              <span className="font-semibold text-slate-800">{customer.tech_support}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500 font-medium">Online Security:</span>
              <span className="font-semibold text-slate-800">{customer.online_security}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500 font-medium">Streaming (TV / Movies):</span>
              <span className="font-semibold text-slate-800">{customer.streaming_tv} / {customer.streaming_movies}</span>
            </div>
          </div>
        </div>

        {/* Billing & Contract */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <CreditCard className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-sm">Contract & Billing</h3>
          </div>
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500 font-medium">Contract Type:</span>
              <span className="font-semibold text-slate-800">{customer.contract}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500 font-medium">Payment Method:</span>
              <span className="font-semibold text-slate-800">{customer.payment_method}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500 font-medium">Paperless Billing:</span>
              <span className="font-semibold text-slate-800">{customer.paperless_billing}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500 font-medium">Monthly Charges:</span>
              <span className="font-bold text-slate-900">${Number(customer.monthly_charges).toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500 font-medium">Total Accumulated:</span>
              <span className="font-bold text-emerald-700">${Number(customer.total_charges).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
