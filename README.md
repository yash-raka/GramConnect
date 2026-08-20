# GramConnect — Civic Complaint Platform

> **A full-stack civic-tech governance platform for rural & semi-urban India, enabling citizens to file geo-tagged, multimedia complaints against local government bodies with verifiable resolution tracking.**

[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js)](https://nodejs.org)
[![MySQL](https://img.shields.io/badge/Database-MySQL-4479A1?logo=mysql)](https://mysql.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6.3-646CFF?logo=vite)](https://vitejs.dev)

---

## The Problem

Citizens in rural and semi-urban India have no efficient way to file complaints against local government bodies and track resolution. Existing systems rely on physical visits, lack accountability, and suffer from **fake-resolution fraud** — where officials mark complaints resolved without actually fixing them.

## The Solution

GramConnect provides:
- **Geo-tagged, multimedia complaint filing** (text, image, video, voice note)
- **Multilingual voice note support** — record complaints in any spoken language
- **Satisfaction Lock** — complaints can only be marked resolved after OTP verification from the citizen
- **Automatic Escalation Matrix** — unresolved complaints auto-escalate to state authorities after 7 days
- **Real-time heat maps** — admin dashboard shows issue density across regions

---

## Tech Stack

### Frontend
| Technology | Version | Role |
|---|---|---|
| **React.js** | `^18.3.1` | Core UI framework (SPA) |
| **TypeScript** | via Vite | Type safety |
| **Vite** | `6.3.5` | Build tool & dev server |
| **TailwindCSS** | `4.1.12` | Utility CSS framework |
| **Leaflet + react-leaflet** | `4.x` | Interactive issue heat maps |
| **Recharts** | `^2.15` | KPI charts in admin dashboard |
| **Radix UI + shadcn/ui** | Various | Accessible component primitives |
| **Axios** | `^1.x` | HTTP client for REST API calls |
| **Lucide React** | `^0.487` | Icon library |

### Backend
| Technology | Version | Role |
|---|---|---|
| **Node.js + Express.js** | `4.x` | REST API server |
| **Sequelize** | `^6.x` | MySQL ORM |
| **MySQL2** | `^3.x` | Database driver |
| **Multer** | `^1.x` | Voice note / media file uploads |
| **node-cron** | `^3.x` | Automatic escalation scheduler |
| **dotenv** | `^16.x` | Environment configuration |

### Database
- **MySQL** — 3 tables: `Tickets`, `VoiceNotes`, `OTPs`

### Architecture
3-tier architecture designed for AWS deployment:
- **Tier 1**: React frontend → AWS S3 + CloudFront
- **Tier 2**: Node.js/Express API → AWS EC2 / Elastic Beanstalk
- **Tier 3**: MySQL → AWS RDS

---

## Key Features

### 1. Geo-Tagged Multimedia Complaints
Citizens fill in complaint details including free-text location, which is stored with optional `lat`/`lng` coordinates for map visualization. Citizens can also use the GPS button to auto-fill their coordinates.

### 2. Multilingual Voice Note Support
Built using the browser's native `MediaRecorder` API. Citizens can tap a button, speak their complaint in any language (Hindi, Telugu, Tamil, etc.), and the `.webm` audio file is uploaded directly to the backend server.

### 3. Satisfaction Lock (OTP Verification)
When an admin attempts to mark a ticket as `resolved`:
1. The backend generates a 6-digit OTP valid for 10 minutes
2. The OTP is sent to the citizen's phone (simulated in dev console)
3. The citizen shares the OTP with the admin
4. Admin enters the OTP — only then does the system allow resolution
This prevents fake-resolution fraud.

### 4. Automatic Escalation Matrix
A `node-cron` job runs every midnight:
- Checks all unresolved tickets older than **7 days**
- Automatically changes `escalation_level` from `VILLAGE_PANCHAYAT` → `STATE_AUTHORITY`

### 5. Real-Time Issue Heat Maps
Admin dashboard uses **Leaflet maps** to display all complaints as color-coded circle markers:
- 🟠 Orange = Pending
- 🔵 Blue = In-Progress
- 🟢 Green = Resolved

### 6. Admin KPI Dashboard
- 5 live stat cards (Total, Pending, In-Progress, Resolved, Rejected)
- Filter tickets by status
- Full CRUD on tickets with admin notes

### 7. Citizen Chatbot
Chatbot lets citizens look up their ticket status by ticket ID or phone number without needing an account.

---

## Project Structure

```
GramConnect/
├── src/                        # React frontend (TypeScript)
│   ├── components/
│   │   ├── TicketForm.tsx      # Complaint form with GPS and voice recorder
│   │   ├── TicketList.tsx      # Citizen's ticket list view
│   │   ├── TicketCard.tsx      # Individual ticket card
│   │   ├── AdminDashboard.tsx  # Admin panel with heat map
│   │   ├── AdminTicketCard.tsx # Admin ticket management + OTP lock
│   │   ├── Chatbot.tsx         # Status lookup chatbot
│   │   └── Header.tsx          # App header
│   ├── types/ticket.ts         # TypeScript type definitions
│   ├── utils/api.ts            # Axios API layer
│   └── App.tsx                 # Root app component
│
└── server/                     # Node.js + Express backend
    ├── config/db.js            # Sequelize MySQL connection
    ├── models/
    │   ├── Ticket.js           # Ticket model (lat, lng, escalation)
    │   ├── VoiceNote.js        # Voice note file path model
    │   └── OTP.js              # OTP model with expiry
    ├── routes/tickets.js       # All REST API endpoints
    ├── uploads/                # Voice note audio files storage
    ├── server.js               # Express app + cron job
    └── .env                    # DB credentials
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- MySQL 8.0+ running locally
- A database named `gramconnect` created in MySQL

### 1. Database Setup
```sql
CREATE DATABASE gramconnect;
```

### 2. Configure Backend
Edit `server/.env`:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=gramconnect
```

### 3. Start the Backend
```bash
cd server
npm install
npm run dev
# ✓ Database synced successfully
# ✓ Server running on port 5000
```

### 4. Start the Frontend
```bash
# In root directory
npm install
npm run dev
# ✓ http://localhost:3000
```

---

## REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/tickets` | Fetch all tickets (with voice notes) |
| `POST` | `/api/tickets` | Create ticket (supports `multipart/form-data` for voice note) |
| `GET` | `/api/health` | Server health check |
| `POST` | `/api/tickets/:id/generate-otp` | Generate Satisfaction Lock OTP |
| `PUT` | `/api/tickets/:id/resolve` | Resolve ticket after OTP verification |

---

## Architecture & AWS Deployment

See `PROJECT_OVERVIEW.md` for a detailed breakdown of the DB schema and the AWS 3-tier deployment roadmap.

---

## Author

**Yash Raka** — Built to solve a real governance gap in rural India.
