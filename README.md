# 🏆 DIGITAL HEROES — Full-Stack Platform

> **A subscription-driven golf performance, charity contribution, and monthly prize-draw platform.**

---

## 🌟 Executive Overview

**Digital Heroes** transforms traditional golf score tracking into an impactful, transparent ecosystem:
1. **Stableford Golf Score Management**: Record scores (1–45 points), strictly 1 per date, automatically managing an active 5-score FIFO retention queue.
2. **Monthly Prize Draws**: Transparent 3-tier prize structure (Tier 1: 40% + Rollover Jackpot, Tier 2: 35%, Tier 3: 25%), supporting both *Cryptographically Secure Random Lottery* and *Algorithmic Weighted Score-Frequency* draw strategies.
3. **Charity & Philanthropic Impact**: Guaranteed minimum 10% auto-deduction from subscription fees with voluntary customization (up to 100%) plus an independent direct donation portal.
4. **Audited Winner Verification**: Private scorecard screenshot upload to Supabase Storage, administrator audit review, and direct payout processing (`pending` $\rightarrow$ `paid`).
5. **Role-Based Portals**: Distinct public visitor experience, subscriber dashboard, and an executive 5-module administrator command center.

---

## 🎨 Visual Identity & Design System

The application features a modern, editorial luxury / impact visual aesthetic:
- **Canvas / Ivory**: `#F3F1E8`
- **Obsidian / Ink**: `#0B1511`
- **Pine / Deep Muted Green**: `#3F765F`
- **Sage / Soft Surface Green**: `#AAB9A6` & `#DDE5D8`
- **Gold Accent**: `#C99452` & `#E5BF88`
- **Typography**: Editorial Serif Display (`Playfair Display`) paired with clean modern sans-serif (`Plus Jakarta Sans` / `Inter`) and Framer Motion micro-interactions.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite 6, Tailwind CSS 3, Framer Motion 12, Axios, Lucide React, React Router 7 |
| **Backend** | Node.js, Express.js 4, REST APIs, Supabase Auth + JWT, Helmet, Morgan, Rate Limiting |
| **Database** | Supabase PostgreSQL with Row Level Security (RLS) & Triggers |
| **Storage** | Supabase Storage (Private `scorecard-proofs` bucket with signed URLs) |
| **Payments** | Stripe API & Webhook Synchronization (Subscriptions & Direct Donations) |
| **Deployment** | Vercel (Frontend SPA) & Render / Node.js Container (Backend API) |

---

## 📁 System Architecture & Directory Layout

```
digital-heroes/
|-- backend/
|   |-- .env.example
|   |-- package.json
|   |-- server.js
|   |-- migrations/
|   |   |-- 001_initial_schema.sql      # PostgreSQL DDL, UUIDs, constraints, indexes
|   |   |-- 002_rls_and_functions.sql   # Row Level Security & transactional FIFO function
|   |   |-- 003_seed_data.sql           # Rich seed charities, published draws, profiles
|   |-- src/
|   |   |-- config/ (env, db, stripe)
|   |   |-- constants/ (drawConstants)
|   |   |-- controllers/ (auth, score, subscription, charity, draw, winner, webhook, admin/*)
|   |   |-- middleware/ (auth, role, errorHandler, rateLimiter)
|   |   |-- services/
|   |       |-- scoreService.js         # Transactional 5-score FIFO management
|   |       |-- storageService.js       # Private Supabase storage & signed URLs
|   |       |-- draw/
|   |           |-- DrawEngine.js       # Configure -> Simulate -> Review -> Publish
|   |           |-- RandomDrawStrategy.js   # Cryptographic RNG (crypto.randomInt)
|   |           |-- WeightedDrawStrategy.js # Algorithmic score-frequency distribution
|   |           |-- PrizeCalculator.js      # Configurable pool %, 40/35/25% splits & rollover
|   |           |-- WinnerCalculator.js     # 5/4/3 match counter & equal prize splits
|   |-- test/ (unit test suite for score FIFO, draw strategies, math calculations)
|
|-- frontend/
|   |-- .env.example
|   |-- package.json
|   |-- vite.config.js
|   |-- tailwind.config.js
|   |-- src/
|       |-- components/
|       |   |-- common/ (Navbar, Footer, Button, Card, Badge, Modal, LoadingSpinner, EmptyState)
|       |   |-- score/ (ScoreCardVisualizer, ScoreEntryModal, ScoreHistoryTable)
|       |   |-- charity/ (CharityCard, CharityFilter, PercentageSlider, DonationModal)
|       |   |-- draw/ (DrawBall, DrawCountdown, WinnerTiersBreakdown)
|       |   |-- admin/ (UserManagementTab, DrawManagementTab, CharityManagementTab, WinnerManagementTab, ReportsAnalyticsTab)
|       |-- context/ (AuthContext, NotificationContext)
|       |-- layouts/ (MainLayout, DashboardLayout)
|       |-- pages/
|       |   |-- public/ (HomePage, HowItWorksPage, CharitiesPage, CharityDetailPage, RulesDrawTransparencyPage, DrawsArchivePage, PricingPage, StandaloneDonationPage, LoginPage, RegisterPage, NotFoundPage)
|       |   |-- subscriber/ (DashboardOverview, ScoresManagementPage, CharitySelectionPage, DrawHistoryPage, WinningsProofPage, SubscriptionBillingPage)
|       |   |-- admin/ (AdminDashboardPage)
|       |-- services/ (api)
|-- REQUIREMENTS_TRACEABILITY.md
```

