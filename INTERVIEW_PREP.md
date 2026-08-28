# GramConnect: Full-Stack Interview Preparation Guide

This document contains everything you need to confidently explain, defend, and discuss your GramConnect project in a technical interview.

---

## 1. The Opening Pitch (Tell me about your project)

**Question:** "Walk me through your GramConnect project."

**Your Answer:**
"GramConnect is a civic-tech governance platform I built to solve a very specific problem in rural and semi-urban India: the lack of an efficient, transparent way to file and track local government complaints. The major issue with existing systems is 'fake-resolution fraud' — where officials just mark complaints as resolved on paper without fixing the actual issue.

To solve this, I built a full-stack platform using React, Node.js, Express, and MySQL. 
First, for accessibility, citizens can submit geo-tagged complaints with multilingual voice notes using the browser's native MediaRecorder API — this caters to low-literacy or low-connectivity users.
Second, for accountability, I built a 'Satisfaction Lock'. When an admin tries to resolve a ticket, the backend generates an OTP and sends it to the citizen. The admin MUST enter this OTP to close the ticket. 
I also built an Automatic Escalation Matrix using a Node cron job that auto-routes tickets to state authorities if they aren't resolved in 7 days, and plotted all this on an interactive Leaflet heat map for administrators."

---

## 2. Architecture & Design Choices

**Question:** "Why did you choose React, Express, and MySQL? Why not MongoDB?"

**Your Answer:**
"I went with a standard 3-tier architecture (React, Express, MySQL) because the data for a ticketing system is highly relational. 
A `Ticket` has a strict schema (status, category, priority) and maps clearly to foreign keys like `VoiceNotes` and `OTPs`. Since we need ACID compliance — especially around the OTP generation and ticket resolution flow — MySQL with Sequelize as the ORM was the safest and most structured choice. I chose React and Tailwind for the frontend for fast development and complex state management on the Admin Dashboard, and Express for its lightweight REST API capabilities."

**Follow-up:** "How is your project structured for the cloud?"
**Your Answer:** "It's designed for AWS. The React frontend is a static bundle that belongs on S3 served by CloudFront. The Express API runs on EC2 (or Elastic Beanstalk), and the MySQL database sits on RDS. They communicate via stateless REST APIs."

---

## 3. Deep Dive: Satisfaction Lock (OTP System)

**Question:** "How exactly does the Satisfaction Lock (OTP) work technically?"

**Your Answer:**
"When an admin clicks 'Resolve' on the frontend, it doesn't change the status immediately. 
1. The React app makes a `POST /api/tickets/:id/generate-otp` call to Express.
2. The backend generates a random 6-digit number, creates a record in the `OTPs` MySQL table with a `TicketId` foreign key and an `expiresAt` timestamp set to 10 minutes from now.
3. It triggers a simulated SMS to the citizen's phone number.
4. The admin gets the OTP from the citizen, and enters it in a modal. 
5. The frontend makes a `PUT /api/tickets/:id/resolve` call with the OTP.
6. The backend queries the `OTPs` table. If the code matches AND the current time is before `expiresAt`, the transaction succeeds, the ticket status updates to `resolved`, and the OTP is invalidated."

**Follow-up:** "What happens if the OTP expires or the admin guesses it?"
**Your Answer:** "If the current server time exceeds the `expiresAt` timestamp, the backend rejects it with a 400 error. Because it's a 6-digit code (1 million combinations) expiring in 10 minutes, brute-forcing is practically impossible if we add rate limiting to the route."

---

## 4. Deep Dive: Geo-Tagging & Heat Maps

**Question:** "How did you implement the real-time heat maps?"

**Your Answer:**
"On the citizen side, I used the browser's HTML5 `navigator.geolocation` API to capture real-time GPS coordinates. I also used the OpenStreetMap Nominatim API for reverse geocoding to automatically fill in a human-readable address for them. 
These `lat` and `lng` floats are saved to the MySQL `Tickets` table. 
On the Admin Dashboard, I used `react-leaflet`. I fetch all tickets from the backend and map over them, rendering a `CircleMarker` for each coordinate. I color-coded them based on the ticket status — orange for pending, blue for in-progress, and green for resolved. This gives admins a visual density map of civic issues."

---

## 5. Deep Dive: Voice Notes & File Uploads

**Question:** "How do you handle the multilingual voice notes?"

**Your Answer:**
"I didn't want to rely on external translation APIs because it's expensive and often fails with rural dialects. Instead, I let citizens record raw audio.
On the frontend, I used the `MediaRecorder` API to capture the microphone stream into chunks and create a `.webm` Blob. 
When submitting, I append this Blob to a `FormData` object. I couldn't use standard JSON because of the binary file.
On the backend, I used `multer` middleware to intercept the `multipart/form-data` request, save the `.webm` file to a local `server/uploads/` directory, and save the file path to the MySQL database."

**Follow-up:** "How would you scale file uploads in production?"
**Your Answer:** "Instead of saving to the local disk using multer, I would use `multer-s3` to stream the audio file directly to an AWS S3 bucket, and store the S3 URL in the database instead of a local file path."

---

## 6. Deep Dive: Automatic Escalation Matrix

**Question:** "How does the auto-escalation work without user intervention?"

**Your Answer:**
"I used a package called `node-cron`. In my main `server.js` file, I set up a cron job with the expression `0 0 * * *` so it runs every midnight.
The script executes a Sequelize query that looks for all tickets where `status` is NOT 'resolved' and `createdAt` is older than 7 days. For those tickets, it updates the `escalation_level` column from `VILLAGE_PANCHAYAT` to `STATE_AUTHORITY`. Because it runs inside the Node process, it doesn't require any external triggers."

**Follow-up:** "What if the Node server crashes right at midnight?"
**Your Answer:** "That is the main drawback of running cron jobs inside the application server. In a true enterprise production environment, I would decouple this by moving the logic to an AWS Lambda function triggered by Amazon EventBridge (CloudWatch Events), ensuring high availability."

---

## 7. Common Behavioral / Problem-Solving Questions

**Question:** "What was the hardest bug you faced while building this?"
**Your Answer:** 
"Handling the Voice Note upload was tricky. Initially, I was trying to send the form data as a standard JSON payload via Axios. The text data would go through, but the audio blob would corrupt or drop entirely. I realized JSON can't serialize binary data easily. I had to refactor the API call to construct a native `FormData` object, append the file with a specific filename, and change the backend to use `multer` to parse `multipart/form-data`. It taught me a lot about HTTP protocols."

**Question:** "If you had 1 more month to work on this, what would you add?"
**Your Answer:** 
"I would implement Twilio to send the OTP via actual SMS instead of simulating it. I would also move the voice notes and images from local disk storage to an AWS S3 bucket to make the backend completely stateless, allowing it to scale horizontally behind a load balancer."

**Question:** "How do you handle security for the admin dashboard?"
**Your Answer:**
"Currently, it's a prototype assuming administrative access. For production, I would implement JWT (JSON Web Tokens). When an admin logs in, the Express backend would sign a JWT with a secret key and send it to the frontend. The frontend would attach this token in the `Authorization: Bearer` header for all protected API routes, and an Express middleware would verify it before returning ticket data or allowing status updates."
