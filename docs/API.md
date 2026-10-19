# Verdora — REST API v1 Specification & Contract

**Document Version:** 1.0  
**Phase:** Phase 3 — API Foundation & Security Middleware  
**Base URL:** `http://localhost:5000/api/v1`  
**Content-Type:** `application/json`  
**Author / Contributor:** dasithaDev  

---

## 1. Global Conventions & Standards

### 1.1 Success Response Shape
Every successful endpoint returns an HTTP 2xx code with the following JSON structure:
```json
{
  "success": true,
  "data": {}
}
```

### 1.2 Standardized Error Response Shape
Operational and semantic errors return consistent JSON shapes:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable explanation of error.",
    "details": []
  }
}
```

### 1.3 Machine-Readable Error Codes

| Error Code | HTTP Status | Meaning |
| :--- | :---: | :--- |
| `VALIDATION_ERROR` | 400 | Malformed payload, invalid ObjectId, or negative price |
| `UNAUTHORIZED` | 401 | Missing authentication session/token |
| `TOKEN_INVALID` | 401 | Expired, tampered, or malformed JWT token |
| `FORBIDDEN` | 403 | Authenticated user lacks required role (e.g. customer calling admin route) |
| `NOT_FOUND` | 404 | Resource with specified identifier does not exist |
| `CONFLICT` | 409 | Duplicate email registration or reservation dining slot collision |
| `RATE_LIMIT_EXCEEDED` | 429 | Exceeded maximum requests allowed within window |
| `INTERNAL_SERVER_ERROR` | 500 | Unexpected server error (stack traces hidden in production) |

---

## 2. Authentication & Session Strategy

Verdora supports **Dual-Mode Authentication**:
1. **HTTP-Only Cookies (Browser default):** Issued upon login/registration as `jwt`. Protected with `HttpOnly; SameSite=Strict; Secure`.
2. **Bearer Token (API / Mobile clients):** `Authorization: Bearer <jwt_token>` header.

Tokens are signed using HMAC SHA-256 (`JWT_SECRET`) and default to a 7-day expiration window.

---

## 3. Endpoints Catalog

### 3.1 Health & Diagnostics

#### `GET /api/v1/health`
* **Access:** Public
* **Description:** Reports API uptime, environment, and MongoDB connection status.
* **Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "status": "UP",
    "uptime": 124.5,
    "timestamp": "2026-10-19T08:00:00.000Z",
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

### 3.2 Authentication Routes (`/api/v1/auth`)

> **Status:** Planned — implemented in **Phase 4**. Routes are not yet wired in `server/src/routes/api.js`.

#### `POST /api/v1/auth/register`
* **Access:** Public (Rate-limited to 20 req / 15 min)
* **Body:**
```json
{
  "name": "Saman Kumara",
  "email": "saman@example.com",
  "password": "StrongPassword123!"
}
```
* **Response `201 Created`:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "67b43a9f1a2b3c4d5e6f7001",
      "name": "Saman Kumara",
      "email": "saman@example.com",
      "role": "customer"
    }
  }
}
```
* **Security Rule:** Any request attempting to pass `"role": "admin"` is strictly stripped or rejected.

#### `POST /api/v1/auth/login`
* **Access:** Public (Rate-limited to 20 req / 15 min)
* **Body:**
```json
{
  "email": "customer@verdora.local",
  "password": "CustomerPass123!"
}
```
* **Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "67b43a9f1a2b3c4d5e6f7002",
      "name": "Nuwan Perera",
      "email": "customer@verdora.local",
      "role": "customer"
    }
  }
}
```

#### `POST /api/v1/auth/logout`
* **Access:** Authenticated
* **Description:** Clears the `jwt` HTTP-only cookie.
* **Response `200 OK`:** `{ "success": true, "data": { "message": "Logged out successfully" } }`

#### `GET /api/v1/auth/me`
* **Access:** Authenticated (`Customer` or `Admin`)
* **Description:** Returns profile details for current session.

---

### 3.3 Menu Routes (`/api/v1/menu`)

> **Status:** Planned — implemented in **Phase 5**. Routes are not yet wired in `server/src/routes/api.js`.

#### `GET /api/v1/menu`
* **Access:** Public
* **Query Parameters:**
  * `category` (Optional): Filter by `Bowls`, `Juices`, `Toast`, `Snacks`, `Beverages`
  * `search` (Optional): Partial name match
  * `sortBy` (Optional): `price`, `createdAt`
  * `order` (Optional): `asc`, `desc`
  * `page` (Optional): Default `1`
  * `limit` (Optional): Default `12`, max `50`
* **Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "limit": 12,
      "total": 8,
      "pages": 1
    }
  }
}
```