---

## 🧮 Mathematical Model & Documented Assumptions

### 1. Prize Pool & Tier Distribution Formula
- **Prize Pool Allocation**: Configurable via `PRIZE_POOL_PERCENTAGE` (default: `0.50` / 50% of subscriber revenue).
- **Tier 1 (5-Match Jackpot)**: 40% of active pool + previous rollover. **Rolls over to next month if unclaimed.**
- **Tier 2 (4-Match)**: 35% of active pool. Split equally among winners. No rollover.
- **Tier 3 (3-Match)**: 25% of active pool. Split equally among winners. No rollover.
- **Equal Splitting**: Multiple winners in any tier divide that tier's allocated pool equally.

### 2. Draw Entry Eligibility (Level-1 Documented Rule)
- A subscriber must have an `active` subscription AND have recorded all **5 Stableford scores** to participate in a monthly draw.
- No synthetic or handicap-fabricated numbers are created.
- At draw execution time, the user's 5 scores are captured as an **immutable snapshot** (`draw_entries.entry_numbers`), ensuring later score edits never alter past or active draw entries.

### 3. Dual Draw Strategies
1. **Random Lottery Mode**: Generates 5 unique integers between 1 and 45 using Node.js cryptographically secure pseudo-random number generator (`crypto.randomInt`).
2. **Algorithmic Weighted Mode**: Analyzes empirical frequency distributions across all active subscribers' recorded scores, selecting winning combinations that reflect collective performance clusters while maintaining provable mathematical fairness.

### 4. 5-Score Stableford FIFO Queue
- Valid score range: 1–45 points.
- Date requirement: Exactly one score per user per calendar date.
- Auto-eviction rule: Database transaction sorts all user scores by `played_at DESC, created_at DESC` and automatically deletes any records beyond index 4.

---

## ⚙️ Environment Variables

### Backend (`/backend/.env`)
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Supabase Credentials (Service Role Key strictly for backend)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
SUPABASE_ANON_KEY=your-supabase-anon-key
JWT_SECRET=your-jwt-secret-key

# Stripe Configuration (Test Mode)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_MONTHLY_PRICE_ID=price_monthly_id
STRIPE_YEARLY_PRICE_ID=price_yearly_id
STRIPE_YEARLY_DISCOUNTED_PRICE_ID=price_yearly_discounted_id

