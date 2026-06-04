# 📚 UniBooks Exchange — Full Stack Application

> **BUS4012 – Vibe Coding for Startups | Assignment 03**
> A student-focused marketplace for buying and selling second-hand academic textbooks within university communities.

---

## 🏗️ Architecture Overview

```
UniBooks Exchange
├── frontend/          React + Vite (deployed on Vercel)
├── backend/           FastAPI + Python (deployed on Render)
└── database/          Supabase (PostgreSQL + Storage)
```

### How the layers communicate

```
Browser (React)
    │  HTTP/JSON (Axios)
    ▼
FastAPI Backend (Render)
    │  supabase-py (REST)
    ▼
Supabase (PostgreSQL + Storage)
```

1. The **React frontend** makes authenticated HTTP requests to the **FastAPI backend** using Axios. Every request after login includes a JWT `Authorization: Bearer <token>` header.
2. The **FastAPI backend** validates the JWT, queries **Supabase** using the `supabase-py` client, and returns JSON responses.
3. **Supabase** stores all user data, book listings, messages, and favourites in PostgreSQL, and book cover images in a Storage bucket.

---

## 📁 Project Structure

```
UniBooks-App/
├── frontend/                    # React + Vite application
│   ├── index.html
│   ├── vite.config.js
│   ├── vercel.json              # Vercel deployment config
│   ├── .env.example
│   └── src/
│       ├── main.jsx             # React entry point
│       ├── App.jsx              # Router + auth guards
│       ├── context/
│       │   └── AuthContext.jsx  # Global auth state (JWT + user)
│       ├── services/            # Axios API call modules
│       │   ├── api.js           # Axios instance + interceptors
│       │   ├── authService.js
│       │   ├── booksService.js
│       │   ├── messagesService.js
│       │   ├── favouritesService.js
│       │   └── profileService.js
│       ├── utils/
│       │   └── helpers.js       # Shared utility functions
│       ├── components/
│       │   ├── layout/
│       │   │   ├── AppLayout.jsx   # Shell: sidebar + outlet
│       │   │   ├── Sidebar.jsx     # Desktop nav (≥768px)
│       │   │   └── BottomNav.jsx   # Mobile nav (≤768px)
│       │   └── ui/
│       │       └── BookCard.jsx    # Reusable book card
│       ├── pages/
│       │   ├── LoginPage.jsx
│       │   ├── RegisterPage.jsx
│       │   ├── BrowsePage.jsx
│       │   ├── BookDetailsPage.jsx
│       │   ├── ChatPage.jsx
│       │   ├── PostBookPage.jsx
│       │   ├── ConfirmationPage.jsx
│       │   ├── ProfilePage.jsx
│       │   ├── MyListingsPage.jsx
│       │   └── FavouritesPage.jsx
│       └── styles/
│           └── globals.css      # Design system (CSS variables)
│
├── backend/                     # FastAPI application
│   ├── requirements.txt
│   ├── render.yaml              # Render deployment config
│   ├── .env.example
│   └── app/
│       ├── main.py              # FastAPI app + CORS + routers
│       ├── config.py            # Environment variable settings
│       ├── database.py          # Supabase client singleton
│       ├── auth/
│       │   ├── router.py        # POST /auth/register, /login, /me
│       │   ├── schemas.py       # Pydantic models
│       │   └── utils.py         # bcrypt + JWT helpers
│       ├── books/
│       │   ├── router.py        # CRUD + search + image upload
│       │   └── schemas.py
│       ├── messages/
│       │   ├── router.py        # Conversations + send message
│       │   └── schemas.py
│       ├── favourites/
│       │   ├── router.py        # Add/remove/check favourites
│       │   └── schemas.py
│       ├── profile/
│       │   ├── router.py        # Get/update profile + password
│       │   └── schemas.py
│       └── middleware/
│           └── auth_middleware.py  # JWT dependency injection
│
└── database/
    ├── schema.sql               # CREATE TABLE statements
    └── rls_policies.sql         # Row Level Security policies
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+
- A Supabase account (free tier works)

---

### Step 1 — Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. In the **SQL Editor**, run `database/schema.sql` to create all tables.
3. Then run `database/rls_policies.sql` to apply Row Level Security.
4. Go to **Storage** → Create a new bucket called `book-images` → Set it to **Public**.
5. Copy your **Project URL** and **anon/public API key** from **Settings → API**.

---

### Step 2 — Backend Setup

```bash
cd UniBooks-App/backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Create environment file
copy .env.example .env         # Windows
# cp .env.example .env         # macOS/Linux
```

Edit `backend/.env` and fill in your values:
```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-anon-public-key
JWT_SECRET=your-super-secret-key-change-this-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=10080
FRONTEND_URL=http://localhost:5173
DEBUG=true
```

Start the backend:
```bash
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`
Interactive docs: `http://localhost:8000/docs`

---

### Step 3 — Frontend Setup

```bash
cd UniBooks-App/frontend

# Install dependencies
npm install

# Create environment file
copy .env.example .env         # Windows
# cp .env.example .env         # macOS/Linux
```

Edit `frontend/.env`:
```env
VITE_API_URL=http://localhost:8000
```

Start the frontend:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

