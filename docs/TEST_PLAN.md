# Verdora — Quality Assurance & Test Plan (TEST_PLAN.md)

**Document Version:** 1.0  
**Phase:** Phase 9 — Integration, Security and Regression Testing  
**Course Module:** EE4207 Web Application Development Mini Project  
**Author / Contributor:** Dasitha Nayanapriya  
**System:** Verdora Healthy Cafe System (React, Node.js, Express, MongoDB)  

---

## 1. Test Strategy & Overview

The Verdora quality assurance strategy adopts a multi-tiered testing model designed to guarantee data persistence, strict role separation (RBAC), server-authoritative business rules, and resistance against common web security vulnerabilities.

### 1.1 Testing Hierarchy
1. **Schema & Model Validation Layer:** Validates Mongoose schema constraints, default states, type conversions, and password hashing algorithms.
2. **Middleware & Route Security Layer:** Validates authentication token extraction, role authorization gates, rate limiting, and parameter validation.
3. **Integration & API Service Layer:** Tests complete end-to-end HTTP request/response lifecycles against a live database instance.
4. **Security & Boundary Penetration Layer:** Tests Insecure Direct Object References (IDOR), NoSQL injection resistance, privilege escalation, and secret sanitization.
5. **Cross-Browser & Responsive UI Verification:** Validates interactive workflows, error boundaries, empty states, and layout stability across desktop, tablet, and mobile viewports.

### 1.2 Test Priorities
- **P0 (Critical / Blocker):** Core CRUD functionality, persistent storage, authentication gates, and data protection boundaries. Must pass 100% prior to any release.
- **P1 (High):** Input validation, error response shapes, business rule enforcement (e.g. reservation conflicts, order cancellations), and boundary handling.
- **P2 (Medium / Normal):** Edge-case inputs, pagination boundaries, empty states, and aesthetic/responsive refinements.

---

## 2. Test Environment & Execution Matrix

| Component | Technology | Configuration / Scope |
| :--- | :--- | :--- |
| **Backend API** | Express.js (v4.21.2) | Node.js v20+, port `5000` (live) / isolated ports `5091–5099` (tests) |
| **Database** | MongoDB & Mongoose (v8.9.5) | Local MongoDB instance / Atlas test database with isolated collections |
| **Frontend UI** | React 18, Vite 6, Tailwind CSS | Chromium / Edge / Chrome DevTools mobile emulation |
| **Test Runner** | Native ES Module Test Harness | Supertest-compatible fetch-based integration suites |
| **Security Auditing** | npm audit, Helmet v8.0 | Zero high/critical CVEs in dependency graph |

---

## 3. Comprehensive Test Matrices

### 3.1 Environment & Configuration Tests (ENV)

| Test ID | Priority | Description | Preconditions | Expected Result |
| :--- | :--- | :--- | :--- | :--- |
| **ENV-01** | P0 | Server initialization with valid `.env` | MongoDB online, valid env vars | Server binds to configured port; MongoDB connected |
| **ENV-02** | P0 | Server startup with missing `MONGO_URI` | `MONGO_URI` unset | Server exits cleanly with descriptive error; no credentials leaked |
| **ENV-03** | P1 | Health check endpoint invocation | Server running | `GET /api/v1/health` returns HTTP 200 with uptime and status: ok |
| **ENV-04** | P1 | Unknown API route request | Server running | `GET /api/v1/unknown-endpoint` returns HTTP 404 with JSON error envelope |
| **ENV-05** | P1 | Database seed script idempotency | DB connected | Running `npm run seed` twice updates or refreshes without primary key collisions |
| **ENV-06** | P0 | Repository secret scan | Git history | Zero `.env` files, production credentials, or private keys in repository |

---

### 3.2 Authentication & Authorization Tests (AUTH)

