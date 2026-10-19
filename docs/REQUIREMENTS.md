# Verdora — Software Requirements Specification (SRS)

**Document Version:** 1.0  
**Phase:** Phase 1 — Requirements, UX and Architecture  
**Course Module:** EE4207 Web Application Development Mini Project  
**Author / Contributor:** Dasitha Nayanapriya 

---

## 1. Problem Statement & System Overview

Traditional cafe ordering and table booking systems often suffer from:
1. Fragmented communication (phone reservations, manual order tracking).
2. Reservation conflicts (double booking of tables during peak dining hours).
3. Data integrity issues (unauthorized price tampering on client-side checkouts).
4. Lack of transparent dietary and nutrition information for health-conscious diners.

**Verdora** is a specialized web application engineered for an organic, health-oriented cafe. It integrates a nutritious menu catalog, server-authoritative cart and ordering, conflict-free table reservations, and an administrative operations dashboard.

---

## 2. Scope & Boundaries

### 2.1 Core In-Scope Features
* **Guest & Public Browsing:** Menu catalog with search, categorization, sorting, and item nutrition details.
* **Authentication & Authorization:** Secure registration, login, logout, and Role-Based Access Control (`Customer`, `Administrator`).
* **Menu Management:** Full CRUD operations restricted to authorized administrators with soft-delete availability flags.
* **Cart & Order Processing:** Real-time cart calculation on the client with strictly enforced **server-authoritative** price calculations and line-item snapshotting.
* **Table Reservation Engine:** Date/time slot booking with strict server-side table assignment and double-booking conflict prevention.
* **Administrative Operations:** Order status workflow controls and reservation confirmation/rejection dashboards.

### 2.2 Explicit Out-of-Scope (v1 Exclusions)
* Third-party payment gateways (Stripe/PayPal): Orders are placed under a "Pay at Pickup / Dine-in" operational model to preserve grading focus on database-backed CRUD, validation, and role security.
* Automated SMS delivery (Email/SMS gateways deferred to future iterations).

---

## 3. Core Business Rules

| Rule ID | Domain | Specification |
| :--- | :--- | :--- |
| **BR-TIME-01** | Timezone | All reservations and orders operate under `Asia/Colombo` (UTC+05:30). Dates are stored in ISO 8601 UTC in MongoDB and localized for display. |
| **BR-TIME-02** | Operating Hours | The cafe operates from **08:00 to 22:00** daily. Reservation slots must fall completely within operating hours. |
| **BR-RES-01** | Slot Duration | Standard dining slot duration is fixed at **90 minutes** (1.5 hours). |
| **BR-RES-02** | Booking Horizon | Reservations can be booked up to **14 days in advance** with a minimum of **2 hours advance notice**. Past timestamps are strictly rejected. |
| **BR-RES-03** | Conflict Guard | A cafe table cannot be assigned to overlapping reservation intervals: $[Start_A, End_A) \cap [Start_B, End_B) = \emptyset$. |
| **BR-RES-04** | Cancellation | Customers can cancel reservations up to **1 hour** before the reservation start time. Hard deletion is prohibited; status transitions to `cancelled`. |
| **BR-ORD-01** | Price Authority | The browser client sends only `menuItemId` and `quantity`. The backend fetches authoritative prices from the database and calculates subtotals. |
| **BR-ORD-02** | Order Snapshots | Line items store frozen snapshots of `itemNameSnapshot` and `unitPriceSnapshot` to prevent historical order corruption when menu items are edited. |
| **BR-ORD-03** | Order Cancellation | Customers may only cancel an order while its status is `placed`. Once status transitions to `preparing`, cancellation is prohibited. |
| **BR-MENU-01** | Menu Deletion | Menu items linked to historical orders must not be hard-deleted from the database; they are deactivated via `isAvailable: false`. |

---

## 4. User Roles and RBAC Matrix

The system distinguishes three tiers of user access:
* **Guest:** Unauthenticated visitor.
* **Customer:** Registered diner.
* **Administrator:** Cafe management staff.

| Functional Capability | Guest | Customer | Administrator |
| :--- | :---: | :---: | :---: |
| View Home Page & Cafe Info | ✅ | ✅ | ✅ |
| Browse, Search & Filter Menu Catalog | ✅ | ✅ | ✅ |
| User Registration & Login | ✅ | ✅ | ✅ |
| Manage Shopping Cart | ✅ (session) | ✅ | ✅ |
| Submit Order | ❌ | ✅ | ✅ |
| View Own Order History & Details | ❌ | ✅ | ✅ |
| View All Customer Orders & Update Status | ❌ | ❌ | ✅ |
| Create Table Reservation | ❌ | ✅ | ✅ |
| View / Cancel Own Reservations | ❌ | ✅ | ✅ |
| Manage All Reservations (Confirm / Reject) | ❌ | ❌ | ✅ |
| Create, Edit, Deactivate Menu Items | ❌ | ❌ | ✅ |
| Access Admin Operations Dashboard | ❌ | ❌ | ✅ |

---

## 5. Functional Requirements (FR)