#### `POST /api/v1/menu`
* **Access:** Admin only (`role: admin`)
* **Body:**
```json
{
  "name": "Spirulina Green Bowl",
  "description": "Blue-green algae with blended mango and hemp seed topping",
  "category": "Bowls",
  "price": 1750,
  "calories": 310,
  "allergens": []
}
```
* **Response `201 Created`**

#### `PATCH /api/v1/menu/:id`
* **Access:** Admin only
* **Description:** Updates pricing, description, or availability.

#### `DELETE /api/v1/menu/:id`
* **Access:** Admin only
* **Description:** Soft-deactivates item (`isAvailable: false`) to preserve past order audit records.

---

### 3.4 Order Routes (`/api/v1/orders`)

> **Status:** Planned — implemented in **Phase 6**. Routes are not yet wired in `server/src/routes/api.js`.

#### `POST /api/v1/orders`
* **Access:** Customer
* **Body:**
```json
{
  "items": [
    { "menuItemId": "67b43a9f1a2b3c4d5e6f7001", "quantity": 2 }
  ],
  "notes": "Please pack with wooden cutlery"
}
```
* **Response `201 Created`:**
```json
{
  "success": true,
  "data": {
    "order": {
      "_id": "67b43baf1a2b3c4d5e6f8002",
      "subtotal": 3700,
      "status": "placed",
      "items": [
        {
          "menuItemId": "67b43a9f1a2b3c4d5e6f7001",
          "itemNameSnapshot": "Amazonian Açai Super-Bowl",
          "unitPriceSnapshot": 1850,
          "quantity": 2
        }
      ]
    }
  }
}
```
* **Server Rule:** Totals and prices supplied by the browser are completely ignored and recomputed from database prices.

#### `GET /api/v1/orders/my`
* **Access:** Customer (Returns only orders matching `req.user._id`)

#### `PATCH /api/v1/orders/:id/cancel`
* **Access:** Customer (Permitted only if `order.status === 'placed'`)

#### `GET /api/v1/admin/orders`
* **Access:** Admin only (Lists all orders with status and date filters)

#### `PATCH /api/v1/admin/orders/:id/status`
* **Access:** Admin only
* **Body:** `{ "status": "preparing" }`

---

### 3.5 Reservation Routes (`/api/v1/reservations`)

> **Status:** Planned — implemented in **Phase 7**. Routes are not yet wired in `server/src/routes/api.js`.

#### `POST /api/v1/reservations`
* **Access:** Customer
* **Body:**
```json
{
  "reservationDate": "2026-10-25",
  "startTime": "12:00",
  "guestCount": 4,
  "specialRequest": "Window booth preferred"
}
```
* **Response `201 Created`:**
```json
{
  "success": true,
  "data": {
    "reservation": {
      "_id": "67b43caf1a2b3c4d5e6f9003",
      "tableId": "67b439cf1a2b3c4d5e6f5001",
      "reservationDate": "2026-10-25T00:00:00.000Z",
      "startTime": "12:00",
      "endTime": "13:30",
      "guestCount": 4,
      "status": "confirmed"
    }
  }
}
```
* **Error `409 Conflict`:** Returned if all matching capacity tables have overlapping bookings for that slot.

#### `GET /api/v1/reservations/my`
* **Access:** Customer (Returns own upcoming and historical reservations)

#### `PATCH /api/v1/reservations/:id/cancel`
* **Access:** Customer (Allowed up to 1 hour before `startTime`)

#### `GET /api/v1/admin/reservations`
* **Access:** Admin only (Lists daily schedule with table numbers and guest counts)
