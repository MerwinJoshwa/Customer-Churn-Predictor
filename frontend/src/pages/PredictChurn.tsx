import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { PredictionInput, PredictionResult as IPredictionResult, Customer } from '../types';
import { predictionService } from '../services/predictionService';
import { customerService } from '../services/customerService';
import { PredictionForm } from '../components/predictions/PredictionForm';
import { PredictionResult } from '../components/predictions/PredictionResult';
import { Zap, AlertCircle } from 'lucide-react';

export const PredictChurn: React.FC = () => {
  const location = useLocation();
  const passedCustomer = (location.state as any)?.customer as Customer | undefined;

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [result, setResult] = useState<IPredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch customer list for quick picker
    const fetchCustomers = async () => {
      try {
        const data = await customerService.getCustomers(1, 100);
        setCustomers(data.items);
      } catch (err) {
        console.error('Failed to load customers for selector', err);
      }
    };
    fetchCustomers();
  }, []);

  const handlePredict = async (input: PredictionInput) => {
    try {
      setLoading(true);
      setError(null);
      const res = await predictionService.predictChurn(input);
      setResult(res);
      // Smooth scroll to result
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Prediction failed. Check input values.');
    } finally {
      setLoading(false);
    }
  };

  const initialValues: Partial<PredictionInput> | undefined = passedCustomer
    ? {
        customer_id: passedCustomer.id,
        gender: passedCustomer.gender,
        SeniorCitizen: passedCustomer.senior_citizen ? 1 : 0,
        Partner: passedCustomer.partner,
        Dependents: passedCustomer.dependents,
        tenure: passedCustomer.tenure,
        PhoneService: passedCustomer.phone_service,
        MultipleLines: passedCustomer.multiple_lines,
        InternetService: passedCustomer.internet_service,
        OnlineSecurity: passedCustomer.online_security,
        OnlineBackup: passedCustomer.online_backup,
        DeviceProtection: passedCustomer.device_protection,
        TechSupport: passedCustomer.tech_support,
        StreamingTV: passedCustomer.streaming_tv,
        StreamingMovies: passedCustomer.streaming_movies,
        Contract: passedCustomer.contract,
        PaperlessBilling: passedCustomer.paperless_billing,
        PaymentMethod: passedCustomer.payment_method,
        MonthlyCharges: passedCustomer.monthly_charges,
        TotalCharges: passedCustomer.total_charges
      }
    : undefined;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Zap className="w-6 h-6 text-blue-600 fill-current" />
          <span>Predict Customer Churn</span>
        </h2>
        <p className="text-sm text-slate-500 font-medium">
          Evaluate customer churn likelihood and attrition probability with the active Random Forest classifier
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Prediction Output Section */}
      {result && (
        <div className="mb-6">
          <PredictionResult result={result} />
        </div>
      )}

      {/* 4-Section Form */}
      <PredictionForm
        initialValues={initialValues}
        customers={customers}
        onSubmit={handlePredict}
        loading={loading}
      />
    </div>
  );
};
