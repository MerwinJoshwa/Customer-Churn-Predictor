import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Customers } from './pages/Customers';
import { CustomerDetails } from './pages/CustomerDetails';
import { PredictChurn } from './pages/PredictChurn';
import { PredictionHistory } from './pages/PredictionHistory';
import { ModelInsights } from './pages/ModelInsights';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Auth Route */}
        <Route path="/login" element={<Login />} />

        {/* Authenticated Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/customers/:id" element={<CustomerDetails />} />
          <Route path="/predict" element={<PredictChurn />} />
          <Route path="/predictions" element={<PredictionHistory />} />
          <Route path="/model-insights" element={<ModelInsights />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
