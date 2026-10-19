# Verdora — System Architecture & Design Specification

**Document Version:** 1.0  
**Phase:** Phase 1 — Requirements, UX and Architecture  
**Technology Stack:** React 19 (Vite), Node.js / Express.js, MongoDB / Mongoose  
**Author / Contributor:** Dasitha Nayanapriya 

---

## 1. High-Level Architecture Overview

Verdora follows a clean, decoupled **Client-Server 3-Tier Architecture**:

```mermaid
graph TB
    subgraph Presentation_Layer ["Presentation Layer (React 19 + Vite)"]
        UI_Guest["Public Catalog & Landing Pages"]
        UI_Customer["Customer Portal (Cart, Orders, Reservations)"]
        UI_Admin["Admin Management Dashboard"]
        State_API["Axios API Client & Auth Provider"]
    end

    subgraph Application_Layer ["Application & Business Logic Layer (Node.js + Express)"]
        Router["Express API Router (/api/v1)"]
        Middleware["Security & Auth Middleware (CORS, Helmet, RateLimiter, JWT Verify)"]
        Controllers["Domain Controllers (Auth, Menu, Orders, Reservations)"]
        Services["Business Rule Services (Price Calculation, Concurrency Conflict Guard)"]
    end

    subgraph Data_Layer ["Data Persistence Layer (MongoDB + Mongoose)"]
        DB_Users[("Users Collection")]
        DB_Menu[("MenuItems Collection")]
        DB_Orders[("Orders Collection - Line Snapshots")]
        DB_Tables[("CafeTables Collection")]
        DB_Res[("Reservations Collection")]
    end

    UI_Guest --> State_API
    UI_Customer --> State_API
    UI_Admin --> State_API

    State_API -- "JSON over HTTPS (with httpOnly Cookies)" --> Router
    Router --> Middleware
    Middleware --> Controllers
    Controllers --> Services
    Services --> DB_Users
    Services --> DB_Menu
    Services --> DB_Orders
    Services --> DB_Tables
    Services --> DB_Res
```

---

## 2. Sequence Diagrams & Data Flows

### 2.1 Order Placement & Server-Authoritative Calculation Flow

The client calculates subtotals strictly for presentation. The server independently recalculates all line items against authoritative database records and generates immutable price snapshots.

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Diner (Browser)
    participant Client as React Cart Feature
    participant API as Express Order Controller
    participant DB as MongoDB (MenuItems & Orders)

    Customer->>Client: Click "Place Order"
    Client->>Client: Extract { menuItemId, quantity }[]
    Client->>API: POST /api/v1/orders { items: [{ menuItemId, quantity }] }
    Note over API: Re-fetch current menu items from database
    API->>DB: MenuItem.find({ _id: { $in: itemIds }, isAvailable: true })
    DB-->>API: Returns authoritative items & current prices
    
    alt Any item unavailable or quantity < 1
        API-->>Client: 400 Bad Request (Item unavailable or invalid)
        Client-->>Customer: Display friendly error banner
    else All items verified
        Note over API: Compute subtotal: sum(item.price * qty)<br/>Create line item snapshots
        API->>DB: Order.create({ userId, items: [snapshots], subtotal, status: 'placed' })
        DB-->>API: Persisted Order Document with ID
        API-->>Client: 201 Created { success: true, data: { order } }
        Client->>Client: Clear local cart
        Client-->>Customer: Redirect to Order Confirmation & Tracking
    end
```

---

### 2.2 Table Reservation & Conflict Prevention Flow

To prevent double-booking, the reservation service checks for overlapping time intervals ($[Start, End)$) on active tables before saving.

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Diner (Browser)
    participant API as Express Reservation Service
    participant DB as MongoDB (CafeTables & Reservations)

    Customer->>API: POST /api/v1/reservations { date, startTime, guestCount }
    Note over API: Validate operating hours (08:00 - 22:00)<br/>Calculate endTime = startTime + 90 mins
    
    API->>DB: Query active CafeTables with capacity >= guestCount
    DB-->>API: List of candidate tables

    API->>DB: Query existing reservations on candidate tables where:<br/>(status in ['pending', 'confirmed']) AND<br/>(startTime < requestedEnd AND endTime > requestedStart)
    DB-->>API: Active overlapping reservations
    
    alt No free table found
        API-->>Customer: 409 Conflict ("All tables fully booked for this time window")
    else Free table available
        Note over API: Assign first matching tableId
        API->>DB: Reservation.create({ userId, tableId, date, startTime, endTime, guestCount, status: 'confirmed' })
        DB-->>API: Persisted Reservation Document
        API-->>Customer: 201 Created { success: true, data: { reservation } }
    end
```