| Test ID | Priority | Description | Preconditions | Expected Result |
| :--- | :--- | :--- | :--- | :--- |
| **AUTH-01** | P0 | Customer registration with valid inputs | Unique email | HTTP 201; user created in DB; JWT token and safe user payload returned |
| **AUTH-02** | P1 | Duplicate email registration rejection | Email already exists | HTTP 400 with code `DUPLICATE_EMAIL`; no duplicate record created |
| **AUTH-03** | P1 | Registration with malformed email | Email missing `@` or domain | HTTP 400 with code `VALIDATION_ERROR` |
| **AUTH-04** | P1 | Registration with weak password (<6 chars) | Short password | HTTP 400 with code `VALIDATION_ERROR` |
| **AUTH-05** | P0 | Password hashing verification in DB | User registered | Password stored in MongoDB as bcrypt hash (`$2a$...`), never plaintext |
| **AUTH-06** | P0 | Public registration role escalation defense | Payload `{ role: "admin" }` | HTTP 201; server overrides role to `customer` |
| **AUTH-07** | P0 | Login with valid customer credentials | Account exists | HTTP 200; auth token issued; cookie set |
| **AUTH-08** | P1 | Login with incorrect password | Account exists | HTTP 401 with generic error: "Invalid email or password" |
| **AUTH-09** | P1 | Login with non-existent email | Account does not exist | HTTP 401 with generic message; prevents account enumeration |
| **AUTH-10** | P1 | Access protected endpoint unauthenticated | No token provided | `GET /api/v1/auth/me` returns HTTP 401 UNAUTHORIZED |
| **AUTH-11** | P1 | Access current user profile (`/auth/me`) | Valid customer token | HTTP 200 with user profile; `passwordHash` strictly excluded |
| **AUTH-12** | P1 | User logout endpoint | Active session | HTTP 200; token cookie cleared |
| **AUTH-13** | P0 | Customer token accessing admin endpoint | Customer token | `GET /api/v1/admin/stats` returns HTTP 403 FORBIDDEN |
| **AUTH-14** | P0 | Admin token accessing admin endpoint | Admin token | `GET /api/v1/admin/stats` returns HTTP 200 with operational stats |
| **AUTH-15** | P1 | Response payload secret sanitization | Login/Register | `password` and `passwordHash` fields absent from JSON response |

---

### 3.3 Menu Management & Catalog Tests (MENU)

| Test ID | Priority | Description | Preconditions | Expected Result |
| :--- | :--- | :--- | :--- | :--- |
| **MENU-01** | P0 | Public browsing of active menu items | Menu items seeded | `GET /api/v1/menu` returns HTTP 200 with array of available dishes |
| **MENU-02** | P0 | Retrieve single menu item by valid ID | Valid item ID | `GET /api/v1/menu/:id` returns HTTP 200 with complete item metadata |
| **MENU-03** | P1 | Retrieve menu item by malformed ID | Non-hex ID string | HTTP 400 with structured `VALIDATION_ERROR` |
| **MENU-04** | P1 | Retrieve menu item by non-existent ID | Valid hex ID not in DB | HTTP 404 with code `NOT_FOUND` |
| **MENU-05** | P1 | Search menu items by partial text query | Items in DB | `GET /api/v1/menu?search=Spirulina` returns matching items |
| **MENU-06** | P1 | Filter menu items by category | Items in DB | `GET /api/v1/menu?category=Bowls` returns exclusively Bowls |
| **MENU-07** | P1 | Sort menu items by price ascending | Items in DB | `GET /api/v1/menu?sort=price_asc` returns items ordered lowest to highest price |
| **MENU-08** | P1 | Pagination limit capping | `?limit=5000` | Server bounds limit to maximum 50 items |
| **MENU-09** | P0 | Admin creates valid menu item | Admin token | `POST /api/v1/menu` returns HTTP 201; item persisted to MongoDB |
| **MENU-10** | P1 | Non-admin creates menu item | Customer token | `POST /api/v1/menu` returns HTTP 403 FORBIDDEN |
| **MENU-11** | P1 | Create menu item with negative price | Admin token | HTTP 400 with validation failure message |
| **MENU-12** | P0 | Admin updates existing menu item price | Admin token | `PATCH /api/v1/menu/:id` returns HTTP 200; new price persisted |
| **MENU-13** | P0 | Admin soft-deletes menu item | Admin token | `DELETE /api/v1/menu/:id` sets `isAvailable: false`; excluded from public catalog |

---

### 3.4 Cart & Order Processing Tests (ORD)

