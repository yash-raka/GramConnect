# GramConnect — Project Overview

> **A digital civic-complaint platform (Seva Desk) designed for rural Indian villages to help villagers raise infrastructure issues to their local Panchayat (village government).**

---

## Executive Summary

GramConnect is a **village-first public-service portal** that bridges the communication gap between rural citizens and local government bodies (Panchayats). It provides a warm, approachable interface through which villagers can:

- **Report local infrastructure problems** — potholes, water supply failures, electricity outages, sanitation issues, broken street lights, drainage problems, and more.
- **Track the status** of their submitted complaints via a built-in chatbot.
- **Receive admin responses** including status updates and resolution notes from Panchayat officials.

The platform is designed to be **offline-resilient**: it functions entirely in the browser using `localStorage` when the cloud backend is unavailable, and seamlessly syncs to a Supabase-powered cloud backend when deployed.

---

## Complete Tech Stack

### Frontend

| Technology | Version | Role |
|---|---|---|
| **React** | `^18.3.1` | Core UI framework (SPA) |
| **TypeScript** | (via Vite plugin) | Type safety across the entire codebase |
| **Vite** | `6.3.5` | Build tool & dev server (port 3000) |
| **TailwindCSS** | `4.1.12` | Utility-first CSS framework (v4 via Vite plugin) |
| **tw-animate-css** | `^1.3.8` | CSS animations / transitions layer |
| **Lucide React** | `^0.487.0` | Icon library |
| **Radix UI** (full suite) | Various | Headless accessible component primitives |
| **shadcn/ui** | (local copies) | Pre-built UI components built on Radix |
| **sonner** | `^2.0.3` | Toast notifications |
| **react-hook-form** | `^7.55.0` | Form state management |
| **recharts** | `^2.15.2` | Charting library |
| **next-themes** | `^0.4.6` | Dark mode theming support |
| **cmdk** | `^1.1.1` | Command palette component |
| **vaul** | `^1.1.2` | Drawer/sheet component |
| **embla-carousel-react** | `^8.6.0` | Carousel component |

### Backend / Cloud

| Technology | Version | Role |
|---|---|---|
| **Supabase** | `^2` | BaaS — Auth, KV Database, Edge Functions |
| **@supabase/supabase-js** | `^2` | Supabase JS client |
| **Hono** | `*` | Lightweight HTTP framework running on Deno |
| **Deno** | (runtime) | JavaScript runtime for Supabase Edge Functions |
| **Supabase KV Store** | (via `kv_store_43ff3f48` table) | Key-value ticket storage backed by Postgres |

### Package Management & Tooling

| Tool | Detail |
|---|---|
| **npm** | Package manager |
| **JSR** | `@jsr:registry=https://npm.jsr.io` — JavaScript Registry for Supabase packages |
| **@tailwindcss/vite** | `4.1.12` — Tailwind v4 Vite integration |
| **@vitejs/plugin-react** | `^4.7.0` — React fast refresh |

### Typography

- **Nunito** — Body font (warm, rounded, accessible)
- **Merriweather** — Serif heading font (`.village-title` class)

---

## Core Features & Workflow Architecture

### Two-Mode Architecture

The app operates in one of two modes, decided by a health check on startup:

```
Browser App
     |
     v
checkBackendHealth() --> Supabase Edge Function /health (5s timeout)
     |
  unavailable                         available
     |                                    |
     v                                    v
LOCAL MODE                           CLOUD MODE
(localStorage)                  (Supabase Edge Functions)
  - No auth required               - Hono HTTP router on Deno
  - gramconnect_tickets key         - KV store --> Postgres table
  - JSON array in browser           - Admin ops require JWT (role=admin)
```

### User Flows

1. **Ticket Submission (User View)**
   - Fill in: Name, Phone, Title, Category, Description, Location, Media (optional), Priority
   - Submit ? stored in cloud or localStorage fallback
   - Auto-redirected to Ticket List

2. **Ticket Tracking (Chatbot)**
   - Click floating chat button
   - Enter Ticket ID (e.g., `TICKET-1753012345678`) or Phone Number
   - Bot returns ticket status + admin notes

3. **Admin Dashboard (Admin View)**
   - Login with email/password (cloud mode) or auto-access (local mode)
   - View stats: Total / Pending / In Progress / Resolved / Rejected
   - Filter tickets by status
   - Edit ticket status + add admin notes
   - Resolve requires verification code `1234` (prototype demo)
   - Delete tickets
   - Create new user accounts (cloud mode only)

---

## Database Schema / Data Models

### Ticket TypeScript Interface

```typescript
interface Ticket {
  id: string;              // e.g., "TICKET-1753012345678"
  title: string;           // Short issue description
  description: string;     // Detailed problem description
  category: TicketCategory; // 'road' | 'water' | 'electricity' | 
                           //  'sanitation' | 'street_light' | 'drainage' | 'other'
  priority: TicketPriority; // 'low' | 'medium' | 'high' | 'urgent'
  location: string;        // Free-text location description
  status: TicketStatus;    // 'pending' | 'in_progress' | 'resolved' | 'rejected'
  createdAt: string;       // ISO 8601 timestamp
  updatedAt: string;       // ISO 8601 timestamp
  userName: string;        // Submitter full name
  phoneNumber: string;     // Submitter phone (used for chatbot lookup)
  adminNotes?: string;     // Optional notes from admin
  attachment?: {
    kind: 'image' | 'video';
    name: string;
    url: string;           // Base64 data URL (stored inline, max 8 MB)
  };
}
```

