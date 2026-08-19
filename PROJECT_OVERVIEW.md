# GramConnect — Project Overview

> **A digital civic-complaint platform (Seva Desk) designed for rural Indian villages to help villagers raise infrastructure issues to their local Panchayat (village government).**

---

## Executive Summary

GramConnect is a **village-first public-service portal** that bridges the communication gap between rural citizens and local government bodies (Panchayats). It provides a warm, approachable interface through which villagers can:

- **Report local infrastructure problems** — potholes, water supply failures, electricity outages, sanitation issues, broken street lights, drainage problems, and more.
- **Track the status** of their submitted complaints via a built-in chatbot.
- **Receive admin responses** including status updates and resolution notes from Panchayat officials.

Currently, the platform runs in **Local Mode**: it functions entirely in the browser using `localStorage`, making it highly accessible and easy to run locally without a backend. It is designed to be highly scalable and can be seamlessly deployed to a cloud provider like **AWS (Amazon Web Services)** for production use.

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
| **next-themes** | `^0.4.6` | Dark mode theming support |
| **cmdk** | `^1.1.1` | Command palette component |

### Current Data Storage
- **Browser `localStorage`**: Currently handles all data storage natively in the browser via the `gramconnect_tickets` key.

### Typography (via Google Fonts)
- **Nunito** — Body font (warm, rounded, accessible)
- **Merriweather** — Serif heading font (`.village-title` class)

---

## Core Features & Workflow Architecture

```
+-------------------------------------------------------------+
¦                        GramConnect UI                        ¦
¦                                                             ¦
¦  +-------------------+       +--------------------------+  ¦
¦  ¦    USER VIEW       ¦       ¦       ADMIN VIEW          ¦  ¦
¦  ¦                   ¦       ¦                          ¦  ¦
¦  ¦  +-------------+  ¦       ¦  +--------------------+  ¦  ¦
¦  ¦  ¦ TicketForm  ¦  ¦       ¦  ¦  AdminDashboard    ¦  ¦  ¦
¦  ¦  ¦  - Name     ¦  ¦       ¦  ¦  - Stats (5 cards) ¦  ¦  ¦
¦  ¦  ¦  - Phone    ¦  ¦       ¦  ¦  - Filter by status¦  ¦  ¦
¦  ¦  ¦  - Title    ¦  ¦       ¦  ¦  - AdminTicketCard ¦  ¦  ¦
¦  ¦  ¦  - Category ¦  ¦       ¦  ¦    * Edit status   ¦  ¦  ¦
¦  ¦  ¦  - Priority ¦  ¦       ¦  ¦    * Add notes     ¦  ¦  ¦
¦  ¦  ¦  - Location ¦  ¦       ¦  ¦    * Delete ticket ¦  ¦  ¦
¦  ¦  ¦  - Media    ¦  ¦       ¦  ¦    * Resolve lock  ¦  ¦  ¦
¦  ¦  +-------------+  ¦       ¦  +--------------------+  ¦  ¦
¦  ¦  +-------------+  ¦       ¦                          ¦  ¦
¦  ¦  ¦ TicketList  ¦  ¦       ¦                          ¦  ¦
¦  ¦  ¦  - View all ¦  ¦       ¦                          ¦  ¦
¦  ¦  ¦  submitted  ¦  ¦       ¦                          ¦  ¦
¦  ¦  +-------------+  ¦       ¦                          ¦  ¦
¦  +-------------------+       ¦                          ¦  ¦
¦                              ¦                          ¦  ¦
¦  +-----------------------+   ¦                          ¦  ¦
¦  ¦      Chatbot          ¦   ¦                          ¦  ¦
¦  ¦  (ticket status lookup¦   ¦                          ¦  ¦
¦  ¦   by ID or phone no.) ¦   ¦                          ¦  ¦
¦  +-----------------------+   +--------------------------+  ¦
+-------------------------------------------------------------+
```

---

## Future Production Deployment Guide (AWS)

To move this project from local development to a fully scalable cloud architecture, you will need to deploy it to **Amazon Web Services (AWS)**. Here is the detailed roadmap of the services required and the steps you need to take.

### Phase 1: Deploying the Frontend (React + Vite)
To make the application available to villagers over the internet securely and at high speed:

1. **Build the Application**: 
   - Run `npm run build` locally. This creates an optimized `dist` folder containing the static HTML, CSS, and JS assets.
2. **AWS S3 (Simple Storage Service)**: 
   - Create an S3 Bucket (e.g., `gramconnect-frontend`).
   - Enable "Static Website Hosting" on the bucket.
   - Upload the contents of your `dist` folder to this bucket.
3. **AWS CloudFront (CDN)**: 
   - Create a CloudFront Distribution pointing to your S3 bucket.
   - This ensures the website loads blazingly fast across all rural regions by caching the UI close to the users.
   - It also automatically provides a secure HTTPS connection.
4. **AWS Route 53 (DNS)**: 
   - Register a custom domain (e.g., `gramconnect.in`) and use Route 53 to map the domain to your CloudFront distribution URL.