### 5.1 Authentication & Authorization (`FR-AUTH`)
* **FR-AUTH-01:** Visitors must be able to register an account with `name`, valid `email`, and a password (minimum 8 characters).
* **FR-AUTH-02:** The system must reject duplicate email registrations with a friendly `409 Conflict` message.
* **FR-AUTH-03:** Passwords must be hashed using `bcrypt` (minimum cost factor 10) before persistence. Plaintext passwords must never be stored or returned.
* **FR-AUTH-04:** Public registration payloads attempting to set `role: "admin"` must be strictly rejected or ignored; default role is `customer`.
* **FR-AUTH-05:** Authentication sessions must issue signed JWT tokens stored in `httpOnly`, `SameSite: Strict` cookies (or Bearer Authorization headers).
* **FR-AUTH-06:** Protected API endpoints must enforce role checks on the server (`401 Unauthorized` for missing tokens, `403 Forbidden` for unauthorized roles).

### 5.2 Menu Catalog & Administration (`FR-MENU`)
* **FR-MENU-01:** Guests and Customers can view active menu items (`isAvailable: true`) categorized by Organic Bowls, Cold Pressed Juices, Artisan Toasts, etc.
* **FR-MENU-02:** Users can search items by partial name (case-insensitive) and filter by dietary categories.
* **FR-MENU-03:** Users can sort menu items by price (ascending/descending) and creation date.
* **FR-MENU-04:** Administrators can create new menu items with `name`, `description`, `category`, `price`, `imageUrl`, `calories`, and dietary tags.
* **FR-MENU-05:** Administrators can update prices, descriptions, and dietary information for existing menu items.
* **FR-MENU-06:** Administrators can deactivate menu items (`isAvailable: false`) to safely remove them from the customer catalog without corrupting order history.
* **FR-MENU-07:** Input validation must reject negative prices, missing names, or malformed category payloads.

### 5.3 Cart & Order Processing (`FR-ORD`)
* **FR-ORD-01:** Customers can add items to an in-memory/persisted cart, adjust quantities (1–99), and remove items.
* **FR-ORD-02:** Order submission payloads must only contain `{ menuItemId, quantity }[]` and optional special dining notes.
* **FR-ORD-03:** The backend must re-query each `menuItemId` from MongoDB, verify `isAvailable: true`, and compute line item totals authoritatively.
* **FR-ORD-04:** The server must create immutable line item snapshots: `itemNameSnapshot`, `unitPriceSnapshot`, and `subtotal`.
* **FR-ORD-05:** Customers can review their past order history and view order tracking status (`placed`, `preparing`, `ready`, `completed`, `cancelled`).
* **FR-ORD-06:** Customers can cancel an order if and only if the current status is `placed`.
* **FR-ORD-07:** Administrators can view all orders across all customers with filter controls and update order statuses according to allowed state transitions:
  $$\text{placed} \longrightarrow \text{preparing} \longrightarrow \text{ready} \longrightarrow \text{completed}$$

### 5.4 Table Reservations (`FR-RES`)
* **FR-RES-01:** Authenticated customers can submit a reservation with `reservationDate`, `startTime`, `guestCount`, and optional dietary notes.
* **FR-RES-02:** The system must reject booking requests outside operating hours (08:00–22:00) or exceeding maximum party size.
* **FR-RES-03:** The backend must query existing reservations to identify active tables with sufficient capacity that have no overlapping interval.
* **FR-RES-04:** If no table is available for the requested slot, the server must return a `409 Conflict` error with a clear failure explanation.
* **FR-RES-05:** Customers can view their own upcoming and historical reservations.
* **FR-RES-06:** Customers can cancel their upcoming reservation up to 1 hour prior to `startTime`.
* **FR-RES-07:** Administrators can view all cafe reservations filtered by date, search customer names, and mark reservations as `confirmed`, `rejected`, or `completed`.

---

## 6. Non-Functional Requirements (NFR)

* **NFR-01 (Security):** Passwords hashed with bcrypt; Helmet enabled; CORS configured for frontend origin only; all query parameters sanitized against MongoDB operator injection.
* **NFR-02 (Performance):** Key query fields indexed in MongoDB (`User.email`, `MenuItem.category`, `Reservation.reservationDate`, `Reservation.tableId`).
* **NFR-03 (Data Integrity):** Foreign keys validated before reference creation (`userId`, `menuItemId`, `tableId`).
* **NFR-04 (Usability & Aesthetics):** Responsive design across mobile (375px+), tablet (768px+), and desktop (1024px+); visual theme uses botanical dark glassmorphism with high contrast readability.
* **NFR-05 (Error Standardization):** All API errors return uniform JSON structure with machine-readable error codes and human-readable feedback.
* **NFR-06 (Auditability):** Mongoose automatic timestamps (`createdAt`, `updatedAt`) enabled on all schemas.

---

## 7. Acceptance Criteria Mapping

| Requirement Group | Acceptance Criteria | Verified Test Case (TEST_PLAN.md) |
| :--- | :--- | :--- |
| **Authentication** | Valid registration succeeds; duplicate email rejected; role tampering blocked | `AUTH-01`, `AUTH-02`, `AUTH-07` |
| **Menu CRUD** | Admin creates/edits/deactivates items; client receives accurate catalog | `MENU-01`, `MENU-10`, `MENU-12` |
| **Orders** | Server overrides client totals; snapshot prices preserved; own orders visible | `ORD-05`, `ORD-07`, `ORD-11`, `ORD-12` |
| **Reservations** | Overlapping slots on same table rejected; 90-min duration enforced | `RES-01`, `RES-06`, `RES-08` |
| **Security** | Unauthenticated routes yield 401; Customer access to admin yields 403 | `SEC-01`, `SEC-02`, `SEC-03` |
