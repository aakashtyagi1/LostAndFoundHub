# 📍 Lost & Found Hub

> **Campus Belongings Recovery Portal**  
> A full-stack web application designed for campus students and faculty to report, search for, verify, and recover lost and found belongings.

---

## 🚀 Key Highlights & Stack

- **Frontend:** React.js 19, Vite, Modern CSS3 with Navy Blue & Dark Theme
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (via Mongoose ORM)
  - *Zero-Config Out-of-the-Box:* Automatically uses an embedded in-memory MongoDB fallback with pre-seeded campus sample items if local MongoDB/Atlas is not yet configured.
  - *Production Ready:* Connects seamlessly to MongoDB Atlas (`mongodb+srv://...`) or local MongoDB (`mongodb://127.0.0.1:27017/lostandfound`) via `.env`.
- **Authentication:** JWT (JSON Web Tokens) with `bcryptjs` password hashing
- **Deployment Platform:** **Vercel** (Full-Stack single deployment with React SPA + Serverless Express API routes)

---

## ✨ Features

1. **Modern Navy Blue & Black UI:** Responsive glassmorphic layout, glowing badges, clean cards, and typography.
2. **Directory Search & Smart Filtering:**
   - Real-time search across item name, description, and campus locations.
   - Filter pills: All Items, Lost Items, Found Items.
   - Category filtering: Electronics, Accessories, Documents, Books, Clothing, Keys, Others.
   - Location selector: Library, Cafeteria, Hostel, Parking, Classroom, Sports Complex, Auditorium.
3. **Automated Smart Matching:**
   - Detects potential matches between newly reported lost items and existing found listings.
   - Generates instant notifications for student owners.
4. **Verified Claims Workflow:**
   - Students can submit proof of ownership (unique marks, serial numbers, purchase details).
   - Item owners or administrators can review and **Approve** or **Reject** claims.
   - Automatically marks recovered items as **Returned / Claimed**.
5. **Student Dashboard:**
   - Track "My Reported Items" (with edit & delete options).
   - Track "My Submitted Claims" with live status badges (Pending, Approved, Rejected).
   - Review "Incoming Claims" from other students on your items.
6. **In-App Notification Center:**
   - Live badge counter for unread activity.
   - Alerts for claim submissions, approvals, rejections, and smart match detections.
7. **Administrator Control Panel:**
   - System Overview analytics: Total items, lost count, found count, recovery rate, users, and claims.
   - Manage all database items (edit/delete spam).
   - Review and moderate all campus claims.
   - Manage registered users.

---

## 🔑 Default Administrator Credentials

For college presentation and demonstration:
- **Email:** `admin@lostfound.com`
- **Password:** `admin123`
- **Role:** Administrator (full access to Admin Dashboard)

---

## 🌐 Deploying to Vercel (Step-by-Step)

The project includes a ready-to-use `vercel.json` and `api/index.js` serverless handler that deploys **both the React frontend and Express backend together in one single Vercel deployment**!

### Step 1: Push Changes to GitHub
Run the following commands in your terminal or PowerShell:

```bash
git add .
git commit -m "Deploy full-stack React, Express & MongoDB to Vercel"
git push origin main
```

### Step 2: Import Project in Vercel
1. Log in to [Vercel](https://vercel.com) with your GitHub account.
2. Click **"Add New..."** → **"Project"**.
3. Select your repository: `LostAndFoundHub`.
4. Leave the **Root Directory** as `./` (default).
5. Vercel will automatically read `vercel.json` (build command: `cd client && npm install && npm run build`, output: `client/dist`).

### Step 3: Add Environment Variables in Vercel
In the Vercel project deployment screen, open the **Environment Variables** section and add:

| Key | Example Value | Description |
| :--- | :--- | :--- |
| `MONGODB_URI` | `mongodb+srv://<user>:<password>@cluster0.xxxx.mongodb.net/lostandfound?retryWrites=true&w=majority` | Free MongoDB Atlas Cluster URL |
| `JWT_SECRET` | `your_secret_production_key_here` | Secret key for JWT auth |

> **Note on MongoDB Atlas:**  
> You can create a 100% free MongoDB cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas/database). In Network Access, allow access from anywhere (`0.0.0.0/0`) so Vercel's serverless functions can connect.

### Step 4: Click "Deploy"
Vercel will build the frontend, deploy the serverless Express API at `/api/*`, and give you a live production URL (e.g. `https://lost-and-found-hub.vercel.app`)!

---

## 💻 Running Locally on Windows (PowerShell) / Mac

### Step 1: Install Dependencies
Open your PowerShell or terminal in the project root:

```powershell
npm run install:all
```

### Step 2: Start Both Frontend & Backend
```powershell
npm run dev
```

This single command starts:
- 🚀 **Backend Server:** `http://localhost:5001`
- 💻 **Frontend Web App:** `http://localhost:5173`

*(Port 5001 is used to avoid macOS AirPlay Receiver port 5000 conflicts)*

---

## 🛠️ Project Structure

```text
lost-and-found-hub/
├── package.json                 # Monorepo runner & Vercel build script
├── vercel.json                  # Vercel deployment configuration
├── api/
│   └── index.js                 # Vercel serverless Express entrypoint
├── README.md                    # Project documentation
│
├── backend/                     # Node.js + Express API
│   ├── config/
│   │   ├── db.js                # MongoDB connection (Atlas / local / embedded memory fallback)
│   │   └── seed.js              # Campus sample items & admin seeder
│   ├── middleware/
│   │   └── auth.js              # JWT verification & role authorization
│   ├── models/
│   │   ├── User.js              # User schema & bcrypt hashing
│   │   ├── Item.js              # Item schema (Lost/Found)
│   │   ├── Claim.js             # Claim verification schema
│   │   └── Notification.js      # Notifications schema
│   ├── routes/
│   │   ├── auth.js              # /api/auth (register, login, me, reset)
│   │   ├── items.js             # /api/items (CRUD, filters, smart match)
│   │   ├── claims.js            # /api/claims (submit, review, approve)
│   │   ├── notifications.js     # /api/notifications
│   │   └── admin.js             # /api/admin (stats, user management)
│   ├── server.js                # Express app entrypoint (Port 5001)
│   ├── package.json
│   └── .env.example
│
└── client/                      # React + Vite Frontend
    ├── src/
    │   ├── services/
    │   │   └── api.js           # API client connecting to Express backend
    │   ├── App.jsx              # Main UI, modals & components
    │   ├── App.css              # Custom styling (Navy/Dark Theme)
    │   ├── index.css            # Global resets & typography
    │   └── main.jsx
    ├── vite.config.js           # Proxy configuration to port 5001
    ├── package.json
    └── .env.example
```

---

## 📡 API Reference Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Backend and MongoDB health check |
| `POST` | `/api/auth/register` | Register new user account |
| `POST` | `/api/auth/login` | Login user or admin, returns JWT token |
| `GET` | `/api/items` | Get items (supports `search`, `category`, `location`, `type`, `status`) |
| `POST` | `/api/items` | Create new lost/found report |
| `GET` | `/api/items/matches/:id` | Smart matching algorithm suggestions |
| `PUT` | `/api/items/:id` | Update item report |
| `DELETE` | `/api/items/:id` | Delete item report |
| `POST` | `/api/claims` | Submit claim for an item |
| `PUT` | `/api/claims/:id/status`| Approve or reject claim |
| `GET` | `/api/notifications` | Get user notifications |
| `GET` | `/api/admin/stats` | Analytics overview for administrator |
