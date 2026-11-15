import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def get_auth_token():
    res = client.post(
        "/api/v1/auth/login",
        json={"email": "analyst@telecom.com", "password": "analyst123"}
    )
    if res.status_code == 200:
        return res.json()["access_token"]
    res = client.post(
        "/api/v1/auth/register",
        json={"name": "Analyst", "email": "analyst@telecom.com", "password": "analyst123", "role": "ANALYST"}
    )
    return res.json()["access_token"]

def test_predict_churn_high_risk():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    # High risk profile: month-to-month, electronic check, 1 month tenure, fiber optic, no tech support
    high_risk_input = {
        "gender": "Female",
        "SeniorCitizen": 1,
        "Partner": "No",
        "Dependents": "No",
        "tenure": 1,
        "PhoneService": "Yes",
        "MultipleLines": "No",
        "InternetService": "Fiber optic",
        "OnlineSecurity": "No",
        "OnlineBackup": "No",
        "DeviceProtection": "No",
        "TechSupport": "No",
        "StreamingTV": "Yes",
        "StreamingMovies": "Yes",
        "Contract": "Month-to-month",
        "PaperlessBilling": "Yes",
        "PaymentMethod": "Electronic check",
        "MonthlyCharges": 89.95,
        "TotalCharges": 89.95
    }

    response = client.post("/api/v1/predictions", json=high_risk_input, headers=headers)
    assert response.status_code == 201
    data = response.json()
    assert "churn_probability" in data
    assert "risk_level" in data
    assert data["risk_level"] in ["LOW", "MEDIUM", "HIGH"]
    assert 0.0 <= data["churn_probability"] <= 1.0

def test_predict_churn_low_risk():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    # Low risk profile: 60 month tenure, two year contract, tech support, online backup
    low_risk_input = {
        "gender": "Male",
        "SeniorCitizen": 0,
        "Partner": "Yes",
        "Dependents": "Yes",
        "tenure": 60,
        "PhoneService": "Yes",
        "MultipleLines": "Yes",
        "InternetService": "DSL",
        "OnlineSecurity": "Yes",
        "OnlineBackup": "Yes",
        "DeviceProtection": "Yes",
        "TechSupport": "Yes",
        "StreamingTV": "No",
        "StreamingMovies": "No",
        "Contract": "Two year",
        "PaperlessBilling": "No",
        "PaymentMethod": "Bank transfer (automatic)",
        "MonthlyCharges": 45.00,
        "TotalCharges": 2700.00
    }

    response = client.post("/api/v1/predictions", json=low_risk_input, headers=headers)
    assert response.status_code == 201
    data = response.json()
    assert data["churn_probability"] < 0.50

def test_prediction_history():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    response = client.get("/api/v1/predictions", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "total" in data
    assert "items" in data
    assert isinstance(data["items"], list)

def test_analytics_overview():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    response = client.get("/api/v1/analytics/overview", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "total_customers" in data
    assert "overall_churn_rate" in data
    assert "churn_distribution" in data

def test_model_metrics():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    response = client.get("/api/v1/model/metrics", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "accuracy" in data
    assert "f1_score" in data
    assert "roc_auc" in data

def test_feature_importance():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    response = client.get("/api/v1/model/feature-importance", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
