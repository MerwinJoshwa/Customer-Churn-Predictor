import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"

def test_login_demo_admin():
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@telecom.com", "password": "admin123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] == "ADMIN"

def test_login_demo_analyst():
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "analyst@telecom.com", "password": "analyst123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] == "ANALYST"

def test_register_and_login_new_user():
    email = "newanalyst_test@telecom.com"
    reg_response = client.post(
        "/api/v1/auth/register",
        json={
            "name": "Test Analyst",
            "email": email,
            "password": "Password123!",
            "role": "ANALYST"
        }
    )
    # 201 or 400 if already exists in test DB
    assert reg_response.status_code in [201, 400]
    
    login_response = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": "Password123!"}
    )
    assert login_response.status_code == 200
    assert "access_token" in login_response.json()