| Test ID | Priority | Description | Preconditions | Expected Result |
| :--- | :--- | :--- | :--- | :--- |
| **ORD-01** | P0 | Unauthenticated order submission | No token | `POST /api/v1/orders` returns HTTP 401 UNAUTHORIZED |
| **ORD-02** | P1 | Order submission with empty items array | Customer token | HTTP 400 with code `VALIDATION_ERROR` |
| **ORD-03** | P1 | Order item with quantity zero or negative | Customer token | HTTP 400 with code `VALIDATION_ERROR` |
| **ORD-04** | P0 | Authoritative server price calculation | Client sends fake total | Server calculates total using database price; client total ignored |
| **ORD-05** | P0 | Immutable snapshot persistence | Item ordered | Order stores `itemNameSnapshot` and `unitPriceSnapshot` frozen in time |
| **ORD-06** | P1 | Ordering unavailable/deactivated item | Item `isAvailable: false` | HTTP 400 with code `ITEM_UNAVAILABLE` |
| **ORD-07** | P0 | Customer retrieves own order history | Customer token | `GET /api/v1/orders/my` returns exclusively caller's orders |
| **ORD-08** | P0 | IDOR: Customer A views Customer B order | Customer A token | `GET /api/v1/orders/:idB` returns HTTP 403 FORBIDDEN |
| **ORD-09** | P0 | Customer cancels order in `placed` status | Own order in `placed` | `PATCH /api/v1/orders/:id/cancel` sets status to `cancelled` |
| **ORD-10** | P1 | Customer cancels order in `preparing` status | Order in `preparing` | HTTP 400 rejection; prep has already commenced |
| **ORD-11** | P0 | Admin lists all orders with pagination | Admin token | `GET /api/v1/admin/orders` returns all cafe orders with pagination envelope |
| **ORD-12** | P0 | Admin transitions order status pipeline | Admin token | `PATCH /admin/orders/:id/status` advances `placed` ➔ `preparing` ➔ `ready` ➔ `completed` |
| **ORD-13** | P1 | Disallowed order status transition | Admin token | Attempting `preparing` ➔ `placed` returns HTTP 400 error |

---

### 3.5 Table Reservations & Conflict Engine Tests (RES)

| Test ID | Priority | Description | Preconditions | Expected Result |
| :--- | :--- | :--- | :--- | :--- |
| **RES-01** | P0 | Valid customer table booking | Available slot | `POST /api/v1/reservations` returns HTTP 201 with confirmed table |
| **RES-02** | P1 | Booking date in the past | Yesterday's date | HTTP 400 with code `INVALID_DATE` |
| **RES-03** | P1 | Booking outside operating hours (08:00–22:00) | `startTime: "05:00"` | HTTP 400 with code `OUTSIDE_HOURS` |
| **RES-04** | P1 | Guest count exceeding cafe table capacity | Guests = 10, Table = 4 | HTTP 400 with code `INSUFFICIENT_CAPACITY` |
| **RES-05** | P0 | Double booking prevention (same table & slot) | Table already booked | Second booking returns HTTP 409 `RESERVATION_CONFLICT` |
| **RES-06** | P1 | Booking adjacent non-overlapping slot | Slot ends at 14:00 | Slot starting at 14:00 on same table succeeds with HTTP 201 |
| **RES-07** | P0 | Smart automatic table allocation | Table requested = auto | System allocates table whose capacity best fits guest count |
| **RES-08** | P0 | Customer views own reservation details | Customer token | `GET /api/v1/reservations/:id` returns reservation record |
| **RES-09** | P0 | IDOR: Customer A views Customer B reservation | Customer A token | `GET /api/v1/reservations/:idB` returns HTTP 403 FORBIDDEN |
| **RES-10** | P0 | Customer cancels confirmed reservation | Own reservation | `PATCH /reservations/:id/cancel` sets status to `cancelled` |
| **RES-11** | P1 | Customer cancels already-cancelled booking | Status `cancelled` | HTTP 400 with code `ALREADY_CANCELLED` |
| **RES-12** | P0 | Admin seats party (status update) | Admin token | `PATCH /admin/reservations/:id/status` updates status to `completed` |

---

### 3.6 Administrative Operations & Analytics Tests (ADM)