---

## 🌐 Deployment

### Deploy Backend to Render

1. Push your code to GitHub.
2. Go to [render.com](https://render.com) → **New Web Service**.
3. Connect your GitHub repository.
4. Set the **Root Directory** to `backend`.
5. Set **Build Command**: `pip install -r requirements.txt`
6. Set **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
7. Add the following **Environment Variables** in the Render dashboard:
   - `SUPABASE_URL` — your Supabase project URL
   - `SUPABASE_KEY` — your Supabase anon key
   - `JWT_SECRET` — a long random secret string
   - `JWT_ALGORITHM` — `HS256`
   - `JWT_EXPIRE_MINUTES` — `10080`
   - `FRONTEND_URL` — your Vercel frontend URL (add after deploying frontend)
   - `DEBUG` — `false`

### Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project**.
2. Import your GitHub repository.
3. Set the **Root Directory** to `frontend`.
4. Add **Environment Variable**:
   - `VITE_API_URL` — your Render backend URL (e.g. `https://unibooks-backend.onrender.com`)
5. Click **Deploy**.

> **Important:** After deploying both services, update `FRONTEND_URL` in Render with your Vercel URL to allow CORS.

---

## 🔑 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | ❌ | Register new user |
| POST | `/auth/login` | ❌ | Login, returns JWT |
| GET | `/auth/me` | ✅ | Get current user |
| GET | `/books` | ✅ | Browse books (search/filter/sort) |
| POST | `/books` | ✅ | Create book listing |
| GET | `/books/{id}` | ✅ | Get book details |
| PUT | `/books/{id}` | ✅ | Update listing (owner only) |
| DELETE | `/books/{id}` | ✅ | Delete listing (owner only) |
| GET | `/books/my-listings` | ✅ | Get current user's listings |
| POST | `/books/upload-image` | ✅ | Upload book cover image |
| GET | `/messages/conversations` | ✅ | Get all conversations |
| GET | `/messages/{book_id}/{user_id}` | ✅ | Get conversation messages |
| POST | `/messages` | ✅ | Send a message |
| GET | `/favourites` | ✅ | Get user's favourites |
| POST | `/favourites` | ✅ | Add to favourites |
| DELETE | `/favourites/{book_id}` | ✅ | Remove from favourites |
| GET | `/favourites/check/{book_id}` | ✅ | Check if book is favourited |
| GET | `/profile` | ✅ | Get profile with stats |
| PUT | `/profile` | ✅ | Update profile |
| PUT | `/profile/password` | ✅ | Change password |

---

## 🔒 Security Features

- **Passwords** are hashed using `bcrypt` before storage — never stored in plain text.
- **JWT tokens** are used for session management with configurable expiry.
- **Protected routes** on both frontend (React Router guards) and backend (FastAPI dependency injection).
- **CORS** is configured to only allow requests from the specified frontend URL.
- **Row Level Security (RLS)** in Supabase ensures users can only access their own data.
- **Input validation** on both frontend (form validation) and backend (Pydantic schemas).
- **Environment variables** are used for all sensitive configuration — never hardcoded.
- **University email validation** — only `.edu`, `.edu.au`, `.ac.uk`, etc. are accepted.

---

## 🎨 Design System

| Token | Value | Usage |
|-------|-------|-------|
| `--color-primary` | `#1a2b4a` | Navy — sidebar, buttons, headings |
| `--color-accent` | `#f5a623` | Amber — active states, prices, CTAs |
| `--color-bg` | `#f4f6fb` | Light blue-grey — page background |
| `--color-surface` | `#ffffff` | White — cards, modals |
| Font | Inter | All text |

**Responsive breakpoints:**
- `≥ 768px` — Desktop: sidebar navigation
- `< 768px` — Mobile: bottom navigation bar

---

## 📋 Features Checklist

- [x] User registration with university email validation
- [x] Secure login with JWT authentication
- [x] Persistent sessions (token stored in localStorage)
- [x] Browse books with search, filter, and sort
- [x] Book details page with full information
- [x] Contact seller via in-app messaging
- [x] Real-time chat with polling (5-second interval)
- [x] Post book listings with image upload to Supabase Storage
- [x] Confirmation page after posting
- [x] Save/unsave books to favourites
- [x] View and manage favourites
- [x] View and delete own listings
- [x] Edit profile (name, university)
- [x] Change password
- [x] Profile stats (total listings, favourites, member since)
- [x] Responsive design (desktop sidebar + mobile bottom nav)
- [x] Loading skeletons and spinners
- [x] Error handling with user-friendly messages
- [x] Optimistic UI updates in chat
- [x] Delete confirmation modal

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Axios, Vite |
| Backend | Python 3.11, FastAPI, Pydantic v2 |
| Database | Supabase (PostgreSQL) |
| Storage | Supabase Storage |
| Auth | JWT (python-jose), bcrypt (passlib) |
| Deployment | Vercel (frontend), Render (backend) |

---

## 👨‍🎓 Assignment Information

- **Subject:** BUS4012 – Vibe Coding for Startups
- **Assignment:** 03 — Full Stack Application
- **Application:** UniBooks Exchange
- **Stack:** React + FastAPI + Supabase
