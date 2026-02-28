# 🏙️ Aegis Chennai: High-Fidelity Zero Trust Urban Defense Platform

### *Autonomous Governance & Cryptographic Security for Critical Infrastructure*

Aegis Chennai is an enterprise-grade **Zero Trust Architecture (ZTA)** simulation and monitoring platform designed for the protection of mission-critical urban assets. Built on the principle of **"Never Trust, Always Verify,"** the system provides a high-fidelity digital twin of Chennai's infrastructure, enforcing granular access control, real-time telemetry encryption, and automated threat mitigation.

---

## 🏗️ Architectural Paradigm

The platform is engineered using a **Secure-by-Design** philosophy, decoupling the command interface from the underlying infrastructure nodes to prevent lateral movement during a compromise.

-   **Zero Trust Gateway (ZTG):** A centralized Node.js/Express ingestion layer that validates every micro-request against identity, role, and environmental context.
-   **Security Intelligence Engine (SIE):** A parallel processing layer that analyzes event streams for behavioral anomalies, including brute-force patterns and impossible travel geofencing.
-   **Distributed Ledger of Action (Audit):** A tamper-evident logging system that captures every state change, essential for post-incident forensics and regulatory compliance (GDPR/CERT-In).
-   **GPU-Accelerated Command Center:** A high-performance React frontend utilizing hardware-accelerated rendering for real-time visualization of city-wide security states.

---

## 🛡️ Deep Security Implementation (Production-Grade)

### **1. Identity & Access Management (IAM)**
*   **Dual-Layer Tokenization:** Implements Short-Lived **JWT Access Tokens (15m)** and Security-Hardened **HttpOnly/Secure Refresh Tokens (7d)**.
*   **Cryptographic Blacklisting:** Instantaneous session revocation via a high-performance **Redis-backed blacklist**, enabling "One-Click Force Logout" city-wide.
*   **Dynamic RBAC (Role-Based Access Control):** Granular permission matrices for `Admin`, `TrafficOperator`, `EmergencyAuthority`, and `SecurityAnalyst`, ensuring strictly policed Least-Privilege access.

### **2. Behavioral Threat Modeling & Mitigation**
*   **Impossible Travel Heuristics:** Calculates Euclidean distance between consecutive login attempts. If the implied velocity exceeds realistic thresholds (~900km/h), the account is locked and flagged for Critical Alert.
*   **Dynamic Device Trust Scoring:** Every device interaction updates a **Trust Propensity Score (0-100)**. High-risk actions (e.g., unauthorized API probes) degrade trust, triggering automatic MFA (Multi-Factor Authentication) requirements or total lockout.
*   **Atomic Brute-Force Circuit Breakers:** Distributed rate-limiting (via `express-rate-limit`) and atomic database increments prevent parallel credential stuffing.

### **3. Infrastructure Protocol Security**
*   **Command Isolation:** Infrastructure controls (Traffic Signals, Water Valves, Grid Overrides) are gated behind **Modular Protection Middleware**, preventing direct unauthorized node interaction.
*   **Input Sanitization & NoSQL Injection Guard:** Strict enforcement of `express-mongo-sanitize` and schema validation (Joi) to neutralize prototype pollution and injection vectors.
*   **Header Hardening:** Full Implementation of **Helmet.js** with strictly defined Content Security Policies (CSP) to mitigate XSS and clickjacking.

---

## 📡 Modern Domain Expertise

### **Digital Twin Simulation**
*   **Urban Map Architecture:** Utilizing Leaflet.js with custom GeoJSON layers to simulate Chennai's IT corridors, CBD, and high-risk flood zones.
*   **Interdependency Mapping:** Simulates how a compromise in the Power Grid cascades into Water Supply and Traffic Safety, allowing authorities to visualize "Worst-Case" security scenarios.

---

## 🚀 Deployment & Operational Readiness

### **Environmental Standardization**
The platform is designed to be environment-agnostic. All sensitive configuration is loaded via standardized environment injection:

| Variable | Security Function | Required In |
| :--- | :--- | :--- |
| `MONGO_URI` | Encrypted persistence layer connection | Production |
| `JWT_SECRET` | HS256 Signing key for Identity Tokens | Production |
| `REDIS_URL` | State-sync for session revocation | Production |
| `NODE_ENV` | Controls error verbosity (Hides stack traces) | Production |

### **Operational Hardening CLI**
1.  **Backend Initialization:** `cd server && npm install`
2.  **Environment Sync:** `cp .env.example .env` (Populate with production secrets)
3.  **Core Validation:** The system performs an **Automated Environment Audit** at boot. If `ZTA` requirements are not met, the process terminates to prevent a "Default-Open" security failure.

---

## 📋 Security Compliance & Forensics
*   **Auditability:** Every infrastructure toggle is logged with IP, User-Agent, Device-Fingerprint, and Geo-Data.
*   **Threat Persistence:** Anomalies are stored as `ThreatEvents` in MongoDB for longitudinal risk trend analysis.

---
*Built as a resilient, state-of-the-art defense system for the metropolitan digital frontier.*
