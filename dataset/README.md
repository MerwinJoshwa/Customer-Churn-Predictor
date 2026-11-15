# IBM Telco Customer Churn Dataset

This directory contains the IBM Telco Customer Churn dataset used for training, evaluation, and batch importing into the database.

## Dataset Details
- **File**: `Telco-Customer-Churn.csv`
- **Total Records**: 7,043 customers
- **Total Columns**: 21
- **Target Variable**: `Churn` (Yes = 1, No = 0)
- **Features Used (19)**:
  - Demographic: `gender`, `SeniorCitizen`, `Partner`, `Dependents`
  - Services: `PhoneService`, `MultipleLines`, `InternetService`, `OnlineSecurity`, `OnlineBackup`, `DeviceProtection`, `TechSupport`, `StreamingTV`, `StreamingMovies`
  - Account & Contract: `tenure`, `Contract`, `PaperlessBilling`, `PaymentMethod`, `MonthlyCharges`, `TotalCharges`
- **Identifier**: `customerID` (excluded from training features, mapped to `customer_code` in database)
