# Verdora — Production Deployment Guide (DEPLOYMENT.md)

**Document Version:** 1.0  
**Phase:** Phase 10 — Documentation, Deployment and Submission  
**Course Module:** EE4207 Web Application Development Mini Project  
**Author / Contributor:** Dasitha Nayanapriya  
**System:** Verdora Healthy Cafe System (React, Node.js, Express, MongoDB)  

---

## 1. Overview & Architecture Topology

Verdora uses a decoupled full-stack architecture that can be deployed to modern cloud hosting platforms:

```
┌─────────────────────────────────┐        HTTPS Requests        ┌───────────────────────────────────┐
│        Frontend Client          │  ─────────────────────────>  │          Backend API Server       │
│        (Vercel / Netlify)       │                              │        (Render / Railway)         │
│  React 18 + Vite Production SPA │  <─────────────────────────  │        Express.js + Node.js       │
└─────────────────────────────────┘        JSON Responses        └───────────────────────────────────┘
                                                                                   │
                                                                                   │ Mongoose TLS
                                                                                   ▼
                                                                 ┌───────────────────────────────────┐
                                                                 │        Database Cluster           │
                                                                 │        (MongoDB Atlas)            │
                                                                 │  Replica Set with Indexes & Auth  │
                                                                 └───────────────────────────────────┘
```

---

## 2. Step 1: Database Setup (MongoDB Atlas)

1. Create a free account at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Create a new project named `verdora-cafe` and deploy a free **M0 Sandbox** cluster.
3. **Database Access (User Creation):**
   - In **Security ➔ Database Access**, click **Add New Database User**.
   - Select **Password Authentication**.
   - Username: `verdora_admin`
   - Generate a strong, secure password (record this securely).
   - Privileges: `Read and write to any database`.
4. **Network Access (IP Whitelist):**
   - In **Security ➔ Network Access**, click **Add IP Address**.
   - Select **Allow Access from Anywhere** (`0.0.0.0/0`) to allow dynamic cloud hosting platforms (Render/Railway) to connect.
5. **Obtain Connection String:**
   - In **Deployment ➔ Database**, click **Connect ➔ Drivers (Node.js)**.
   - Copy the SRV URI:
     ```
     mongodb+srv://verdora_admin:<PASSWORD>@cluster0.xxxxx.mongodb.net/verdora?retryWrites=true&w=majority&appName=VerdoraCafe
     ```

---

## 3. Step 2: Backend API Deployment (Render / Railway)

### Recommended Platform: [Render.com](https://render.com) (Web Service)
1. Fork or push the Verdora repository to GitHub.
2. Log into Render and click **New ➔ Web Service**.
3. Connect your GitHub repository.
4. Configure service settings:
   - **Name:** `verdora-api`
   - **Root Directory:** `server`
   - **Environment:** `Node`
   - **Region:** Closest region to your users (e.g., Singapore / Frankfurt)
   - **Branch:** `main`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. **Environment Variables:**
   Under the **Environment** tab, add the following production variables:

   | Variable Key | Production Value Example | Purpose |
   | :--- | :--- | :--- |
   | `NODE_ENV` | `production` | Enables optimized Express & security modes |
   | `PORT` | `5000` | Port assigned by host (Render defaults to 10000 internally) |
   | `MONGO_URI` | `mongodb+srv://verdora_admin:***@cluster0.mongodb.net/verdora?retryWrites=true&w=majority` | Atlas production database |
   | `JWT_SECRET` | `4b8c9d2e1f7a0e5c8b3a7d9f2e4c1b0a8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b` | Strong 256-bit cryptographic key |
   | `JWT_EXPIRES_IN` | `7d` | Token lifespan |
   | `CORS_ORIGIN` | `https://verdora.vercel.app` | URL of your deployed frontend client |

6. Click **Create Web Service**. Wait for the deployment log to display `MongoDB connected successfully`.
7. **Seed Production Data:**
   In Render's **Shell** tab, run:
   ```bash
   node src/seeds/seed.js
   ```
   This creates initial admin credentials (`admin@verdora.local` / `Admin123!`), 9 artisan dishes, and 8 cafe tables.

---

## 4. Step 3: Frontend Client Deployment (Vercel)

### Recommended Platform: [Vercel.com](https://vercel.com)
1. Log into Vercel and click **Add New ➔ Project**.
2. Select your Verdora GitHub repository.
3. Configure project settings:
   - **Framework Preset:** `Vite`
   - **Root Directory:** Edit and select `client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
4. **Environment Variables:**
   Add the API endpoint pointing to your deployed Render backend:

   | Variable Key | Production Value |
   | :--- | :--- |
   | `VITE_API_URL` | `https://verdora-api.onrender.com/api/v1` |

5. Click **Deploy**. Vercel will build and serve the optimized client bundle on an SSL-secured custom URL (`https://verdora.vercel.app`).

---

## 5. Step 4: Post-Deployment Smoke Test Checklist

Once both client and server are deployed, perform the following verification:

- [ ] **Health Endpoint:** Visit `https://verdora-api.onrender.com/api/v1/health` ➔ returns `{ "status": "ok", "service": "verdora-server" }`.
- [ ] **CORS Verification:** Open developer console on frontend domain; ensure requests to API succeed without CORS origin rejections.
- [ ] **Customer Order Flow:** Register a test customer account, add items to cart, and place an order.
- [ ] **Admin Operations:** Log into `https://verdora.vercel.app/#admin` with `admin@verdora.local`; verify KPI metrics, kitchen tickets, and menu items appear.
- [ ] **SSL / Security Headers:** Check network response headers in browser; verify `X-Content-Type-Options: nosniff` and `Strict-Transport-Security` headers are present.
