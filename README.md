# Final Exam: Internet Programming (2026)
## HR Manager & Salary Analytics System

**Student Name:** Ratchaphol  
**Student ID:** 6730202726  
**Repository Name:** Std6730202726IPFinal2026  

---

## 📌 Project Overview
A full-stack application built for employee records management and salary structure analytics:
- **Backend:** Node.js (Express.js), MySQL (`ip_std6730202726`), In-Memory Fallback
- **Frontend:** React Native (Expo), TypeScript, Cross-Platform (Web / Android / iOS)

---

## 🛠 Features

### Phase 1: Authentication & Employee Management (CRUD)
- **Authentication:** `POST /api/login` (admin / password123)
- **Get Employees:** `GET /api/employees`
- **Add Employee:** `POST /api/employees` (Client-side & Server-side validation)
- **Toggle Status:** `PUT /api/employees/:id/status` (Active <-> On Leave)
- **Delete Employee:** `DELETE /api/employees/:id` (Confirmation Alert Dialog)

### Phase 2: Automated Salary Clustering (K-Means Analytics)
- **Endpoint:** `GET /api/employees/salary-clusters`
- **Algorithm:** 1D K-Means Clustering ($k=3$) grouping salaries into:
  - **Tier 1:** Low salary range
  - **Tier 2:** Mid salary range
  - **Tier 3:** High salary range
- **UI:** Summary Cards displaying Tier name, employee count, and average base salary (centroid) with a loading indicator.

### Database Integration
- **Database:** `ip_std6730202726`
- **Table:** `Ratchaphol_6730202726`
- Seamlessly falls back to In-Memory mode if MySQL is not available.

---

## 🚀 How to Run

### 1. Backend Server
```bash
cd backend
npm install
node server.js
```
> Server runs on `http://localhost:3001` (or `http://119.59.102.161:3066`).

### 2. Frontend App
```bash
cd frontend
npm install
npx expo start --web
```
> Open browser at `http://localhost:8081`

---

## 👤 Credentials
- **Username:** `admin`
- **Password:** `password123`
