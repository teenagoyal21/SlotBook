# SlotBook

# SlotBook — Smart Offer Slot Booking System

A full-stack web application that lets service-based businesses (restaurants, gyms, salons, clinics, coaching centres, turfs, and more) publish time-limited discount offers and allow customers to book slots against them — no login required for customers.

---

## Overview

SlotBook has two distinct surfaces:

- **Public storefront** — customers browse active offers, view details, pick a time slot, and complete a booking in seconds.
- **Admin portal** — business owners log in to manage their business profile, create/edit offers, define available slots, and track bookings from a dashboard.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Backend (primary) | Supabase (PostgreSQL + Auth + Row Level Security) |
| Backend (alternative) | ASP.NET Core 8 Web API (C#), Entity Framework Core, PostgreSQL |
| Icons | Lucide React |
| Router | Custom hash-free SPA router (no react-router dependency) |

The repository ships **two backend options**: a Supabase-first approach (used by the frontend out of the box) and a standalone ASP.NET Core REST API that mirrors the same data model.

---

## Features

### Public (unauthenticated)
- Browse and filter active offers by business type, category, price range, and date
- Countdown timer on each offer card showing time remaining
- View offer details including terms & conditions, capacity, and available time slots
- Book a slot by providing name, phone, email, headcount, and an optional note
- Unique booking reference generated automatically

### Admin
- Register / login with email and password (JWT via Supabase Auth or ASP.NET Core)
- Create and manage the business profile (type, contact info, opening hours, logo)
- Create offers with original price, discounted price (auto-calculated percentage), date/time range, capacity limits, and per-customer booking caps
- Manage offer status: Draft → Active → Paused → Expired → Cancelled
- Define time slots per offer (date, start/end time, capacity)
- View and update booking statuses: Pending, Confirmed, Cancelled, Completed, NoShow
- Dashboard with live stats: total/active offers, total/today's bookings, capacity utilisation, conversion rate

---

## Project Structure

```
SlotBook/
├── src/
│   ├── components/
│   │   ├── AdminLayout.tsx         # Admin shell with sidebar
│   │   ├── AdminSidebar.tsx        # Navigation for admin portal
│   │   ├── CountdownTimer.tsx      # Live countdown on offer cards
│   │   ├── Navbar.tsx              # Public storefront header
│   │   └── OfferCard.tsx           # Card shown in offer listing
│   ├── context/
│   │   └── AuthContext.tsx         # Supabase session context
│   ├── lib/
│   │   ├── api.ts                  # All Supabase data-access functions
│   │   ├── database.types.ts       # TypeScript interfaces & enums
│   │   ├── router.tsx              # Lightweight custom SPA router
│   │   └── supabase.ts             # Supabase client initialisation
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── BusinessProfilePage.tsx
│   │   │   ├── CreateOfferPage.tsx
│   │   │   ├── ManageOffersPage.tsx
│   │   │   ├── ManageSlotsPage.tsx
│   │   │   └── ManageBookingsPage.tsx
│   │   └── public/
│   │       ├── OfferListingPage.tsx
│   │       ├── OfferDetailPage.tsx
│   │       └── BookingPage.tsx
│   ├── App.tsx
│   └── main.tsx
├── supabase/
│   └── migrations/
│       ├── 20260524142934_smart_offer_slot_booking_system.sql   # Schema + RLS
│       ├── 20260524144023_seed_demo_admin_user.sql
│       ├── 20260524144106_fix_businesses_fk_to_auth_users.sql
│       └── 20260524144131_seed_sample_data.sql
├── backend/
│   └── SmartOfferSlotBooking/      # Optional ASP.NET Core API
│       ├── Controllers/            # Auth, Business, Offers, Slots, Bookings, Dashboard
│       ├── Models/                 # EF Core entity classes
│       ├── DTOs/                   # Request/response shapes
│       ├── Data/AppDbContext.cs
│       └── Program.cs
├── index.html
├── vite.config.ts
├── tailwind.config.js
└── package.json
```

---

## Data Model

```
admin_users  ──< businesses ──< offers ──< offer_slots ──< bookings
```

| Table | Key fields |
|---|---|
| `admin_users` | id, name, email, password_hash, role |
| `businesses` | id, admin_user_id, name, business_type, city, opening/closing time |
| `offers` | id, business_id, title, category, original_price, offer_price, discount_percentage, start/end date, capacity, status |
| `offer_slots` | id, offer_id, slot_date, start_time, end_time, capacity, booked_count, status |
| `bookings` | id, booking_reference, offer_id, slot_id, customer details, people_count, status |

Business types: `Restaurant | Gym | Salon | Clinic | Coaching | Turf | Other`

Offer statuses: `Draft | Active | Paused | Expired | Cancelled`

Slot statuses: `Available | Full | Closed | Expired | Cancelled`

Booking statuses: `Pending | Confirmed | Cancelled | Completed | NoShow`

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project (free tier works)

### 1. Clone and install

```bash
git clone <repo-url>
cd SlotBook
npm install
```

### 2. Configure Supabase

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run database migrations

In your Supabase project, open the SQL Editor and run the migration files in order:

```
supabase/migrations/20260524142934_smart_offer_slot_booking_system.sql
supabase/migrations/20260524144023_seed_demo_admin_user.sql
supabase/migrations/20260524144106_fix_businesses_fk_to_auth_users.sql
supabase/migrations/20260524144131_seed_sample_data.sql
```

Or use the Supabase CLI:

```bash
supabase db push
```

### 4. Run the dev server

```bash
npm run dev
```

The app is served at `http://localhost:5173`.

---

## Routes

| Path | Access | Description |
|---|---|---|
| `/` | Public | Offer listing with filters |
| `/offers/:id` | Public | Offer detail page |
| `/offers/:id/book` | Public | Booking form |
| `/admin/login` | Public | Admin login |
| `/admin/dashboard` | Admin | Stats overview |
| `/admin/business` | Admin | Business profile editor |
| `/admin/offers` | Admin | List and manage offers |
| `/admin/offers/create` | Admin | Create new offer |
| `/admin/offers/edit/:id` | Admin | Edit existing offer |
| `/admin/slots` | Admin | Manage time slots per offer |
| `/admin/bookings` | Admin | View and update bookings |

---

## Optional: ASP.NET Core Backend

An alternative REST API is provided under `backend/SmartOfferSlotBooking/` for teams that prefer a .NET backend over Supabase.

### Requirements

- .NET 8 SDK
- PostgreSQL instance

### Configuration

Update `backend/SmartOfferSlotBooking/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=slotbook;Username=postgres;Password=yourpassword"
  },
  "Jwt": {
    "Secret": "your-secret-key-min-32-chars",
    "Issuer": "SmartOfferSlotBooking",
    "Audience": "SmartOfferSlotBooking"
  }
}
```

### Run

```bash
cd backend/SmartOfferSlotBooking
dotnet run
```

Swagger UI is available at `http://localhost:5000/swagger` in development.

### API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Register admin |
| POST | `/api/auth/login` | — | Login, returns JWT |
| GET/POST/PUT/DELETE | `/api/businesses` | Admin | Business CRUD |
| GET/POST/PUT/DELETE | `/api/offers` | Mixed | Offers (public read, admin write) |
| GET/POST/PUT/DELETE | `/api/slots` | Mixed | Slots (public read, admin write) |
| POST | `/api/bookings` | — | Create booking |
| GET/PUT | `/api/bookings` | Admin | View/update bookings |
| GET | `/api/dashboard` | Admin | Summary stats |

---

## Available Scripts

```bash
npm run dev        # Start Vite dev server
npm run build      # Production build
npm run preview    # Preview production build locally
npm run lint       # ESLint
npm run typecheck  # TypeScript type check (no emit)
```

---

## Security Notes

- Row Level Security (RLS) is enabled on all Supabase tables.
- Public users can read active offers and slots, and create bookings — but cannot read or modify admin data.
- Admin operations require Supabase Auth session (authenticated role).
- The ASP.NET Core backend uses BCrypt for password hashing and HS256 JWTs expiring after 7 days.
- Replace the default `Jwt:Secret` in `appsettings.json` before deploying.

---

## License

MIT