### Phase 2: Building the Cloud Backend
Currently, `api.ts` uses `localStorage` to save tickets. To allow admins to see tickets submitted by villagers on different devices, you need a centralized cloud database.

1. **Amazon DynamoDB (Database)**: 
   - Create a NoSQL DynamoDB table named `Tickets`.
   - Set the Partition Key to `id` (String) so you can look up tickets quickly.
2. **AWS Lambda (Serverless Compute)**: 
   - Write small Node.js serverless functions to handle data operations.
   - Example Functions needed:
     - `createTicket`: Validates incoming ticket data and saves it to DynamoDB.
     - `getTickets`: Fetches all tickets for the Admin Dashboard.
     - `updateTicketStatus`: Allows admins to change the ticket status and add notes.
     - `searchTickets`: Allows the Chatbot to look up a ticket by ID or Phone number.
3. **AWS API Gateway (API Layer)**: 
   - Create a REST API (e.g., `api.gramconnect.in`).
   - Create endpoints (`POST /tickets`, `GET /tickets`, `PATCH /tickets/{id}`) and connect them to your Lambda functions.

### Phase 3: Securing the Admin Dashboard
Admins should be the only people allowed to edit tickets.

1. **Amazon Cognito (Authentication)**: 
   - Create a Cognito User Pool for Admin users.
   - Update your React code to include a Login Screen for Admins using the `amazon-cognito-identity-js` library.
2. **API Gateway Authorizers**: 
   - Attach a Cognito Authorizer to your API Gateway.
   - This ensures that endpoints like `PATCH /tickets/{id}` will instantly reject requests unless the user provides a valid Admin JWT token from Cognito.
3. **AWS S3 (For Attachments)**: 
   - Currently, ticket images/videos are saved as Base64 strings. In production, upload these media files to a separate S3 Bucket (e.g., `gramconnect-media`), and only save the resulting S3 URL string in your DynamoDB database.

### Summary of Developer Action Items for AWS Migration
1. Set up the AWS services via the AWS Console or using **AWS CDK** (Cloud Development Kit) to automate the infrastructure setup.
2. Write the backend Node.js Lambda code.
3. Update `src/utils/api.ts` in your frontend code to use `fetch()` to call your new AWS API Gateway URL instead of writing to `localStorage`.

---

## Database Schema / Data Models

### Frontend TypeScript Model — `Ticket`

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
  userName: string;        // Submitter's full name
  phoneNumber: string;     // Submitter's phone number (used for chatbot lookup)
  adminNotes?: string;     // Optional notes added by admin
  attachment?: {           // Optional media evidence
    kind: 'image' | 'video';
    name: string;          // Original filename
    url: string;           // Base64 data URL (stored inline)
  };
}
```

---

## Project Folder Layout

```
GramConnect/
+-- index.html                    # HTML entry point
+-- package.json                  # Dependencies & scripts
+-- vite.config.ts                # Vite config (aliases, build, server)
+-- .npmrc                        # NPM registry config
+-- .gitignore
¦
+-- src/
¦   +-- main.tsx                  # React entry point
¦   +-- App.tsx                   # Root component (routing, state management)
¦   +-- index.css                 # Tailwind imports + global styles
¦   ¦
¦   +-- components/               # React UI components
¦   ¦   +-- Header.tsx            # App header with logo + toggle
¦   ¦   +-- TicketForm.tsx        # Public ticket submission form
¦   ¦   +-- TicketList.tsx        # Read-only list of submitted tickets
¦   ¦   +-- TicketCard.tsx        # Single ticket display card (user view)
¦   ¦   +-- AdminDashboard.tsx    # Admin management panel with stats
¦   ¦   +-- AdminTicketCard.tsx   # Ticket card with edit/delete controls
¦   ¦   +-- Chatbot.tsx           # Floating chatbot for ticket lookup
¦   ¦   +-- DebugPanel.tsx        # Developer debug utilities
¦   ¦   +-- figma/
¦   ¦   ¦   +-- ImageWithFallback.tsx
¦   ¦   +-- ui/                   # shadcn/ui component library
¦   ¦
¦   +-- types/
¦   ¦   +-- ticket.ts             # TypeScript type definitions
¦   ¦
¦   +-- utils/
¦   ¦   +-- api.ts                # Data access layer (localStorage CRUD logic)
¦   ¦
¦   +-- styles/
¦   ¦   +-- globals.css           # Design tokens, village theme, typography
```

---

## Key Architecture Patterns

1. **Zero-Configuration Local Mode**: The application leverages browser `localStorage` out-of-the-box, removing the need for a backend service during development or isolated local testing.

2. **Resolution Code Lock (Prototype)**: Resolving a ticket requires entering verification code `1234` — a demo mechanism simulating dual approval (worker + citizen) at the Panchayat level.

3. **Chatbot as Status Portal**: The chatbot allows citizens to look up their ticket by ID or phone number quickly without navigating through a complex dashboard.

4. **Media Handling**: Attachments (images/videos up to 8 MB) are converted to Base64 data URLs client-side and stored inline. (Note: For the AWS migration, these should be offloaded to S3).
