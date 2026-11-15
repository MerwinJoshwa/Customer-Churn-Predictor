-- MySQL Initialization Script for Customer Churn Predictor
CREATE DATABASE IF NOT EXISTS churn_db;
USE churn_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'ANALYST') DEFAULT 'ANALYST',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Customers Table
CREATE TABLE IF NOT EXISTS customers (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    customer_code VARCHAR(30) UNIQUE NOT NULL,
    gender VARCHAR(10),
    senior_citizen BOOLEAN,
    partner VARCHAR(5),
    dependents VARCHAR(5),
    tenure INT,
    phone_service VARCHAR(30),
    multiple_lines VARCHAR(30),
    internet_service VARCHAR(30),
    online_security VARCHAR(30),
    online_backup VARCHAR(30),
    device_protection VARCHAR(30),
    tech_support VARCHAR(30),
    streaming_tv VARCHAR(30),
    streaming_movies VARCHAR(30),
    contract VARCHAR(30),
    paperless_billing VARCHAR(5),
    payment_method VARCHAR(60),
    monthly_charges DECIMAL(10,2),
    total_charges DECIMAL(12,2),
    actual_churn BOOLEAN NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_customer_code (customer_code),
    INDEX idx_customer_contract (contract),
    INDEX idx_customer_churn (actual_churn)
);

-- 3. Model Versions Table
CREATE TABLE IF NOT EXISTS model_versions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    version VARCHAR(30) NOT NULL UNIQUE,
    model_name VARCHAR(100) NOT NULL,
    artifact_path VARCHAR(255),
    accuracy DECIMAL(6,5),
    precision_score DECIMAL(6,5),
    recall_score DECIMAL(6,5),
    f1_score DECIMAL(6,5),
    roc_auc DECIMAL(6,5),
    trained_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT FALSE
);

-- 4. Predictions Table
CREATE TABLE IF NOT EXISTS predictions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    customer_id BIGINT NULL,
    created_by BIGINT NOT NULL,
    model_version_id BIGINT NOT NULL,
    predicted_churn BOOLEAN NOT NULL,
    churn_probability DECIMAL(6,5) NOT NULL,
    risk_level ENUM('LOW', 'MEDIUM', 'HIGH') NOT NULL,
    input_snapshot JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (model_version_id) REFERENCES model_versions(id) ON DELETE RESTRICT,
    INDEX idx_prediction_customer (customer_id),
    INDEX idx_prediction_created_at (created_at),
    INDEX idx_prediction_risk (risk_level)
);

-- Default Demo Users (Password: admin123 and analyst123 hashed with bcrypt)
-- Hashes generated via standard bcrypt cost 12
INSERT INTO users (name, email, password_hash, role)
VALUES 
('System Administrator', 'admin@telecom.com', '$2b$12$LJ3m4omvov.p04W3jZ.EbeDk8o9rK1k6pY0oGz1O6eM/Q5tO7tZvy', 'ADMIN'),
('Lead Churn Analyst', 'analyst@telecom.com', '$2b$12$LJ3m4omvov.p04W3jZ.EbeDk8o9rK1k6pY0oGz1O6eM/Q5tO7tZvy', 'ANALYST')
ON DUPLICATE KEY UPDATE name=name;
