# GramConnect - Project Overview

## Summary

GramConnect is a civic-tech governance platform solving a real problem: citizens in rural and semi-urban India have no efficient way to file complaints against local government bodies and track resolution.

## Architecture

```
+------------------+       REST API        +---------------------+       +----------+
|  React Frontend  |  <----------------->  |  Node.js / Express  |  <->  |  MySQL   |
|  localhost:3000  |    axios + FormData   |  localhost:5000     |       |  gramconnect |
+------------------+                       +---------------------+       +----------+
```

## Feature Details

### 1. Complaint Filing (TicketForm.tsx)
- Fields: Name, Phone, Title, Description, Category, Priority, Location
- Optional image/video attachment (base64 preview)
- Optional voice note via MediaRecorder API (uploads as .webm to server/uploads/)
- Geo-tag: lat/lng stored alongside location text

### 2. Satisfaction Lock (AdminTicketCard.tsx + routes/tickets.js)
When admin sets status to "resolved":
1. POST /api/tickets/:id/generate-otp -> 6-digit OTP generated, logged to console (simulated SMS)
2. Admin enters the OTP the citizen verbally provides
3. PUT /api/tickets/:id/resolve validates OTP (10 min expiry) -> marks resolved
This prevents fake-resolution fraud.

### 3. Automatic Escalation Matrix (server.js - node-cron)
- Cron schedule: every midnight (0 0 * * *)
- Logic: UPDATE tickets SET escalation_level = 'STATE_AUTHORITY'
  WHERE status != 'resolved' AND created_at < NOW() - 7 days
- escalation_level: VILLAGE_PANCHAYAT -> STATE_AUTHORITY

### 4. Real-Time Heat Map (AdminDashboard.tsx)
- Library: react-leaflet v4 + leaflet
- Map centered on India (lat: 20.59, lng: 78.96)
- Color-coded CircleMarkers per ticket:
  - Orange = pending
  - Blue = in_progress
  - Green = resolved
- Popup on click shows title, status, location

### 5. Admin KPI Dashboard
- Stat cards: Total, Pending, In-Progress, Resolved, Rejected
- Click stat card to filter ticket list
- Full ticket management: change status, add admin notes, delete

### 6. Citizen Chatbot (Chatbot.tsx)
- Status lookup by ticket ID or phone number
- No login required

## Database Schema

### Tickets
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| name | STRING | Citizen name |
| phone | STRING | Phone for OTP delivery |
| title | STRING | Issue title |
| description | TEXT | Issue details |
| category | STRING | road/water/electricity/sanitation/street_light/drainage/other |
| priority | STRING | low/medium/high/urgent |
| status | STRING | pending/in_progress/resolved/rejected |
| location | STRING | Text description |
| lat | FLOAT | Latitude for heat map |
| lng | FLOAT | Longitude for heat map |
| escalation_level | STRING | VILLAGE_PANCHAYAT / STATE_AUTHORITY |
| adminNotes | TEXT | Admin response |

### VoiceNotes
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| filePath | STRING | Path to .webm file in server/uploads/ |
| TicketId | UUID | Foreign key -> Tickets.id |

### OTPs
| Column | Type | Notes |
|--------|------|-------|
| id | INT | Primary key |
| code | STRING | 6-digit OTP |
| expiresAt | DATE | 10 minutes from generation |
| TicketId | UUID | Foreign key -> Tickets.id |

## AWS Deployment Roadmap

### Tier 1 - Frontend
1. `npm run build` -> generates `build/` folder
2. Upload `build/` to AWS S3 bucket with static hosting enabled
3. Create CloudFront distribution pointing to S3 for HTTPS + CDN
4. Register domain on Route 53, point to CloudFront URL

### Tier 2 - Backend
1. Deploy `server/` to AWS EC2 (Ubuntu) or Elastic Beanstalk
2. Use PM2 for process management: `pm2 start server.js`
3. Configure security groups to allow port 5000
4. Set environment variables via EC2 Parameter Store or .env

### Tier 3 - Database
1. Create AWS RDS MySQL 8.0 instance
2. Update server/.env: DB_HOST=<rds-endpoint>, DB_PASSWORD=<secure>
3. Allow inbound MySQL (3306) from EC2 security group only

### Media Storage
- Replace local `server/uploads/` with AWS S3 bucket
- Use `multer-s3` instead of `multer` disk storage
- Serve voice note URLs directly from S3

### SMS (Production OTP)
- Replace console.log OTP with Twilio SMS API
- `npm install twilio`
- `await twilioClient.messages.create({ body: code, to: phone, from: twilioNumber })`
