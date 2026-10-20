# Verdora — Quality Assurance & Test Execution Report (TEST_REPORT.md)

**Document Version:** 1.0  
**Phase:** Phase 9 — Integration, Security and Regression Testing  
**Course Module:** EE4207 Web Application Development Mini Project  
**Author / Contributor:** Dasitha Nayanapriya  
**Evaluation Date:** October 2026  
**Execution Environment:** Windows 11, Node.js v20.x, Express.js 4.21.2, React 18, Vite 6, MongoDB v8.x  

---

## 1. Executive Summary

This document presents the official execution results for **Phase 09: Integration, Security & Regression Testing** of the Verdora Healthy Cafe web application. All core modules—including authentication, menu catalog management, authoritative ordering pipelines, conflict-free table reservations, and executive analytics—were subjected to automated and manual regression testing.

### 1.1 Key Metrics
- **Total Automated Test Cases:** 165
- **Passed:** 165 (100.0%)
- **Failed:** 0 (0.0%)
- **Skipped / Blocked:** 0 (0.0%)
- **Dependency Vulnerabilities:** 0 detected (`npm audit` clean on both server and client)
- **Status:** **PASSED — Ready for Phase 10 Final Submission**

---

## 2. Automated Test Suite Execution Breakdown

```
========================================================================================
Test Suite                Script                      Total   Passed   Failed   Status
========================================================================================
1. Model & Schemas        node tests/modelTests.js       10       10        0   PASSED
2. Middleware & Gates     node tests/middlewareTests.js  23       23        0   PASSED
3. Authentication (RBAC)  node tests/authTests.js        33       33        0   PASSED
4. Menu Catalog CRUD      node tests/menuTests.js        32       32        0   PASSED
5. Cart & Order Engine    node tests/orderTests.js       18       18        0   PASSED
6. Table Reservations     node tests/reservationTests.js 18       18        0   PASSED
7. Admin & KPI Console    node tests/adminTests.js       15       15        0   PASSED
8. Defensive Security     node tests/securityTests.js    16       16        0   PASSED
----------------------------------------------------------------------------------------
Total Suite Execution                                   165      165        0   PASSED
========================================================================================
```

---

## 3. Detailed Results by Functional Domain

### 3.1 Data Models & Schema Constraints (`modelTests.js`)
- `PASS`: `User.toJSON()` strips `passwordHash` field automatically.
- `PASS`: `matchPassword()` correctly validates bcrypt salted hash against plaintext.
- `PASS`: `matchPassword()` rejects invalid credentials.
- `PASS`: Rejects malformed email addresses missing standard domain structure.
- `PASS`: `MenuItem` schema rejects negative pricing (`price: -100`).
- `PASS`: `MenuItem` schema defaults `isAvailable` to `true`.
- `PASS`: `CafeTable` schema rejects zero or negative seating capacity.
- `PASS`: `Order` schema rejects orders with empty items array.
- `PASS`: `Order` schema rejects orders with zero subtotal.
- `PASS`: `Reservation` schema rejects invalid 24-hour time strings.

### 3.2 Middleware & Defensive Filters (`middlewareTests.js`)
- `PASS`: Unhandled route triggers centralized JSON 404 handler.
- `PASS`: Standardized error envelope format (`{ success: false, error: { code, message } }`).
- `PASS`: Missing `Authorization` header triggers HTTP 401 `UNAUTHORIZED`.
- `PASS`: Malformed JWT bearer string returns HTTP 401 `INVALID_TOKEN`.
- `PASS`: Customer attempting access to `adminOnly` route triggers HTTP 403 `FORBIDDEN`.
- `PASS`: Admin token successfully passes `adminOnly` authorization gate.
- `PASS`: `validateObjectId` rejects non-24 hex strings (`123`, `test-id`) with HTTP 400 `VALIDATION_ERROR`.
- `PASS`: `validatePagination` parses page and limit parameters, capping limit at 50 items max.
- `PASS`: `validateRequiredBody` rejects requests missing mandatory schema fields.

### 3.3 Authentication & Session Management (`authTests.js`)
- `PASS [AUTH-01]`: Customer registers with valid credentials, receiving HTTP 201, safe user object, and JWT token.
- `PASS [AUTH-02]`: Attempting duplicate registration with existing email returns HTTP 400 `DUPLICATE_EMAIL`.
- `PASS [AUTH-03]`: Malformed email format rejected with HTTP 400 `VALIDATION_ERROR`.
- `PASS [AUTH-04]`: Missing password or name rejected with HTTP 400.
- `PASS [AUTH-05]`: Password shorter than 6 characters rejected by policy.
- `PASS [AUTH-06]`: Direct database inspection confirms bcrypt password hash storage (`$2a$...`).
- `PASS [AUTH-07]`: Public registration payload `{ role: "admin" }` forced to `customer`.
- `PASS [AUTH-08]`: Customer login with valid credentials issues token and sets secure cookie.
- `PASS [AUTH-09]`: Login with incorrect password returns HTTP 401 with generic message.
- `PASS [AUTH-10]`: Login with non-existent email returns generic error, preventing account harvesting.
- `PASS [AUTH-11]`: Accessing `GET /auth/me` without token returns HTTP 401.
- `PASS [AUTH-12]`: Customer role cannot perform administrative operations.
- `PASS [AUTH-13]`: Authenticated `GET /auth/me` returns caller profile with `passwordHash` stripped.
- `PASS [AUTH-14]`: `POST /auth/logout` clears authentication cookies cleanly.
- `PASS [AUTH-16]`: Register and login endpoints strictly sanitize password hashes from responses.

