# 🚀 Customer Churn Predictor — Enterprise Full-Stack AI Platform

[![CI/CD Pipeline](https://github.com/telecom-ai/customer-churn-predictor/actions/workflows/ci.yml/badge.svg)](https://github.com)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React%20%2B%20TypeScript-61DAFB.svg?logo=react)](https://reactjs.org)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com)
[![Scikit-Learn](https://img.shields.io/badge/ML-Scikit--Learn%20Random%20Forest-F7931E.svg?logo=scikit-learn)](https://scikit-learn.org)
[![MySQL 8](https://img.shields.io/badge/Database-MySQL%208-4479A1.svg?logo=mysql)](https://mysql.com)
[![Docker](https://img.shields.io/badge/Containers-Docker%20Compose-2496ED.svg?logo=docker)](https://docker.com)

An end-to-end enterprise solution that predicts customer churn likelihood for telecommunications providers, combines Scikit-learn machine learning pipelines with FastAPI high-performance asynchronous REST endpoints, an interactive React + TypeScript analytics dashboard, and containerized Docker Compose deployment.

---

## 📑 Table of Contents
1. [What Our ML Model Predicts](#1-what-our-ml-model-predicts)
2. [Input Features (19 Features)](#2-input-features-19-features)
3. [Architecture & Folder Structure](#3-architecture--folder-structure)
4. [Tech Stack](#4-tech-stack)
5. [Database Design (MySQL 8)](#5-database-design-mysql-8)
6. [API Endpoints Reference](#6-api-endpoints-reference)
7. [Getting Started & Local Development](#7-getting-started--local-development)
8. [Docker Compose Deployment](#8-docker-compose-deployment)
9. [Running Automated Tests](#9-running-automated-tests)
10. [CI/CD & AWS EC2 Deployment](#10-cicd--aws-ec2-deployment)

---

## 1. What Our ML Model Predicts

Our application solves a high-stakes binary classification problem:
> **"Based on the customer's current profile, contracted services, and billing behavior, is this customer likely to leave the telecom company?"**

- **Binary Output**:
  - `1` = **Churn** (Customer likely to leave)
  - `0` = **No Churn** (Customer likely to stay)
- **Probability Output**: Continuous score from `0.0` to `1.0` (e.g. `82.0%`).
- **Application Risk Thresholds**:
  | Churn Probability | Risk Tier | Recommended Business Action |
  | :--- | :--- | :--- |
  | **Below 40%** | 🟢 **LOW** | Normal service lifecycle; cross-sell opportunities |
  | **40% – 69.99%** | 🟡 **MEDIUM** | Moderate risk; send engagement surveys / feature reminders |
  | **70% or Above** | 🔴 **HIGH** | Immediate retention campaign; personalized contract incentive |

---

## 2. Input Features (19 Features)

Trained on the **IBM Telco Customer Churn Dataset** (`Telco-Customer-Churn.csv`):

| # | Feature | Description | Type / Values |
|---|:---|:---|:---|
| 1 | `gender` | Customer gender | Categorical (`Male`, `Female`) |
| 2 | `SeniorCitizen` | Senior citizen indicator | Binary (`0`, `1`) |
| 3 | `Partner` | Whether customer has a partner | Binary (`Yes`, `No`) |
| 4 | `Dependents` | Whether customer has dependents | Binary (`Yes`, `No`) |
| 5 | `tenure` | Months with the company | Numerical integer |
| 6 | `PhoneService` | Subscribed phone service | Binary (`Yes`, `No`) |
| 7 | `MultipleLines` | Multiple phone lines | Categorical (`Yes`, `No`, `No phone service`) |
| 8 | `InternetService` | Internet technology | Categorical (`DSL`, `Fiber optic`, `No`) |
| 9 | `OnlineSecurity` | Security add-on subscription | Categorical (`Yes`, `No`, `No internet service`) |
| 10 | `OnlineBackup` | Backup add-on subscription | Categorical (`Yes`, `No`, `No internet service`) |
| 11 | `DeviceProtection`| Device protection plan | Categorical (`Yes`, `No`, `No internet service`) |
| 12 | `TechSupport` | Priority technical support | Categorical (`Yes`, `No`, `No internet service`) |
| 13 | `StreamingTV` | Streaming TV service | Categorical (`Yes`, `No`, `No internet service`) |
| 14 | `StreamingMovies`| Streaming movies service | Categorical (`Yes`, `No`, `No internet service`) |
| 15 | `Contract` | Customer contract term | Categorical (`Month-to-month`, `One year`, `Two year`) |
| 16 | `PaperlessBilling`| Invoicing preference | Binary (`Yes`, `No`) |
| 17 | `PaymentMethod` | Billing payment method | Categorical (`Electronic check`, `Mailed check`, `Bank transfer`, `Credit card`) |
| 18 | `MonthlyCharges` | Current monthly charge ($) | Numerical float |
| 19 | `TotalCharges` | Cumulative charges paid ($) | Numerical float (imputed if blank) |

---

## 3. Architecture & Folder Structure

```
Customer_Churn_Predictor/
├── frontend/                     # React + TypeScript + Tailwind CSS SPA
│   ├── public/                   # Static assets & favicon
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/           # Sidebar, Navbar, ProtectedRoute
│   │   │   ├── dashboard/        # StatCard, ChurnChart, RiskChart
│   │   │   ├── customers/        # CustomerTable, CustomerForm, CustomerDetails
│   │   │   └── predictions/      # PredictionForm, PredictionResult, RiskIndicator
│   │   ├── pages/                # Login, Dashboard, Customers, PredictChurn, PredictionHistory, ModelInsights
│   │   ├── services/             # Axios API client, authService, customerService, predictionService
│   │   ├── hooks/                # useAuth hook
│   │   ├── types/                # TypeScript interfaces
│   │   ├── App.tsx               # Main routing component
│   │   └── main.tsx              # React DOM entrypoint
│   ├── Dockerfile                # Multi-stage production container build
│   ├── nginx.conf                # Reverse proxy & SPA routing config
│   └── package.json
├── backend/                      # Python FastAPI REST API & Machine Learning
│   ├── app/
│   │   ├── api/v1/               # Auth, Customers, Predictions, Analytics, Model endpoints
│   │   ├── core/                 # App configuration & JWT security utilities
│   │   ├── database/             # SQLAlchemy connection & session management
│   │   ├── models/               # SQLAlchemy DB entities (User, Customer, Prediction, ModelVersion)
│   │   ├── schemas/              # Pydantic v2 schemas for request/response validation
│   │   ├── services/             # Business logic layer
│   │   ├── ml/                   # ChurnPredictor inference runtime
│   │   └── main.py               # FastAPI application entrypoint
│   ├── training/                 # ML pipelines & data scripts
│   │   ├── train.py              # Random Forest training & evaluation
│   │   ├── evaluate.py           # Model test evaluation report
│   │   └── import_dataset.py     # Batch dataset importer & database seeder
│   ├── artifacts/                # Serialized model_v1.joblib & metrics_v1.json
│   ├── tests/                    # Unit & integration test suites
│   ├── Dockerfile
│   └── requirements.txt
├── dataset/                      # Raw dataset directory
│   ├── Telco-Customer-Churn.csv  # 7,043 rows IBM Telco dataset
│   └── README.md
├── database/
│   └── init.sql                  # MySQL 8 table schema & default user seeding
├── .github/workflows/
│   └── ci.yml                    # Automated GitHub Actions test & build pipeline
├── docker-compose.yml            # Multi-container orchestration (MySQL, Backend, Frontend)
├── .env.example                  # Environment template
└── README.md
```

---

## 4. Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Recharts, Lucide Icons, Vite
- **Backend**: Python 3.11+, FastAPI, Pydantic v2, Uvicorn
- **Machine Learning**: Scikit-Learn `RandomForestClassifier`, Pandas, NumPy, Joblib
- **Database**: MySQL 8.0 with SQLAlchemy 2.0 ORM (with graceful SQLite local fallback)
- **Authentication**: JWT (JSON Web Tokens) with Bcrypt password hashing
- **Testing**: Pytest & FastAPI TestClient
- **DevOps**: Docker, Docker Compose, Nginx, GitHub Actions

---

## 5. Database Design (MySQL 8)

The relational schema implements 4 core tables:
1. `users`: Stores platform operators with roles (`ADMIN`, `ANALYST`) and salted bcrypt password hashes.
2. `customers`: Stores all 19 customer features and actual churn outcome labels.
3. `model_versions`: Tracks model artifact metadata, evaluation scores (Accuracy, Precision, Recall, F1, ROC-AUC), and active version flags.
4. `predictions`: Preserves an immutable JSON `input_snapshot` of every inference run alongside predicted probability, risk level tier, and operator audit trail.

---

## 6. API Endpoints Reference

| Method | Endpoint | Description | Auth Required |
|:---|:---|:---|:---:|
| `POST` | `/api/v1/auth/register` | Register new analyst or admin account | No |
| `POST` | `/api/v1/auth/login` | Authenticate and obtain JWT Bearer token | No |
| `GET` | `/api/v1/auth/me` | Fetch currently authenticated user profile | Yes |
| `GET` | `/api/v1/customers` | Paginated customer directory with search & filters | Yes |
| `POST` | `/api/v1/customers` | Register a new customer | Yes |
| `GET` | `/api/v1/customers/{id}` | Inspect customer demographic & service details | Yes |
| `PUT` | `/api/v1/customers/{id}` | Update customer subscription attributes | Yes |
| `DELETE` | `/api/v1/customers/{id}` | Delete customer record | Yes |
| `POST` | `/api/v1/predictions` | Run ML churn inference & save snapshot record | Yes |
| `GET` | `/api/v1/predictions` | Prediction audit history log with risk filtering | Yes |
| `GET` | `/api/v1/analytics/overview`| Real-time KPIs, distributions, and high-risk alerts | Yes |
| `GET` | `/api/v1/model/metrics` | Accuracy, recall, precision, confusion matrix | Yes |
| `GET` | `/api/v1/model/feature-importance` | Top 10 feature importance weights | Yes |

---

## 7. Getting Started & Local Development

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 2. Backend Setup & Training
```bash
# 1. Install backend dependencies
pip install -r backend/requirements.txt
pip install pytest

# 2. Train the Random Forest Model
python backend/training/train.py

# 3. Seed Database & Sample Predictions
python backend/training/import_dataset.py

# 4. Start FastAPI Backend Server
python -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000 --reload
```
Interactive API documentation will be available at: `http://localhost:8000/docs`

### 3. Frontend Setup
```bash
# In a new terminal:
cd frontend
npm install
npm run dev
```
Open your browser at `http://localhost:3000`.

### 4. Demo Login Credentials
| Role | Email | Password |
|:---|:---|:---|
| **Administrator** | `admin@telecom.com` | `admin123` |
| **Analyst** | `analyst@telecom.com` | `analyst123` |
*(Or click the 1-Click Demo buttons on the login screen)*

---

## 8. Docker Compose Deployment

Run the complete full-stack environment (MySQL 8, FastAPI backend, and Nginx frontend) with a single command:

```bash
docker-compose up --build -d
```

- **Frontend Application**: `http://localhost:3000`
- **Backend API**: `http://localhost:8000`
- **Swagger Documentation**: `http://localhost:8000/docs`
- **MySQL 8 Database**: Port `3306`

To shut down:
```bash
docker-compose down -v
```

---

## 9. Running Automated Tests

Run the test suite covering authentication, customer CRUD operations, ML inference, and analytics:

```bash
python -m pytest backend/tests -v
```
Output:
```
backend/tests/test_auth.py::test_health_check PASSED [  9%]
backend/tests/test_auth.py::test_login_demo_admin PASSED [ 18%]
backend/tests/test_auth.py::test_login_demo_analyst PASSED [ 27%]
backend/tests/test_auth.py::test_register_and_login_new_user PASSED [ 36%]
backend/tests/test_customers.py::test_customers_crud PASSED [ 45%]
backend/tests/test_predictions.py::test_predict_churn_high_risk PASSED [ 54%]
backend/tests/test_predictions.py::test_predict_churn_low_risk PASSED [ 63%]
backend/tests/test_predictions.py::test_prediction_history PASSED [ 72%]
backend/tests/test_predictions.py::test_analytics_overview PASSED [ 81%]
backend/tests/test_predictions.py::test_model_metrics PASSED [ 90%]
backend/tests/test_predictions.py::test_feature_importance PASSED [100%]
============================== 11 passed ==============================
```

---

## 10. CI/CD & AWS EC2 Deployment

### GitHub Actions CI/CD
The included `.github/workflows/ci.yml` pipeline runs on every push and pull request:
1. Provisions Ubuntu runner with MySQL 8 service container.
2. Runs Scikit-learn model training and validates metrics.
3. Runs Pytest unit and integration test suite.
4. Executes TypeScript compile check (`tsc`) and Vite production bundle.
5. Verifies Docker builds for both backend and frontend images.

### AWS EC2 Deployment Steps
1. Launch an `Ubuntu 22.04 LTS` EC2 instance (t3.small or t3.medium recommended).
2. Configure Security Group: open port `80` (HTTP), `443` (HTTPS), and `22` (SSH).
3. SSH into EC2 instance:
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-ip
   ```
4. Install Docker and Docker Compose on EC2:
   ```bash
   sudo apt-get update
   sudo apt-get install -y docker.io docker-compose git
   sudo usermod -aG docker ubuntu
   ```
5. Clone repository and start containers:
   ```bash
   git clone <your-repo-url>
   cd Customer_Churn_Predictor
   docker-compose up --build -d
   ```
6. Access your live application at `http://your-ec2-public-ip:3000`!
