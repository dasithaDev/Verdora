# Verdora — End-User & Administrator Guide (USER_GUIDE.md)

**Document Version:** 1.0  
**Phase:** Phase 10 — Documentation, Deployment and Submission  
**Course Module:** EE4207 Web Application Development Mini Project  
**Author / Contributor:** Dasitha Nayanapriya  
**System:** Verdora Healthy Cafe System (React, Node.js, Express, MongoDB)  

---

## 1. Introduction

Welcome to **Verdora**, an organic culinary ordering and table reservation web application. Verdora bridges the gap between health-conscious diners and cafe floor operations, providing an aesthetic, responsive interface paired with server-authoritative business rules.

This guide provides step-by-step instructions for two main user personas:
1. **Dining Customers:** Browsing the organic menu, placing orders, managing carts, tracking order history, and booking dining tables.
2. **Cafe Administrators:** Monitoring executive analytics, managing the live kitchen pipeline, seating dining parties, and updating the culinary catalog.

---

## 2. Customer Guide

### 2.1 Exploring the Menu Catalog
1. Navigate to the cafe homepage (`http://localhost:5173`).
2. Scroll to the **Nutritious Menu** section or click **Menu** in the navigation bar.
3. Use the category pills (**All**, **Bowls**, **Toast**, **Coffee**, **Juices**, **Snacks**, **Beverages**) to filter recipes by dietary category.
4. Use the search input to find dishes by name or organic ingredient (e.g., *"Acai"*, *"Matcha"*, *"Avocado"*).
5. Sort menu items by price (Low to High, High to Low) using the sorting dropdown.

### 2.2 Adding Dishes to Cart & Checkout
1. Click the **Add to Order** button on any active recipe card.
2. The interactive floating **Cart Drawer** will appear, displaying line items, quantities, and real-time subtotal calculations.
3. Adjust item quantities using the **+** and **−** buttons, or remove items using the trash icon.
4. When ready to dine, click **Proceed to Checkout**.
5. *Note:* If you are not signed in, a quick modal will prompt you to log in or register an account.
6. Confirm the order. The server authoritatively validates prices and returns a unique **Order ID** with initial status `placed`.

### 2.3 Viewing Order History & Cancellations
1. Click **Profile** in the navigation bar.
2. Under the **Order History** tab, view all your active and past orders, complete with item snapshots, dates, and order totals.
3. **Cancellation Rule:** If your order is in `placed` status (before kitchen preparation starts), click **Cancel Order** to cancel it. Once the kitchen marks it as `preparing`, cancellations are disabled.

### 2.4 Reserving a Dining Table
1. Scroll to the **Table Reservation** section on the homepage or click **Book Table**.
2. Select your desired dining date using the date picker (reservations accepted up to 14 days in advance).
3. Select your desired dining start time (operating hours: **08:00 to 22:00**; standard dining duration: **90 minutes**).
4. Specify your party size (guest count).
5. Optional: Enter special dietary or seating requests (e.g., *"Window table preferred, birthday celebration"*).
6. Click **Confirm Reservation**. The system's conflict engine automatically checks table availability, assigns an optimal table, and confirms the booking.
7. If an overlapping booking exists for all matching tables, a clear conflict alert is displayed with alternative time slot suggestions.

---

## 3. Administrator Operations Guide

The administrative console is protected by Role-Based Access Control (RBAC). Only authenticated users with the `admin` role can access operations.

### 3.1 Accessing the Operations Console
1. Log in with an authorized administrative account (e.g., `admin@verdora.local`).
2. In the navigation bar, click the **Dashboard** link or navigate to `http://localhost:5173/#admin`.

### 3.2 Executive Operations Dashboard (Overview Tab)
The **Overview** tab provides live KPI cards and analytical visualizations:
- **Total Revenue:** Aggregates gross sales from all fulfilled and active orders.
- **Kitchen Queue:** Displays the real-time ticket count currently awaiting or undergoing preparation.
- **Today's Bookings:** Displays confirmed table allocations for the current calendar day.
- **Active Menu Items:** Reports active inventory dishes currently published in the customer menu.
- **Weekly Revenue Trend:** Area chart mapping daily sales volume over the current week.
- **Fulfillment vs Return Rate:** Dual-bar chart showcasing order delivery success rate (97.2%).
- **Category Popularity Rank:** Horizontal bar chart illustrating volume across Bowls, Coffee, Juices, and Toast.
- **Quick Actions:** Instant action shortcuts to add recipes, jump to the kitchen queue, or allocate tables.

### 3.3 Kitchen Orders Pipeline (Kitchen Orders Tab)
Manage live customer orders through the kitchen preparation workflow:
1. Click the **Kitchen Orders** tab.
2. Filter tickets using status chips: **All Orders**, **Placed**, **Preparing**, **Ready**, **Completed**, or **Cancelled**.
3. Advance tickets through their operational lifecycle:
   - **Start Prep:** Transitions a newly placed order from `placed` ➔ `preparing`.
   - **Mark Ready:** Transitions an order from `preparing` ➔ `ready` for pickup/table service.
   - **Complete:** Finalizes the order from `ready` ➔ `completed`.
   - **Cancel:** Cancels an un-prepared ticket if required.

### 3.4 Table Bookings & Seating (Bookings Tab)
Oversee customer dining arrivals and table allocation:
1. Click the **Bookings** tab to view customer reservations.
2. Filter bookings by status: **All Bookings**, **Confirmed**, **Completed**, or **Cancelled**.
3. Each reservation card shows the customer name, contact email, reservation date, 90-minute time interval, party size, assigned table number, and guest notes.
4. When a dining party arrives at the cafe, click **Seat Party** to transition the reservation from `confirmed` ➔ `completed`.
5. If a guest cancels by phone, click **Cancel** to immediately free the table slot for other diners.

### 3.5 Menu Recipe Catalog Management (Menu Catalog Tab)
Maintain dishes, beverages, and ingredients in the live catalog:
1. Click the **Menu Catalog** tab.
2. Use the search bar to filter dishes by name or category.
3. **Add New Dish:**
   - Click the **+ Add Dish** button in the header.
   - Enter Dish Name, Category (Bowls, Toast, Coffee, Juices, Snacks, Beverages), Price in Rs., Description, and check "Available in live menu ordering".
   - Click **Create Dish**. The new recipe appears immediately in both admin and customer catalogs.
4. **Edit Dish:**
   - Click **Edit** next to any recipe.
   - Update pricing or preparation notes and click **Save Changes**.
5. **Soft Deactivation:**
   - Click **Deactivate** to safely remove an out-of-stock item from the public customer menu while preserving historical order references.

### 3.6 Cafe Floor Plan Overview (Cafe Tables Tab)
View the cafe's table layout and capacity:
1. Click the **Cafe Tables** tab.
2. Inspect operational tables, table numbers, and maximum guest capacities (e.g., Table 1: 2 guests, Table 3: 4 guests, Table 5: 6 guests).

---

## 4. Default Seed Credentials

For grading and demonstration testing, initialize the database using `npm run seed`:

| Role | Email Address | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@verdora.local` | `Admin123!` | Full access to Admin Operations Dashboard, Menu CRUD, Orders & Reservations |
| **Customer** | `customer@verdora.local` | `Customer123!` | Customer browsing, cart management, checkout, order history, table reservations |
