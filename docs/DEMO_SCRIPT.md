# Verdora — Video Demonstration Script (DEMO_SCRIPT.md)

**Document Version:** 1.0  
**Phase:** Phase 10 — Documentation, Deployment and Submission  
**Course Module:** EE4207 Web Application Development Mini Project  
**Author / Contributor:** Dasitha Nayanapriya  
**Target Video Duration:** 5 Minutes (300 Seconds)  
**Target Audience:** Course Evaluators & Academic Reviewers  

---

## 1. Video Structure & Timing Overview

| Time Interval | Duration | Scene / Demonstration Topic | Key Requirement Demonstrated |
| :--- | :--- | :--- | :--- |
| **0:00 – 0:45** | 45 sec | Project Intro, Architectural Overview & Theme | Full-stack setup, responsive UI, seed script |
| **0:45 – 1:50** | 65 sec | Customer Flow: Menu Search, Cart & Ordering | Search/filter/sort, cart state, server price authority |
| **1:50 – 2:50** | 60 sec | Table Booking & Conflict Engine Demonstration | Date/time booking, table allocation, conflict guard |
| **2:50 – 4:00** | 70 sec | Admin Console: Analytics, Kitchen & Menu CRUD | Admin RBAC, Recharts KPI, status pipeline, CRUD |
| **4:00 – 4:45** | 45 sec | Security Hardening & Automated Test Suite | IDOR defense, Helmet, 165 automated tests |
| **4:45 – 5:00** | 15 sec | Conclusion & Wrap-up | Deliverables summary |

---

## 2. Step-by-Step Narration & Action Cue Sheet

### Scene 1: Introduction & Architecture (0:00 – 0:45)
- **On Screen:** Start on the Verdora homepage (`http://localhost:5173`). Highlight the Obsidian Emerald and Ceylon Gold luxury botanical aesthetic, smooth animations, and responsive navigation bar.
- **Spoken Narration:**  
  > *"Hello, everyone. Welcome to Verdora, an organic healthy cafe ordering and reservation system developed for the EE4207 Web Application Development project. Verdora is built with a decoupled MERN stack: a React 18 and Vite client featuring a custom glassmorphism design system, powered by an Express.js REST API with MongoDB and Mongoose. Everything you see is backed by real persisted database records, strict role-based access control, and server-authoritative business logic."*

---

### Scene 2: Customer Flow — Menu Search, Cart & Checkout (0:45 – 1:50)
- **On Screen:** 
  1. Scroll down to the menu catalog.
  2. Click the **Bowls** category filter, then type *"Acai"* into the search bar.
  3. Change the sort order to **Price: High to Low**.
  4. Click **Add to Order** on the Amazonian Acai Bowl.
  5. The interactive Cart Drawer opens. Increase the quantity to 2.
  6. Click **Proceed to Checkout**. Log in as `customer@verdora.local` (password: `Customer123!`).
  7. Confirm the order. Navigate to **Profile ➔ Order History** and demonstrate the newly created order in `placed` status.
- **Spoken Narration:**  
  > *"First, let's explore the customer dining experience. Diners can filter dishes across seven dietary categories, search by organic ingredients in real time, and sort by price. When we add items to our order, the cart calculates quantities and subtotal previews on the client.  
  > Crucially, when we submit our order, the client sends only the menu item IDs and quantities. The backend server authoritatively looks up prices from MongoDB and computes the total, preventing client-side price tampering. We can view our immutable order snapshot in the customer profile under 'placed' status."*

---

### Scene 3: Dining Table Reservations & Conflict Engine (1:50 – 2:50)
- **On Screen:**
  1. Navigate to the **Book Table** section.
  2. Select tomorrow's date, start time **12:00**, party size **4 guests**, and enter note: *"Window table"*.
  3. Click **Confirm Reservation**. Show the instant confirmation with Table number allocated.
  4. Open an incognito browser window or separate session, and attempt to book the exact same table and time interval.
  5. Show the red alert modal: `409 RESERVATION_CONFLICT`.
- **Spoken Narration:**  
  > *"Now, let's look at table bookings. Verdora enforces a 90-minute dining duration between 08:00 and 22:00 daily. When we request a 4-person table tomorrow at 12:00, the system checks real-time availability and confirms Table 3.  
  > To prove our conflict-prevention engine: if another diner attempts to book that same table during the overlapping interval, the server immediately rejects the request with HTTP 409 Conflict, completely eliminating double bookings."*

---

### Scene 4: Administrator Operations & Culinary Management (2:50 – 4:00)
- **On Screen:**
  1. Log in with admin credentials (`admin@verdora.local` / `Admin123!`).
  2. Click **Dashboard** in the navbar to open `AdminDashboard.jsx`.
  3. Showcase the 4 KPI cards (Total Revenue, Kitchen Queue, Today's Bookings, Active Dishes) and Recharts weekly analytics.
  4. Switch to the **Kitchen Orders** tab. Locate the customer order placed in Scene 2.
  5. Click **Start Prep** (`placed` ➔ `preparing`).
  6. Click **Mark Ready** ➔ **Complete**. Show the live status pills update.
  7. Switch to the **Bookings** tab and click **Seat Party** on the confirmed booking.
  8. Switch to the **Menu Catalog** tab. Click **+ Add Dish**, create a new organic beverage, verify it appears, and demonstrate soft-deactivation.
- **Spoken Narration:**  
  > *"Next, we enter the executive operations console, accessible only to administrators. The Overview dashboard displays live KPI metrics and Recharts visualizations tracking weekly gross sales and category volume.  
  > In the Kitchen Orders tab, cafe staff manage incoming tickets through a real-time pipeline: transitioning orders from placed, to preparing, to ready and completed. In the Bookings tab, staff seat dining parties upon arrival. And in the Menu Catalog, administrators can add new seasonal recipes, edit prices, or deactivate out-of-stock items without breaking past order histories."*

---

### Scene 5: Security Hardening & Automated Test Suite (4:00 – 4:45)
- **On Screen:**
  1. Open the terminal.
  2. Run `npm test`.
  3. Show the test runner executing all 8 suites (165 tests) with all green `PASS` checkmarks.
  4. Briefly show `docs/TEST_REPORT.md` and `docs/SECURITY.md`.
- **Spoken Narration:**  
  > *"Security and quality assurance are central to Verdora. We have implemented robust Insecure Direct Object Reference (IDOR) protection—ensuring customers cannot view or modify each other's orders or bookings. Public registration cannot escalate roles to admin, passwords are encrypted with bcrypt, and Helmet headers protect against clickjacking and MIME-sniffing.  
  > As you can see in the terminal, our automated test suite runs 165 end-to-end integration, middleware, and security tests with a 100% pass rate."*

---

### Scene 6: Conclusion (4:45 – 5:00)
- **On Screen:** Return to the Verdora homepage header showing the official logo and live operational badge.
- **Spoken Narration:**  
  > *"In conclusion, Verdora delivers a complete, secure, and production-grade cafe system meeting all academic rubric criteria. Full documentation, API references, and test reports are available in the repository. Thank you for watching."*