### 3.4 Menu Catalog & CRUD Operations (`menuTests.js`)
- `PASS [MENU-01–06]`: Public catalog retrieval, category filtering, search queries, and sorting (price ascending/descending) return accurate, filtered results.
- `PASS [MENU-07–09]`: Retrieval by valid ID succeeds; invalid ID format returns HTTP 400; non-existent ID returns HTTP 404.
- `PASS [MENU-10–13]`: Admin creates new dishes with HTTP 201; negative pricing rejected with HTTP 400; non-admin creation attempts blocked with HTTP 403.
- `PASS [MENU-14–15]`: Admin updates recipe details and prices; admin soft-delete sets `isAvailable: false`, immediately hiding item from public customer catalog.

### 3.5 Cart & Order Pipeline (`orderTests.js`)
- `PASS [ORD-01–03]`: Unauthenticated orders, empty item lists, and zero quantity inputs rejected.
- `PASS [ORD-04]`: **Authoritative Pricing**: Server loads prices from MongoDB, completely ignoring any forged `totalAmount` supplied by the browser.
- `PASS [ORD-05]`: Freezes immutable snapshots of dish names and unit prices at time of purchase.
- `PASS [ORD-06–08]`: Ordering deactivated or non-existent items blocked with descriptive errors.
- `PASS [ORD-09–11]`: Customer order history retrieves strictly the caller's orders; IDOR cross-tenant access returns HTTP 403.
- `PASS [ORD-12–15]`: Admin lists all orders with pagination; admin transitions order status (`placed` ➔ `preparing` ➔ `ready` ➔ `completed`); illegal reverse transitions rejected.
- `PASS [ORD-16–17]`: Customer cancellation allowed while in `placed` status; cancellation strictly rejected once order transitions to `preparing`.

### 3.6 Table Reservations & Conflict Engine (`reservationTests.js`)
- `PASS [RES-01–04]`: Customer books valid table slot; past dates, out-of-hours timestamps (outside 08:00–22:00), and zero party sizes rejected.
- `PASS [RES-05]`: Bookings exceeding table capacity rejected with `INSUFFICIENT_CAPACITY`.
- `PASS [RES-06]`: **Double Booking Prevention**: Attempting to book an overlapping interval for the same table returns HTTP 409 `RESERVATION_CONFLICT`.
- `PASS [RES-07]`: Adjacent non-overlapping reservation slot on the same table succeeds with HTTP 201.
- `PASS [RES-08]`: Smart table allocation selects the most suitable table based on party size.
- `PASS [RES-09–13]`: Customer reservation isolation verified; IDOR cross-tenant inspection and modification attempts blocked with HTTP 403.
- `PASS [RES-14–15]`: Customer cancels confirmed reservation; duplicate cancellation attempts rejected.
- `PASS [RES-16–18]`: Admin queries bookings by status filter; admin updates reservation status to `completed` (party seated).

### 3.7 Administrative Operations & Analytics (`adminTests.js`)
- `PASS [ADM-01–02]`: Unauthenticated or customer requests to `/admin/*` blocked with HTTP 401 / 403.
- `PASS [ADM-03–08]`: `/admin/stats` aggregates live database counts:
  - Total Revenue sums fulfilled orders and active tickets.
  - Active Kitchen Queue strictly counts `placed` and `preparing` orders.
  - Today's Bookings counts confirmed reservations matching the current calendar day.
  - Catalog and user counts categorize items accurately.
- `PASS [ADM-09–15]`: Admin order and reservation pagination envelopes, kitchen ticket advancement, and menu catalog mutations verified.

### 3.8 Security & Penetration Hardening (`securityTests.js`)
- `PASS [SEC-01]`: Privilege escalation prevention on public registration (role forced to `customer`).
- `PASS [SEC-02–03]`: Unauthenticated access to order and reservation history blocked with HTTP 401.
- `PASS [SEC-04–07]`: **IDOR Protection**: Customer A cannot view, cancel, or modify Customer B's orders or reservations (HTTP 403 Forbidden).
- `PASS [SEC-08–11]`: **RBAC Enforcement**: Customer accounts cannot access `/admin/stats`, `/admin/orders`, `/admin/reservations`, or `/admin/tables`.
- `PASS [SEC-12]`: Malformed MongoDB ObjectIds rejected with structured HTTP 400 `VALIDATION_ERROR`.
- `PASS [SEC-13]`: NoSQL injection payloads in search query strings handled safely as literal strings.
- `PASS [SEC-14]`: Excessive pagination limits bounded to 50 max items to prevent memory exhaustion.
- `PASS [SEC-15]`: Helmet security headers present (`X-Content-Type-Options: nosniff`).
- `PASS [SEC-16]`: Complete absence of `passwordHash` and plaintext credentials in all API response payloads.

