# 🏙️ Aegis Chennai: Zero Trust Urban Infrastructure Platform

### *Securing the Digital Pulse of a Smart City*

Aegis Chennai is a production-ready, **Zero Trust** security framework and interactive dashboard designed to protect critical urban infrastructure. From traffic coordination to smart grid management, it enforces strict identity verification, role-based access control (RBAC), and real-time threat intelligence.

---

## 🏗️ Architecture Overview

The system follows a **decoupled micro-architecture** designed for high availability and military-grade security:

-   **Secure API Gateway (Node.js/Express):** Enforces triple-layer authentication (JWT + RBAC + Device Trust).
-   **Intelligence Engine:** Real-time threat detection system that monitors for Brute Force, DDoS, and Privilege Escalation.
*   **Interactive Command Center (React):** A high-performance, GPU-accelerated dashboard providing 360° visibility into city operations.
*   **Resilient Data Layer (MongoDB):** Secure, audit-ready storage for infrastructure states and security events.

---

## 🛠️ Tech Stack

-   **Frontend:** React 18, Leaflet.js (GPU-Accelerated Maps), Axios (Secure Interceptors), CSS Transitions (60FPS).
-   **Backend:** Node.js, Express, MongoDB (Atlas), Redis (Token Revocation).
-   **Security:** JSON Web Tokens (JWT), Bcrypt.js (Password Hashing), Helmet, Rate Limiter, NoSQL Injection protection.

---

## 🛡️ Security Features & Threat Model

### **1. Zero Trust Identity**
*   **Dual-Token System:** 15-minute Access Tokens + 7-day HttpOnly Refresh Tokens.
*   **Token Revocation:** Persistent session invalidation via Redis blacklist for immediate logout.

### **2. Device Trust Scoring**
*   Each user maintains a **Dynamic Trust Score (0-100)**.
*   Actions like unauthorized access attempts or suspicious travel speeds (Geo-IP) reduce trust, leading to automatic account lockout.

### **3. Advanced Threat detection**
*   **Impossible Travel:** Detects logins from geographically distant locations in unrealistic timeframes.
*   **Brute Force Protection:** Atomic login lockouts after 5 failed attempts.
*   **API Rate Limiting:** Global and per-endpoint limiting to neutralize DDoS and scraping.

---

## 🚀 Setup Instructions

### **Prerequisites**
-   Node.js (v16+)
-   MongoDB (Atlas or Local)
-   Redis (Optional, for Token Revocation)

### **Backend Setup**
1.  Navigate to `/server`
2.  `npm install`
3.  `cp .env.example .env` (Add your MongoDB URI and JWT Secrets)
4.  `npm start`

### **Frontend Setup**
1.  Navigate to `/client`
2.  `npm install`
3.  `cp .env.example .env`
4.  `npm start`

---

## ⚙️ Environment Variables Required

| Variable | Description | Default |
| :--- | :--- | :--- |
| `MONGO_URI` | MongoDB Connection String | Required |
| `JWT_SECRET` | Secret for Access Tokens | Required |
| `REFRESH_SECRET` | Secret for Refresh Tokens | Required |
| `REDIS_URL` | Redis Connection URI | Required |
| `PORT` | Server Port | 5000 |
| `NODE_ENV` | Environment Type | development |

---

## 📜 Deployment Instructions

1.  **Backend:** Deploy via Render, Heroku, or AWS EC2. Add Environment Variables in the provider's dashboard.
2.  **Frontend:** Build via `npm run build` and deploy to Vercel or Netlify.
3.  **Database:** Use MongoDB Atlas for a secure, distributed cloud database.

---

## 👮 Security Considerations

-   **Production Mode:** Ensure `NODE_ENV=production` to disable verbose stack traces.
-   **CORS:** Strictly define `CORS_ORIGIN` in production to prevent unauthorized domain access.
-   **HTTPS:** Always serve behind TLS/SSL to protect tokens in transit.

---

*This project was built for high-stakes urban environments where security isn't just a feature—it's the core mission.*