# Configurable Business Rules
PRIZE_POOL_PERCENTAGE=0.50
MIN_CHARITY_PERCENTAGE=10.00
```

### Frontend (`/frontend/.env`)
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

---

## 🚀 Local Development Setup

### 1. Backend Setup
```bash
cd backend
npm install
npm test            # Runs 7 automated unit tests
npm start           # Starts API server on http://localhost:5000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev         # Starts Vite dev server on http://localhost:5173
```

---

## ⚡ 1-Click Demo Accounts (Fast Local Testing)

On `/login`, click any of the 1-click test buttons:
- **Administrator**: `admin@digitalheroes.io` (Chief Administrator — Full access to Draw Engine, Winner Verification, User Management, Reports)
- **Subscriber 1**: `alexander@meridian.com` (Alexander Cross — Active subscription, 5 Stableford scores, Tier-1 Winner in Draw #102)
- **Subscriber 2**: `elena.rostova@vanguard.io` (Elena Rostova — Active subscription, 5 scores recorded)

---

## 🌐 API Overview

| Method | Endpoint | Access | Function |
|---|---|---|---|
| GET | `/api/health` | Public | Uptime, database status, timestamp, environment |
| POST | `/api/auth/register` | Public | Register subscriber & profile |
| POST | `/api/auth/login` | Public | Login & obtain JWT |
| GET | `/api/auth/me` | Authenticated | Fetch profile, subscription, selected charity |
| PUT | `/api/auth/charity-preference` | Subscriber | Update charity & contribution percentage (min 10%) |
| GET | `/api/scores` | Subscriber | Get 5 scores in reverse chronological order |
| POST | `/api/scores` | Subscriber | Add score (1–45, 1/date, 5-score FIFO auto-eviction) |
| PUT | `/api/scores/:id` | Subscriber | Edit score for date |
| DELETE | `/api/scores/:id` | Subscriber | Delete score |
| GET | `/api/subscriptions/plans` | Public | Dynamic Stripe plan pricing |
| POST | `/api/subscriptions/checkout-session` | Subscriber | Stripe Checkout URL |
| POST | `/api/subscriptions/portal` | Subscriber | Stripe Customer Billing Portal |
| GET | `/api/charities` | Public | Directory search, filter, categories |
| GET | `/api/charities/:slug` | Public | Charity detail profile & events |
| POST | `/api/charities/:id/donate` | Public | Independent direct donation checkout |
| GET | `/api/draws/current` | Public | Current draw countdown & prize pool |
| GET | `/api/draws/archive` | Public | Past published draws & winning balls |
| GET | `/api/draws/user/my-entries` | Subscriber | Subscriber's draw entries & matched numbers |
| GET | `/api/winners/my-winnings` | Subscriber | Subscriber's winning claims & proof statuses |
| POST | `/api/winners/:id/proof` | Subscriber | Upload scorecard proof to private storage |
| GET | `/api/admin/users` | Admin | List & search users |
| PUT | `/api/admin/users/:id` | Admin | Update user role / handicap |
| PUT | `/api/admin/scores/:id` | Admin | Override user golf score |
| GET | `/api/admin/draws` | Admin | List all draws |
| POST | `/api/admin/draws` | Admin | Create draft draw |
| POST | `/api/admin/draws/:id/simulate` | Admin | Run Random or Weighted simulation (no publish) |
| POST | `/api/admin/draws/:id/publish` | Admin | Publish draw, create snapshots & winners |
| POST | `/api/admin/charities` | Admin | Create new charity |
| PUT | `/api/admin/charities/:id` | Admin | Edit charity / toggle featured |
| DELETE | `/api/admin/charities/:id` | Admin | Delete charity |
| GET | `/api/admin/winners` | Admin | Audit winners across draws |
| PUT | `/api/admin/winners/:id/verify` | Admin | Approve or reject scorecard proof |
| PUT | `/api/admin/winners/:id/payout` | Admin | Mark payout completed with reference |
| GET | `/api/admin/reports` | Admin | Financial KPI aggregates & analytics |

---

## 🔒 Security & Row Level Security (RLS)
- **Zero Client Credential Leakage**: `SUPABASE_SERVICE_ROLE_KEY` and `STRIPE_SECRET_KEY` are strictly backend-only. The frontend receives only public keys.
- **Row Level Security**: Defined across all PostgreSQL tables (`profiles`, `subscriptions`, `scores`, `draw_entries`, `winners`, `charities`, `draws`, `donations`).
- **Private Winner Proof Storage**: Bucket `scorecard-proofs` is private. Only the winning subscriber and authorized admins can access proof assets via time-limited signed URLs.
- **Server-Side RBAC**: Admin routes verify privileges server-side via `is_admin()` and Express RBAC middleware.

---

## 🚢 Production Deployment

### Frontend (Vercel)
1. Import repository on Vercel.
2. Set Framework Preset: **Vite**.
3. Set Root Directory: `frontend`.
4. Configure Environment Variables: `VITE_API_BASE_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
5. Deploy.

### Backend (Render / Node.js)
1. Create a Web Service on Render pointing to `backend`.
2. Build Command: `npm install`.
3. Start Command: `node server.js`.
4. Configure Environment Variables from `backend/.env.example`.
5. Set Stripe Webhook URL: `https://your-backend.onrender.com/api/webhooks/stripe`.

---

## 📋 Requirements Traceability

See [REQUIREMENTS_TRACEABILITY.md](file:///c:/Users/kumar/OneDrive/Desktop/Digital%20Heroes/REQUIREMENTS_TRACEABILITY.md) for the complete traceability matrix mapping every PRD requirement to Database DDL, REST API endpoints, UI components, backend services, and automated test cases.
