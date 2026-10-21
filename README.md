# 🌿 Verdora — Healthy Cafe Ordering & Reservation System

[![Version](https://img.shields.io/badge/version-v1.0.0-emerald.svg)](https://github.com/dasithaDev/Verdora)
[![Tests](https://img.shields.io/badge/tests-165%20passed%20%7C%200%20failed-brightgreen.svg)]()
[![Security](https://img.shields.io/badge/vulnerabilities-0%20detected-brightgreen.svg)]()
[![Node Version](https://img.shields.io/badge/node-v20%2B-blue.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Status](https://img.shields.io/badge/status-Production%20Ready-success.svg)]()

> **EE4207 Web Application Development Mini Project**  
> **Author / Developer:** Dasitha Nayanapriya  
> **Institution:** Department of Electrical and Information Engineering, Faculty of Engineering, University of Ruhuna  

---

## 📖 1. Project Overview

**Verdora** is a specialized full-stack web application designed for an organic, health-oriented cafe. It seamlessly unifies nutritious food and cold-pressed beverage ordering, real-time cart calculations with server-authoritative integrity, conflict-free dining table reservations, and an executive administrative operations console.

The application features a bespoke **Obsidian Emerald & Ceylon Gold** luxury botanical design aesthetic, blending modern glassmorphism, fluid micro-interactions, responsive mobile-first layouts, and robust defensive security controls.

---

## ✨ 2. Key Capabilities & Features

### 🥗 Customer Dining Experience
* **Nutritious Menu Catalog:** Browse organic breakfast bowls, artisan sourdough toast, specialty roasts, and cold-pressed juices.
* **Instant Search & Multi-Filters:** Real-time client-side and server-side text search, dietary categorization, and price sorting (Low ➔ High, High ➔ Low).
* **Interactive Cart & Authoritative Checkout:** Floating cart drawer with instant quantity modifications. **Server-authoritative pricing:** The browser client transmits only item IDs and quantities; prices and totals are calculated authoritatively by the backend server.
* **Immutable Snapshotting:** Line items freeze frozen snapshots of item names and prices at the time of purchase, preventing historical receipt corruption when menu items are edited.
* **Customer Profile & Order History:** Secure access to personal order receipts with status badges (`placed`, `preparing`, `ready`, `completed`, `cancelled`).
* **Table Reservation Engine:** Book dining tables for future dates with smart capacity matching. Standard **90-minute slots** during cafe operating hours (**08:00 to 22:00**).
* **Double-Booking Conflict Guard:** Mathematical interval intersection validation prevents two dining parties from ever occupying the same table concurrently ($[Start_A, End_A) \cap [Start_B, End_B) = \emptyset$).

### 📊 Executive Operations Console (Admin)
* **Live KPI Analytics Dashboard:** Integrated shadcn & Recharts visualizations tracking **Total Revenue**, **Live Kitchen Queue**, **Today's Bookings**, and **Active Inventory Count**.
* **Visual Analytics Charts:** Weekly gross sales area trend, order fulfillment vs. return rates (97.2% success), and category popularity volume ranking.
* **Kitchen Order Pipeline:** Real-time order tickets advancing through kitchen states: `placed` ➔ `preparing` ➔ `ready` ➔ `completed`.
* **Table Bookings & Seating Controls:** Oversee dining parties, view special guest requests, and click **Seat Party** upon arrival.
* **Menu Recipe Catalog CRUD:** Add new seasonal recipes with pricing, categories, and descriptions; update existing items; or perform safe soft-deactivations without breaking past order logs.
* **Floor Plan Layout:** Visual inspection of all cafe tables, capacities, and operational statuses.

---

## 🛠️ 3. Technology Stack

| Layer | Technologies & Libraries |
| :--- | :--- |
| **Frontend Client** | React 18, Vite 6, Tailwind CSS, Lucide Icons, Recharts, Axios |
| **Backend API** | Node.js (v20+), Express.js (v4.21.2, ES Modules), CORS, Helmet security headers, Morgan |
| **Database** | MongoDB, Mongoose ODM (v8.9.5) |
| **Authentication** | Dual-Mode: HTTP-Only Cookies & JWT Bearer Tokens, Bcrypt password hashing |
| **Testing Harness** | Native ES Module Integration Suites (165 tests, 100% pass rate) |

---

## 📂 4. Repository Structure

```text
Dasitha/
├── client/                     # Frontend Single Page Application (React + Vite)
│   ├── public/                 # Static assets & brand logo (/images/logo.png)
│   ├── src/
│   │   ├── components/         # Reusable UI components & Admin Dashboard
│   │   │   ├── ui/             # shadcn components, Recharts visualizations & dashboard-4
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminDashboard.css
│   │   │   ├── VerdoraCafe.jsx
│   │   │   └── ProfilePage.jsx
│   │   ├── services/           # Axios API services (admin, auth, menu, order)
│   │   ├── App.jsx             # Main router & active view orchestrator
│   │   └── index.css           # Global tokens & botanical dark design system
│   └── package.json
│
├── server/                     # Backend REST API Server (Node.js + Express)
│   ├── src/
│   │   ├── config/             # Environment & MongoDB connection
│   │   ├── controllers/        # Domain controllers (admin, auth, menu, order, reservation, table)
│   │   ├── middleware/         # Auth verification, RBAC gates, error handlers, ObjectId validators
│   │   ├── models/             # Mongoose schemas (User, MenuItem, Order, Reservation, CafeTable)
│   │   ├── routes/             # Versioned REST endpoints (/api/v1/*)
│   │   ├── seeds/              # Database seeder (seed.js)
│   │   ├── app.js              # Express application assembly
│   │   └── server.js           # HTTP listener & graceful shutdown
│   ├── tests/                  # Integration, unit, and security test suites (8 suites)
│   └── package.json
│
├── docs/                       # Comprehensive Academic & Technical Documentation
│   ├── REQUIREMENTS.md         # Software Requirements Specification (SRS)
│   ├── ARCHITECTURE.md         # 3-Tier architecture & sequence diagrams
│   ├── DATABASE.md             # Mongoose schemas & Mermaid ERD
│   ├── API.md                  # Complete REST API v1 specification
│   ├── SECURITY.md             # Threat modeling, RBAC, and IDOR protection
│   ├── TEST_PLAN.md            # QA test plan with P0/P1/P2 priority matrices
│   ├── TEST_REPORT.md          # Official execution report (165 tests passing)
│   ├── USER_GUIDE.md           # Illustrated end-user and administrator manual
│   ├── DEPLOYMENT.md           # Production cloud deployment guide (Atlas, Render, Vercel)
│   └── DEMO_SCRIPT.md          # 5-Minute video demonstration script
│
├── package.json                # Root orchestrator scripts
└── README.md
```

---

## 🚀 5. Getting Started

### 5.1 Prerequisites
* **Node.js:** v18.0.0 or higher (v20+ recommended)
* **npm:** v9.0.0 or higher
* **MongoDB:** Local MongoDB instance running on port `27017` or a MongoDB Atlas connection string.

### 5.2 One-Command Installation
Clone the repository and install all dependencies:
```bash
git clone https://github.com/dasithaDev/Verdora.git
cd Verdora
npm run install:all
```

### 5.3 Environment Configuration
Create `.env` files in both `server/` and `client/` using the provided templates:

**Server Configuration (`server/.env`):**
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/verdora_cafe
JWT_SECRET=super_secret_jwt_key_verdora_development_min_32_characters
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

**Client Configuration (`client/.env`):**
```env
VITE_API_URL=http://localhost:5000/api/v1
```

### 5.4 Database Seeding
Seed the database with sample menu items, cafe dining tables, and default administrative & customer accounts:
```bash
npm run seed
```

### 5.5 Starting Development Servers
Run backend and frontend concurrently from the root directory:
```bash
# Terminal 1: Backend API (port 5000)
npm run dev:server

# Terminal 2: Frontend Client (port 5173)
npm run dev:client
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## 🔐 6. Default Demonstration Credentials

| Role | Email | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@verdora.local` | `Admin123!` | Access to Admin Operations Dashboard, Menu CRUD, Kitchen Orders, Table Seating |
| **Customer** | `customer@verdora.local` | `Customer123!` | Public menu browsing, interactive cart, checkout, order history, table reservations |

---

## 📡 7. REST API Endpoints Summary

Base URL: `http://localhost:5000/api/v1`

| Domain | Method | Endpoint | Access | Description |
| :--- | :---: | :--- | :---: | :--- |
| **Health** | `GET` | `/health` | Public | System uptime and MongoDB connectivity status |
| **Auth** | `POST` | `/auth/register` | Public | Register new customer account |
| | `POST` | `/auth/login` | Public | Authenticate user & issue JWT cookie/token |
| | `GET` | `/auth/me` | Customer | Retrieve current authenticated user profile |
| | `POST` | `/auth/logout` | Customer | Invalidate session & clear cookies |
| **Menu** | `GET` | `/menu` | Public | Browse catalog with search, filter, sort & pagination |
| | `GET` | `/menu/:id` | Public | Retrieve single dish details by ID |
| | `POST` | `/menu` | **Admin** | Create new menu item |
| | `PATCH` | `/menu/:id` | **Admin** | Update dish price, description, or availability |
| | `DELETE`| `/menu/:id` | **Admin** | Soft-deactivate menu item (`isAvailable: false`) |
| **Orders** | `POST` | `/orders` | Customer | Create order with authoritative server price calculation |
| | `GET` | `/orders/my` | Customer | Retrieve caller's order history |
| | `GET` | `/orders/:id` | Customer / Admin | Get order details by ID (IDOR protected) |
| | `PATCH` | `/orders/:id/cancel` | Customer | Cancel order (eligible only while in `placed` status) |
| | `GET` | `/admin/orders` | **Admin** | List all cafe orders with status filter & pagination |
| | `PATCH` | `/admin/orders/:id/status` | **Admin** | Transition order status (`placed` ➔ `preparing` ➔ `ready` ➔ `completed`) |
| **Reservations** | `POST` | `/reservations` | Customer | Book table slot with double-booking conflict prevention |
| | `GET` | `/reservations/my` | Customer | Retrieve caller's table reservations |
| | `GET` | `/reservations/:id` | Customer / Admin | Get reservation details (IDOR protected) |
| | `PATCH` | `/reservations/:id` | Customer | Edit party size or special requests |
| | `PATCH` | `/reservations/:id/cancel` | Customer | Cancel reservation |
| | `GET` | `/admin/reservations` | **Admin** | List all reservations with status filters |
| | `PATCH` | `/admin/reservations/:id/status` | **Admin** | Update reservation status (Seat Party ➔ `completed`) |
| **Tables** | `GET` | `/tables` | Public | List all cafe dining tables and capacities |
| | `GET` | `/tables/availability` | Public | Check available table slots for date & time |
| **Analytics** | `GET` | `/admin/stats` | **Admin** | Aggregates revenue, kitchen queue, and daily bookings |

*Full API schema documentation with request/response envelopes: [docs/API.md](docs/API.md).*

---

## 🧪 8. Quality Assurance & Automated Testing

Verdora includes an extensive automated test suite covering **165 test cases** across 8 specialized integration test suites:

```bash
# Run the complete test suite (all 165 automated tests)
npm test

# Run individual test suites
npm run test:models         # Mongoose schema constraints, password hashing, negative price checks (10 tests)
npm run test:middleware     # Error envelopes, JWT verification, RBAC gates, ObjectId validators (23 tests)
npm run test:auth           # Registration, login, duplicate email rejection, rate limiting (33 tests)
npm run test:menu           # Catalog search, category filter, sorting, pagination, admin CRUD (32 tests)
npm run test:orders         # Server price authority, status pipelines, order history isolation (18 tests)
npm run test:reservations   # Overlap conflict engine, capacity check, customer edits, seating (18 tests)
npm run test:admin          # Executive KPI aggregation, live queue counters, menu mutations (15 tests)
npm run test:security       # IDOR protection, role escalation defense, NoSQL injection, Helmet (16 tests)
```

```
========================================================================================
Test Suite Execution Summary:
Passed: 165 | Failed: 0 | Skipped: 0 | Pass Rate: 100.0%
========================================================================================
```

*Complete test plan and execution logs: [docs/TEST_PLAN.md](docs/TEST_PLAN.md) and [docs/TEST_REPORT.md](docs/TEST_REPORT.md).*

---

## 📚 9. Project Documentation Sitemap

All design blueprints, technical specifications, and user manuals are available in the [`docs/`](docs/) directory:

1. **[docs/REQUIREMENTS.md](docs/REQUIREMENTS.md):** Software Requirements Specification (SRS), user stories, acceptance criteria, and business rules.
2. **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md):** 3-tier decoupled architecture, sequence diagrams, and client/server separation.
3. **[docs/DATABASE.md](docs/DATABASE.md):** Data dictionary, Mongoose schema constraints, indexes, and Mermaid Entity Relationship Diagram (ERD).
4. **[docs/API.md](docs/API.md):** Complete REST API contract, request/response JSON payloads, and error codes.
5. **[docs/SECURITY.md](docs/SECURITY.md):** Security threat modeling, RBAC permission matrix, IDOR defense, and defensive header policies.
6. **[docs/TEST_PLAN.md](docs/TEST_PLAN.md):** Quality assurance test plan with P0/P1/P2 priority classifications and traceability matrices.
7. **[docs/TEST_REPORT.md](docs/TEST_REPORT.md):** Official test execution report with 165 passed tests, responsive audits, and sign-off.
8. **[docs/USER_GUIDE.md](docs/USER_GUIDE.md):** End-user manual for dining customers and operations manual for cafe administrators.
9. **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md):** Step-by-step production cloud deployment guide (MongoDB Atlas, Render, Vercel).
10. **[docs/DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md):** 5-minute video demonstration script with scene-by-scene action cues.

---

## ⚖️ 10. License & Academic Integrity

This project was developed by **Dasitha Nayanapriya** as an academic submission for **EE4207: Web Application Development**.  
Released under the [MIT License](LICENSE).
