# GramConnect - Civic Complaint Platform

A full-stack civic-tech governance platform for rural and semi-urban India.

## Tech Stack

- **Frontend**: React.js 18, TypeScript, Vite, TailwindCSS, Leaflet (Heat Maps), Axios
- **Backend**: Node.js, Express.js, REST APIs
- **Database**: MySQL with Sequelize ORM
- **Architecture**: 3-tier (designed for AWS deployment)

## Key Features

- Geo-tagged multimedia complaint filing
- Multilingual voice note recording (MediaRecorder API)
- Satisfaction Lock - OTP verification before resolution
- Automatic Escalation Matrix - 7-day SLA cron job
- Real-time issue heat maps (Leaflet)
- Admin KPI dashboard with stats and charts
- Citizen chatbot for ticket status lookup

## Getting Started

### Prerequisites
- Node.js 18+
- MySQL 8.0+ running locally

### Database Setup
```sql
CREATE DATABASE gramconnect;
```

### Backend
```bash
cd server
npm install
# Edit .env with your DB credentials
npm run dev
# Server on http://localhost:5000
```

### Frontend
```bash
npm install
npm run dev
# App on http://localhost:3000
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/health | Health check |
| GET | /api/tickets | Get all tickets |
| POST | /api/tickets | Create ticket with optional voice note |
| POST | /api/tickets/:id/generate-otp | Generate Satisfaction Lock OTP |
| PUT | /api/tickets/:id/resolve | Resolve ticket after OTP verification |

## Project Structure

```
GramConnect/
├── src/                     # React frontend
│   ├── components/          # UI components
│   ├── types/ticket.ts      # TypeScript types
│   ├── utils/api.ts         # Axios API layer
│   └── App.tsx
└── server/                  # Node.js backend
    ├── config/db.js         # MySQL connection
    ├── models/              # Sequelize models
    ├── routes/tickets.js    # REST API routes
    ├── uploads/             # Voice note files
    └── server.js            # Express app + cron job
```

## Author

Yash Raka
