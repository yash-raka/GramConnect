# GramConnect

> A warm, village-first digital civic complaint portal ("Seva Desk") for rural India — helping villagers report Panchayat issues and track resolutions.

[![Vite](https://img.shields.io/badge/Vite-6.3.5-646CFF?logo=vite)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1.12-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?logo=supabase)](https://supabase.com/)

---

## What is GramConnect?

GramConnect allows Indian villagers to:
- **Submit complaints** about roads, water supply, electricity, sanitation, street lights, drainage, and more.
- **Attach photo/video evidence** to their reports.
- **Track ticket status** via a floating chatbot (search by Ticket ID or phone number).

Panchayat admins can:
- **View all submitted tickets** with filtering by status.
- **Update ticket status** (Pending ? In Progress ? Resolved / Rejected).
- **Add admin notes** on each ticket.
- **Create new user/admin accounts**.

The app works **offline-first** — it stores data in `localStorage` when the cloud backend is unreachable, and syncs to Supabase when connected.

---

## Prerequisites

Make sure you have the following installed:

| Tool | Minimum Version | Download |
|---|---|---|
| **Node.js** | `>= 18.x` | [nodejs.org](https://nodejs.org/) |
| **npm** | `>= 9.x` (comes with Node) | — |

---

## Quick Start

### 1. Clone or open the project

```bash
# If you have the folder already, just navigate to it:
cd path/to/GramConnect
```

### 2. Install dependencies

```bash
npm install
```

> The `.npmrc` file automatically configures the JSR registry (`https://npm.jsr.io`) for `@jsr/` scoped packages. No extra setup needed.

### 3. Start the development server

```bash
npm run dev
```

The app will start at **http://localhost:3000** and open automatically in your browser.

---

## Running Modes

### Development Server

```bash
npm run dev
```

- Runs Vite dev server on port **3000**
- Hot Module Replacement (HMR) enabled
- Auto-opens browser

### Production Build

```bash
npm run build
```

- Outputs optimized bundle to `./build/`
- Uses `esnext` as the build target

### Preview Production Build

```bash
npx vite preview
```

- Serves the `./build/` directory locally for production testing

---

## App Architecture: Two Modes

The app automatically detects whether the Supabase backend is reachable:

| Mode | When | Data Storage | Admin Auth |
|---|---|---|---|
| **Cloud Mode** ? | Backend is online | Supabase KV (Postgres) | Email + password (Supabase Auth) |
| **Local Mode** ??? | Backend is offline | Browser `localStorage` | No auth required |

A green/blue banner at the top of the app indicates which mode is active.

---

## Using the App

### For Villagers (User View)

1. Open the app at `http://localhost:3000`
2. Click **"Raise Ticket"** tab
3. Fill in your name, phone, issue details, category, location, and optionally attach an image/video
4. Click **"Submit Ticket"**
5. Use the **chatbot** (bottom-right chat bubble) to check your ticket status anytime using your Ticket ID or phone number

### For Admins (Admin View)

1. Click **"Admin View"** toggle
2. **Cloud mode**: Enter admin email and password ? click "Login as Admin"
3. **Local mode**: Admin dashboard is accessible without login
4. View ticket stats, filter by status, edit tickets, add notes
5. To **resolve** a ticket: set status to "Resolved" ? enter verification code `1234`

---

## Cloud Backend Setup (Optional)

> The app works fully in Local Mode without these steps. Only required for multi-device syncing and persistent cloud storage.

### Prerequisites

- [Supabase CLI](https://supabase.com/docs/guides/cli) installed
- A Supabase project (already configured — see `src/utils/supabase/info.tsx`)

### Deploy Edge Functions

```bash
# Login to Supabase CLI
supabase login

# Deploy the ticket server function
supabase functions deploy ticket-server
```

### Create Admin User

Once the backend is deployed, use the Admin Dashboard ? "Create New User" button, or:

```bash
# Via Supabase CLI
supabase functions invoke ticket-server --data '{
  "email": "admin@yourvillage.gov.in",
  "password": "securepassword",
  "name": "Panchayat Admin",
  "role": "admin"
}'
```

---

## Project Structure

```
GramConnect/
+-- src/
¦   +-- App.tsx              # Root component — state, view routing
¦   +-- components/          # All UI components
¦   ¦   +-- TicketForm.tsx   # Ticket submission form
¦   ¦   +-- TicketList.tsx   # Ticket list (user view)
¦   ¦   +-- AdminDashboard.tsx # Admin panel
¦   ¦   +-- AdminTicketCard.tsx # Ticket editor (admin)
¦   ¦   +-- AdminLogin.tsx   # Admin login form
¦   ¦   +-- CreateUser.tsx   # User creation modal
¦   ¦   +-- Chatbot.tsx      # Floating chatbot
¦   ¦   +-- Header.tsx       # App header
¦   ¦   +-- ui/              # shadcn/ui components (48 files)
¦   +-- types/
¦   ¦   +-- ticket.ts        # TypeScript type definitions
¦   +-- utils/
¦   ¦   +-- api.ts           # All API + localStorage fallback logic
¦   ¦   +-- supabase/
¦   ¦       +-- client.ts    # Supabase client singleton
¦   ¦       +-- info.tsx     # Project credentials (autogenerated)
¦   +-- styles/
¦       +-- globals.css      # Design system tokens + village theme
¦
+-- supabase/
    +-- functions/
        +-- ticket-server/   # Deno Edge Function
            +-- index.ts     # Hono HTTP router (all API endpoints)
            +-- kv_store.ts  # KV store CRUD (Supabase Postgres backend)
```

---

## Ticket Statuses

| Status | Color | Meaning |
|---|---|---|
| **Pending** | ?? Yellow | Submitted, awaiting admin review |
| **In Progress** | ?? Blue | Admin is working on the issue |
| **Resolved** | ?? Green | Issue has been fixed |
| **Rejected** | ?? Red | Issue was rejected (with admin notes) |

---

## Ticket Categories

Road & Potholes · Water Supply · Electricity · Sanitation · Street Light · Drainage · Other

---

## Known Prototype Notes

- **Resolution Code**: When resolving a ticket, the app asks for code `1234` — this is a demo mechanism simulating approval from both the worker and the citizen.
- **Media Storage**: Attachments are stored as Base64 data URLs inline with the ticket object (max 8 MB). For production, consider Supabase Storage.
- **No OTP/Mobile Auth**: Phone numbers are used for ticket lookup only, not for authentication.

---

## Tech Stack Summary

- **Frontend**: React 18 + TypeScript + Vite 6 + TailwindCSS v4
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Icons**: Lucide React
- **Backend**: Supabase Edge Functions (Deno + Hono)
- **Database**: Supabase Postgres (KV-style via `kv_store_43ff3f48` table)
- **Auth**: Supabase Auth (email/password, role-based)
- **Offline Fallback**: Browser `localStorage`

---

## License

Private project. Original design from [Figma](https://www.figma.com/design/sf3QCRR3VKJxBqT6CqHCsB/Ticket-Raising-App).