---

## 3. Lifecycle State Transition Diagrams

### 3.1 Order Lifecycle

```mermaid
stateDiagram-v2
    [*] --> placed: Customer submits order
    placed --> preparing: Admin starts kitchen prep
    placed --> cancelled: Customer cancels (within placed window)
    preparing --> ready: Food plated & ready for pickup/service
    ready --> completed: Order served / picked up
    completed --> [*]
    cancelled --> [*]
```

### 3.2 Reservation Lifecycle

```mermaid
stateDiagram-v2
    [*] --> confirmed: Automatically matched with free table
    confirmed --> cancelled: Customer cancels (> 1 hour notice)
    confirmed --> completed: Diner arrived & dined
    confirmed --> rejected: Admin marks unavailable / no-show
    completed --> [*]
    cancelled --> [*]
    rejected --> [*]
```

---

## 4. Route Inventory & Navigation Map

```text
/ (Public Landing Page)
├── /menu                         # Public Menu catalog (Search, Filters, Sort)
├── /menu/:id                     # Single item nutritional breakdown
├── /login                        # Authentication
├── /register                     # New customer registration
│
├── /cart                         # Customer Cart Review
├── /checkout                     # Order confirmation & notes
├── /orders/my                    # Customer Order History & status tracking
├── /orders/:id                   # Order detail receipt
├── /reservations                 # Table booking form
├── /reservations/my              # Customer upcoming reservations & cancel action
│
└── /admin                        # Protected Admin Operations
    ├── /admin/dashboard          # Key metrics (Active orders, Today's covers)
    ├── /admin/menu               # Menu CRUD management table
    ├── /admin/orders             # Kitchen display system & status controls
    └── /admin/reservations       # Daily reservation roster & table assignments
```

---

## 5. Standardized API Response & Error Contracts

All responses follow a consistent schema:

### Success Contract (`200 OK`, `201 Created`):
```json
{
  "success": true,
  "data": {
    "item": {}
  }
}
```

### Standardized Error Contract (`400`, `401`, `403`, `404`, `409`, `500`):
```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "The selected dining slot is no longer available. Please select another time.",
    "details": []
  }
}
```

### Standard Error Codes:
* `VALIDATION_ERROR` (400) — Malformed input, invalid emails, negative prices.
* `UNAUTHORIZED` (401) — Missing, expired, or malformed JWT token.
* `FORBIDDEN` (403) — Customer attempting to perform administrative mutations or access another user's records.
* `NOT_FOUND` (404) — Requested resource does not exist.
* `CONFLICT` (409) — Duplicate email registration or reservation table collision.
* `INTERNAL_SERVER_ERROR` (500) — Unhandled backend exception (sanitized to prevent secret leaks).

---

## 6. UI/UX Design System & State Guidelines

### 6.1 Color Tokens & Theming
* **Primary (Botanical Wellness):** `#22c55e` (Emerald Green), `#16a34a` (Deep Leaf).
* **Warm Accent (Grains & Sun):** `#eab308` (Golden Harvest), `#e06d53` (Warm Terracotta).
* **Background Surfaces:** `#0b130e` (Deep Obsidian Green), `#121f17` (Surface Layer), `#16261d` (Glass Cards).
* **Typography:** `Outfit` (Headings, Branding), `Plus Jakarta Sans` (Body, Controls, Tables).

### 6.2 The Five Core UI States
1. **Loading State:** Semi-transparent skeleton loaders and glowing spinner badges (preventing double clicks with `disabled` states).
2. **Empty State:** Illustrated empty banners with clear calls-to-action (e.g., "Your cart is empty — Explore fresh bowls").
3. **Validation State:** Inline form feedback with red indicator rings and accessible descriptive text below input controls.
4. **Success State:** Non-intrusive floating toasts and animated confirmation checkmarks.
5. **Confirmation Modals:** Double-confirmation dialogue for destructive actions (e.g., deactivating a menu item or cancelling a table reservation).
