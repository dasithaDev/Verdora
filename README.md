# Verdora — Healthy Cafe Ordering & Reservations

[![Node Version](https://img.shields.io/badge/node-v20%2B-brightgreen.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Status](https://img.shields.io/badge/status-Phase%200%20Complete-success.svg)]()

> **EE4207 Web Application Development Mini Project**  
> A full-stack web application designed for a healthy, organic cafe. Customers can explore nutritious food and cold-pressed drinks, manage a cart, place orders, and reserve dining tables. Cafe administrators can manage menu items, track orders, and oversee reservations through a protected dashboard.

---

## 1. Technology Stack

* **Frontend:** React 19, Vite, Vanilla CSS Design System with CSS variables and glassmorphism, Axios, React Router.
* **Backend:** Node.js, Express.js (ES Modules), CORS, Helmet security headers, Morgan logging.
* **Database:** MongoDB & Mongoose.
* **Environment:** Antigravity IDE, Git/GitHub.

---

## 2. Directory Structure

```text
Dasitha/
├── client/                 # React + Vite client
│   ├── public/             # Static assets
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── services/       # Axios API client (api.js)
│   │   ├── App.jsx         # Root view & live health monitor
│   │   ├── index.css       # Botanical dark/glass design system
│   │   └── main.jsx        # Client entry point
│   ├── .env.example        # Client environment template
│   └── package.json
│
├── server/                 # Node.js + Express API server
│   ├── src/
│   │   ├── config/         # Environment & MongoDB connection
│   │   ├── middleware/     # Error & 404 handlers
│   │   ├── routes/         # Versioned routes (/api/v1/health)
│   │   ├── app.js          # Express app configuration
│   │   └── server.js       # HTTP server entry point & graceful shutdown
│   ├── .env.example        # Server environment template
│   └── package.json
│
├── docs/                   # Implementation blueprints & project documentation
├── Healthy_Cafe_Full_Implementation_Plan.md
├── .gitignore
├── package.json            # Root workspace orchestrator
└── README.md
```

---

## 3. Getting Started

### Prerequisites
* **Node.js**: v18.0.0 or higher (v22+ recommended)
* **npm**: v9.0.0 or higher
* **MongoDB**: Local MongoDB instance (`mongodb://127.0.0.1:27017`) or MongoDB Atlas connection string.

### Quick Setup

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd Dasitha
   ```

2. **Configure Environment Variables:**
   * Create `server/.env` based on `server/.env.example`:
     ```env
     NODE_ENV=development
     PORT=5000
     MONGODB_URI=mongodb://127.0.0.1:27017/healthy_cafe_dev
     CLIENT_ORIGIN=http://localhost:5173
     ```
   * Create `client/.env` based on `client/.env.example`:
     ```env
     VITE_API_BASE_URL=http://localhost:5000/api/v1
     ```

3. **Install Dependencies:**
   ```bash
   # From the project root:
   npm run install:all
   ```

4. **Run the Development Servers:**
   * **Terminal 1 (Backend API):**
     ```bash
     npm run dev:server
     # Server runs at http://localhost:5000
     ```
   * **Terminal 2 (Frontend Client):**
     ```bash
     npm run dev:client
     # Client runs at http://localhost:5173
     ```

---

## 4. Health Check Endpoint

You can verify the backend status at any time:

```bash
curl http://localhost:5000/api/v1/health
```

**Sample Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "status": "UP",
    "uptime": 45.2,
    "timestamp": "2026-10-19T06:15:00.000Z",
    "service": "verdora-api",
    "environment": "development",
    "database": {
      "connected": true,
      "status": "healthy"
    }
  }
}
```

---

## 5. Implementation Roadmap

* [x] **Phase 0:** Requirements & Project Setup (Scaffolding, Health Check, Git Setup)
* [ ] **Phase 1:** Requirements, UX and Design Specification
* [ ] **Phase 2:** MongoDB Connection & Data Models (User, MenuItem, Order, Reservation, CafeTable)
* [ ] **Phase 3:** API Foundation & Security Middleware
* [ ] **Phase 4:** Authentication & Role-based Authorization
* [ ] **Phase 5:** Menu Management CRUD & Visual Catalog
* [ ] **Phase 6:** Cart & Order Workflows
* [ ] **Phase 7:** Table Reservation System & Conflict Prevention
* [ ] **Phase 8:** Admin Dashboard & Usability Polish
* [ ] **Phase 9:** Security, Regression & Integration Testing
* [ ] **Phase 10:** Documentation, Final Deployment & Submission
