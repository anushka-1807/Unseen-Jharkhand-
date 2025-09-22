# Jharkhand Tribal Experience – Monorepo

Full‑stack app showcasing Jharkhand’s heritage with Trip Planning, Tour Buddy (AI itinerary), Bookings/Payments (mock), and a Guide Dashboard.

This repository contains two apps:
- `frontend/` React + Vite
- `backend/` Node.js + Express + SQLite (better‑sqlite3)

---

## Tech Stack
- Frontend: React 18, Vite, react-router-dom, Context API (Auth, I18n), CSS modules in `src/styles/theme.css`
- Backend: Express, better‑sqlite3 (file DB), cors, morgan, dotenv
- Database: SQLite file (migrated/seeded at boot)

Key endpoints used by the app:
- Bookings: `POST /api/bookings`, `GET /api/bookings?email=…&limit=…`
- Payments (mock): `POST /api/payments/create-order`, `POST /api/payments/verify`
- Guides (dashboard/mock): `GET /api/guide/me`, `/profile`, `/earnings`, `/feedbacks`, `/transactions`, `/bank`, `/availability-settings`
- Messages: `/api/messages/*` (thread, inbox, reply, mark-read)
- Hotels: `GET /api/hotels/list?city=…`
- AI (optional): `POST /api/ai/chat`

---

## Local Development

Prerequisites:
- Node.js 18+
- npm

Start backend:
```
cd backend
npm install
npm run dev
# http://localhost:5000
```

Start frontend:
```
cd frontend
npm install
npm run dev
# http://localhost:5173
```

Environment variables (backend `.env`):
```
PORT=5000
CORS_ORIGIN=http://localhost:5173
SQLITE_PATH= # optional, if empty defaults to ./data/app.db
```

Environment variables (frontend `.env`):
```
VITE_API_BASE=http://localhost:5000
```

Video assets:
- Place background videos under `frontend/public/videos/`.
- Update sources in `frontend/src/components/Hero.jsx` if needed.

---

## Deployment (Recommended)

Because SQLite requires a persistent filesystem, deploy:
- Backend on Render (Web Service + Persistent Disk)
- Frontend on Vercel

### 1) Backend → Render
1. Push this repo to GitHub.
2. Render Dashboard → New → Web Service → Connect Repo → root: `backend/`.
3. Settings:
   - Build Command: `npm install`
   - Start Command: `node src/index.js`
   - Node: 18+
4. Disks: Add a persistent disk (e.g., 1–5 GB) mounted at `/data`.
5. Environment Variables:
   - `PORT` (Render auto sets)
   - `SQLITE_PATH=/data/app.db`
   - `CORS_ORIGIN=https://<your-frontend>.vercel.app` (temporarily `*` for testing)
6. Deploy. Confirm health: `GET https://<your-backend>.onrender.com/api/health`.

### 2) Frontend → Vercel
1. Vercel Dashboard → New Project → Import GitHub → root: `frontend/`.
2. Framework preset: Vite
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Environment Variables:
   - `VITE_API_BASE=https://<your-backend>.onrender.com`
6. Deploy. Test production flows from your Vercel URL.

### 3) Post‑deploy
- Restrict CORS on backend to your Vercel domain only.
- Verify core flows:
  - Plan → Pay (mock) → Booking History
  - Booking History `GET /api/bookings?email=...`
  - Guide Dashboard mock data renders

---

## Configuration Reference

Frontend (.env):
- `VITE_API_BASE` – Base URL of backend (e.g. Render URL). Defaults to `http://localhost:5000` in development.

Backend (.env):
- `PORT` – Port for Express app (Render sets this automatically)
- `CORS_ORIGIN` – Allowed origin for CORS (set to your Vercel domain in production)
- `SQLITE_PATH` – Absolute path for SQLite DB file (use `/data/app.db` on Render persistent disk). Defaults to `./data/app.db`.

---

## Repository Structure
```
jharkhand-tribal-app/
  backend/
    src/
      routes/            # bookings, payments (mock), guide (mock), hotels, messages, ai
      index.js           # Express app, CORS, routers, health
      sqlite.js          # DB init, seeds, migrations; SQLITE_PATH support
    .env.example
  frontend/
    src/
      pages/             # Bookings, Payments, GuideDashboard, etc.
      components/        # Hero, ChatbotWidget, etc.
      context/           # AuthContext, I18nContext
      lib/apiBase.js     # Central API base
      styles/theme.css   # Global theme, animations, button styles
    public/
      videos/            # Background videos
```

---

## Tips & Notes
- Payments are fully mocked; backend `/api/payments/verify` also creates a booking to populate history.
- Guide Dashboard uses mock endpoints so it works even without seeded guides.
- Known warning: `frontend/src/context/I18nContext.jsx` contains a duplicate key `submit` (Hindi). Remove the duplicate to silence the Vite warning.

---

## Scripts
Frontend:
- `npm run dev` – Start Vite dev server
- `npm run build` – Build production bundle
- `npm run preview` – Preview production build

Backend:
- `npm run dev` – Start server with nodemon
- `npm start` – Start server (production)