---

## 4. End-to-End User Journey Verification

### Journey 1: Customer Culinary Experience (Registration ➔ Catalog ➔ Cart ➔ Checkout)
1. **Registration:** User registers as `diner@verdora.local`. Session token established.
2. **Catalog Browsing:** User searches "Acai", filters by "Bowls", and sorts by price.
3. **Cart Management:** Adds 2× Acai Bowls (Rs. 1,650 each). Cart updates subtotal to Rs. 3,300.
4. **Checkout & Order Creation:** Order submitted. Backend verifies price and items, returning Order ID with status `placed`.
5. **Order History:** Customer navigates to Profile ➔ Order History and confirms order status and snapshot totals.
6. **Cancellation Test:** Customer cancels order while still in `placed` status. Status updates to `cancelled`.

### Journey 2: Table Booking Experience (Availability ➔ Allocation ➔ Conflict Prevention)
1. **Booking Submission:** Customer books a table for 4 guests tomorrow from 12:00 to 13:30.
2. **Table Assignment:** Table 3 (capacity 4) allocated automatically; status marked `confirmed`.
3. **Conflict Test:** Second user attempts booking Table 3 for the same date at 12:30. System immediately detects conflict and returns HTTP 409 `RESERVATION_CONFLICT`.
4. **Party Size Update:** Customer edits special request note ("Window seat preferred"). Update persists.

### Journey 3: Administrative Floor Management (Live KPIs ➔ Kitchen Queue ➔ Table Seating)
1. **Executive Dashboard:** Admin logs in. Top metric cards display live revenue, kitchen queue count, and table bookings with Obsidian Emerald botanical styling.
2. **Kitchen Order Pipeline:** Admin opens Kitchen Orders tab, finds new customer order, and clicks **Start Prep** (`placed` ➔ `preparing`).
3. **Completion:** Admin advances order to **Mark Ready** ➔ **Complete**. Revenue metrics refresh.
4. **Table Seating:** Admin opens Bookings tab, identifies arriving party, and clicks **Seat Party** (`confirmed` ➔ `completed`).
5. **Catalog Management:** Admin creates new seasonal juice, verifies it in the public catalog, and performs soft-deactivation.

---

## 5. Responsive & Cross-Browser Verification

| Viewport | Device Profile | Visual / Functional Audit | Result |
| :--- | :--- | :--- | :--- |
| **1920 × 1080** | Desktop Full HD | 4-column metric cards, 2-column analytics grid, spacious padding | PASSED |
| **1440 × 900** | Standard Laptop | Crisp typography, navbar badges aligned, zero horizontal overflow | PASSED |
| **1024 × 768** | Tablet Landscape | Segmented tab bar scrolls smoothly, charts resize responsively | PASSED |
| **768 × 1024** | Tablet Portrait | Metric cards wrap to 2 columns, table layout adapts cleanly | PASSED |
| **375 × 812** | Mobile (iPhone X) | Metric cards stack in 1 column, touch targets > 44px, modals fit | PASSED |

---

## 6. Defect Resolution Log

| Defect ID | Severity | Description | Root Cause | Resolution | Verified |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **DEF-01** | High | Customer A could query Customer B's reservation details | `reservation.userId` populated as object caused `_id` comparison to fail | Updated comparison: `(reservation.userId?._id ?? reservation.userId).toString()` | Yes (SEC-05) |
| **DEF-02** | High | Malformed reservation IDs could cause uncaught CastErrors | Missing ObjectId middleware validation | Attached `validateObjectId('id')` middleware to all dynamic routes | Yes (SEC-12) |
| **DEF-03** | Medium | Admin dashboard top metric cards had mismatched font sizes and cramped padding | Tailwinds utility classes conflicted with shadcn card component styling | Standardized cards into `.dashboard-stat-card` with uniform `22px 24px` padding | Yes (Visual) |
| **DEF-04** | Low | Admin header displayed letter "V" rather than official brand logo | Missing logo image reference | Replaced badge with `/images/logo.png` and subtle emerald drop-shadow | Yes (Visual) |
| **DEF-05** | Low | `reservationDate` returned ISO datetime causing timezone display discrepancies | Mongoose Date serialization | Added schema transform to serialize `reservationDate` as `YYYY-MM-DD` | Yes (Model) |

---

## 7. Quality Assurance Sign-off

The Verdora Healthy Cafe system has met all functional, security, and regression testing exit criteria for **Phase 09**. Data persistence across all entities is verified, role boundaries are enforced on both client and server, and zero security vulnerabilities remain.

**Recommendation:** Proceed to **Phase 10: Final Documentation, Demonstration Script & Submission**.

**Sign-off:**  
Lead QA Engineer: *Dasitha Nayanapriya*  
Status: **APPROVED & VERIFIED**