### Supabase KV Store Table: `kv_store_43ff3f48`

| Column | Type | Description |
|---|---|---|
| `key` | `text` (PK) | Pattern: `ticket:TICKET-<timestamp>` |
| `value` | `jsonb` | Full serialized Ticket object |

### User Roles (Supabase Auth)

```json
{
  "user_metadata": {
    "name": "Admin Name",
    "role": "admin"
  }
}
```

---

## API Endpoints

Base URL: `https://pmcuvlnmcvurxlzuqwpq.supabase.co/functions/v1/ticket-server`

| Method | Path | Auth Required | Description |
|---|---|---|---|
| `GET` | `/health` | Anon Key | Health check |
| `GET` | `/tickets` | Anon Key | Fetch all tickets |
| `GET` | `/tickets/search?query=` | Anon Key | Search by ID or phone |
| `POST` | `/tickets` | Anon Key | Create new ticket |
| `PATCH` | `/tickets/:id` | Admin JWT | Update status + notes |
| `DELETE` | `/tickets/:id` | Admin JWT | Delete a ticket |
| `POST` | `/signup` | Anon Key | Create user account |
| `GET` | `/debug-auth` | Admin JWT | Debug JWT token |

---

## Environment Variables / Configuration

### Frontend (hardcoded in `src/utils/supabase/info.tsx`)

> These values are autogenerated — no `.env` file is needed for the frontend.

| Variable | Current Value |
|---|---|
| `projectId` | `pmcuvlnmcvurxlzuqwpq` |
| `publicAnonKey` | (JWT token in info.tsx) |

### Backend Edge Functions (Supabase runtime secrets — auto-injected)

| Variable | Description |
|---|---|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (admin access) |

### Local Dev Settings

| Setting | Value |
|---|---|
| Dev server port | `3000` |
| Build output | `./build/` |
| Module type | ES Modules |
| JSR registry | `https://npm.jsr.io` (via `.npmrc`) |

---

## Key Architecture Patterns

1. **Dual-Mode Resilience** — Backend health-checked on startup. All CRUD ops have a localStorage fallback path.

2. **Singleton Supabase Client** — `createClient()` uses module-level caching.

3. **Role-Based Access Control** — Admin role checked on frontend AND enforced server-side via JWT verification.

4. **Resolution Code Lock (Prototype)** — Resolving a ticket requires entering code `1234`, simulating dual approval.

5. **Chatbot as Status Portal** — Citizens can look up ticket status by ID or phone number.

6. **Media as Base64 Data URLs** — Attachments stored inline with ticket JSON (max 8 MB).

---

## Project Folder Layout

```
GramConnect/
+-- index.html                    # HTML entry point
+-- package.json                  # Dependencies & npm scripts
+-- vite.config.ts                # Vite config (aliases, port 3000)
+-- .npmrc                        # JSR registry configuration
+-- .gitignore
¦
+-- src/
¦   +-- main.tsx                  # React entry point
¦   +-- App.tsx                   # Root component (state, routing logic)
¦   +-- index.css                 # Tailwind + global styles import
¦   ¦
¦   +-- components/
¦   ¦   +-- Header.tsx            # App header with logo + logout button
¦   ¦   +-- TicketForm.tsx        # Public ticket submission form
¦   ¦   +-- TicketList.tsx        # Ticket list display (user view)
¦   ¦   +-- TicketCard.tsx        # Single ticket card (user view)
¦   ¦   +-- AdminLogin.tsx        # Admin email/password login
¦   ¦   +-- AdminDashboard.tsx    # Admin panel with stats + filter
¦   ¦   +-- AdminTicketCard.tsx   # Ticket card with admin controls
¦   ¦   +-- CreateUser.tsx        # Modal to create user accounts
¦   ¦   +-- Chatbot.tsx           # Floating chatbot for ticket lookup
¦   ¦   +-- DebugPanel.tsx        # Developer debug utilities
¦   ¦   +-- ui/                   # 48 shadcn/ui component files
¦   ¦
¦   +-- types/
¦   ¦   +-- ticket.ts             # Ticket TypeScript interfaces & types
¦   ¦
¦   +-- utils/
¦   ¦   +-- api.ts                # API calls + localStorage fallback logic
¦   ¦   +-- supabase/
¦   ¦       +-- client.ts         # Supabase client singleton
¦   ¦       +-- info.tsx          # Project ID + anon key (autogenerated)
¦   ¦
¦   +-- styles/
¦       +-- globals.css           # Design tokens, village theme, typography
¦
+-- supabase/
    +-- functions/
        +-- ticket-server/        # Deployed Edge Function
            +-- index.ts          # Hono app with all API routes
            +-- kv_store.ts       # KV store CRUD helpers (Postgres-backed)
```
