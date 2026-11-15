import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def get_auth_token():
    res = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@telecom.com", "password": "admin123"}
    )
    if res.status_code == 200:
        return res.json()["access_token"]
    # Register if not exists
    res = client.post(
        "/api/v1/auth/register",
        json={"name": "Admin", "email": "admin@telecom.com", "password": "admin123", "role": "ADMIN"}
    )
    return res.json()["access_token"]

def test_customers_crud():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Create a customer
    code = "TEST-CUST-999"
    customer_payload = {
        "customer_code": code,
        "gender": "Female",
        "senior_citizen": False,
        "partner": "Yes",
        "dependents": "No",
        "tenure": 12,
        "phone_service": "Yes",
        "multiple_lines": "No",
        "internet_service": "Fiber optic",
        "online_security": "No",
        "online_backup": "Yes",
        "device_protection": "No",
        "tech_support": "No",
        "streaming_tv": "Yes",
        "streaming_movies": "Yes",
        "contract": "Month-to-month",
        "paperless_billing": "Yes",
        "payment_method": "Electronic check",
        "monthly_charges": 85.50,
        "total_charges": 1026.00,
        "actual_churn": False
    }

    # Clean up if existing
    list_res = client.get(f"/api/v1/customers?search={code}", headers=headers)
    if list_res.status_code == 200 and list_res.json()["total"] > 0:
        existing_id = list_res.json()["items"][0]["id"]
        client.delete(f"/api/v1/customers/{existing_id}", headers=headers)

    create_res = client.post("/api/v1/customers", json=customer_payload, headers=headers)
    assert create_res.status_code == 201
    created_cust = create_res.json()
    cust_id = created_cust["id"]
    assert created_cust["customer_code"] == code

    # 2. Get customer by ID
    get_res = client.get(f"/api/v1/customers/{cust_id}", headers=headers)
    assert get_res.status_code == 200
    assert get_res.json()["id"] == cust_id

    # 3. Update customer
    update_res = client.put(
        f"/api/v1/customers/{cust_id}",
        json={"monthly_charges": 89.99, "contract": "One year"},
        headers=headers
    )
    assert update_res.status_code == 200
    assert update_res.json()["monthly_charges"] == 89.99
    assert update_res.json()["contract"] == "One year"

    # 4. List customers with search
    search_res = client.get(f"/api/v1/customers?search={code}", headers=headers)
    assert search_res.status_code == 200
    assert search_res.json()["total"] >= 1

    # 5. Delete customer
    delete_res = client.delete(f"/api/v1/customers/{cust_id}", headers=headers)
    assert delete_res.status_code == 204