| Test ID | Priority | Description | Preconditions | Expected Result |
| :--- | :--- | :--- | :--- | :--- |
| **ADM-01** | P0 | Unauthenticated request to admin stats | No token | `GET /api/v1/admin/stats` returns HTTP 401 |
| **ADM-02** | P0 | Customer token request to admin stats | Customer token | `GET /api/v1/admin/stats` returns HTTP 403 FORBIDDEN |
| **ADM-03** | P0 | Live KPI metrics aggregation | Admin token | Returns total revenue, active kitchen queue, today's bookings, and catalog counts |
| **ADM-04** | P1 | Revenue metric calculation accuracy | Seeded orders | Revenue accurately sums only fulfilled and active orders, excluding cancelled |
| **ADM-05** | P1 | Active kitchen queue counter accuracy | Seeded orders | Queue strictly counts orders in `placed` and `preparing` states |
| **ADM-06** | P1 | Admin query reservations by status | Admin token | `GET /api/v1/admin/reservations?status=confirmed` returns filtered bookings |
| **ADM-07** | P1 | Cafe table list retrieval | Admin token | `GET /api/v1/tables` returns list of all tables with capacities |

---

### 3.7 Defensive Security & Boundary Tests (SEC)

| Test ID | Priority | Description | Preconditions | Expected Result |
| :--- | :--- | :--- | :--- | :--- |
| **SEC-01** | P0 | Role escalation prevention on register | `{ role: "admin" }` | Role is strictly set to `customer` |
| **SEC-02** | P0 | Unauthenticated order history blocked | No token | HTTP 401 UNAUTHORIZED |
| **SEC-03** | P0 | Unauthenticated reservation history blocked | No token | HTTP 401 UNAUTHORIZED |
| **SEC-04** | P0 | Cross-tenant order inspection (IDOR) | Customer A token | HTTP 403 FORBIDDEN |
| **SEC-05** | P0 | Cross-tenant reservation inspection (IDOR) | Customer A token | HTTP 403 FORBIDDEN |
| **SEC-06** | P0 | Cross-tenant order cancellation (IDOR) | Customer A token | HTTP 403 FORBIDDEN |
| **SEC-07** | P0 | Cross-tenant reservation edit (IDOR) | Customer A token | HTTP 403 FORBIDDEN |
| **SEC-08** | P0 | Customer access to `/admin/stats` | Customer token | HTTP 403 FORBIDDEN |
| **SEC-09** | P0 | Customer access to `/admin/orders` | Customer token | HTTP 403 FORBIDDEN |
| **SEC-10** | P0 | Customer access to `/admin/reservations` | Customer token | HTTP 403 FORBIDDEN |
| **SEC-11** | P0 | Customer access to `/admin/tables` | Customer token | HTTP 403 FORBIDDEN |
| **SEC-12** | P1 | Malformed ObjectId rejection | `id="invalid123"` | HTTP 400 VALIDATION_ERROR |
| **SEC-13** | P1 | NoSQL query injection in search | `?search[$gt]=` | Safely handled as string query without internal error |
| **SEC-14** | P1 | Excessive pagination limit cap | `?limit=5000` | Bounded automatically to 50 max |
| **SEC-15** | P1 | Defensive HTTP security headers | Any request | Helmet header `X-Content-Type-Options: nosniff` present |
| **SEC-16** | P0 | Absence of password hashes in responses | Auth endpoints | `passwordHash` stripped from all JSON responses |

---

## 4. Defect Severity & Triage Policy

1. **Severity 1 (Blocker):** Data corruption, unauthorized data mutation, privilege escalation, unhandled server crashes.
2. **Severity 2 (High):** Broken business logic (e.g. overlapping reservations allowed, incorrect order totals, failing status pipelines).
3. **Severity 3 (Medium):** UI misalignments, missing empty states, unclear validation error messages.
4. **Severity 4 (Low):** Minor styling imperfections, non-critical copy adjustments.

---

## 5. Phase 09 Exit Criteria
- [x] All 165 automated tests execute and pass with zero failures (`npm test`).
- [x] Zero high or critical dependency vulnerabilities detected via `npm audit`.
- [x] All P0 and P1 security boundary tests pass with verified HTTP 403 / 400 status codes.
- [x] Production client bundle builds cleanly without compiler errors (`npm run build:client`).
- [x] `TEST_REPORT.md` compiled with complete execution evidence and sign-off.
