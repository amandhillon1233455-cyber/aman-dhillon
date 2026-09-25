# PrintAI Dashboard — Smart Printing Management Powered by AI

A modern, full-stack enterprise web application designed to monitor and manage printing operations, automate print queues, track usage analytics, and resolve hardware issues through Gemini AI assistance.

---

## 🌟 Key Features

- **Fleet Printer Monitoring**: Real-time status detection (`Online`, `Offline`, `Printing`, `Error`, `Maintenance`), IP resolution, toner cartridge levels, and paper tray capacity gauges.
- **Print Job Queue Management**: Full spooler lifecycle tracking (`Queued`, `Printing`, `Completed`, `Failed`, `Cancelled`), copies, color vs monochrome distribution, and operator cancellations.
- **AI Hardware Troubleshooting ("Explain with AI")**: Powered by **Google Gemini 3.8 Flash**. Generates technical root-cause explanations, probable physical failures, actionable step-by-step checklists, and technician dispatch guidelines.
- **AI Fleet Executive Summaries**: Generates high-level operational intelligence synthesizing throughput, error frequencies, and consumable optimization.
- **Grounded AI Operations Chatbot**: Dedicated conversational interface with live MongoDB context—strictly answers based on true fleet telemetry without inventing printer data.
- **Document Repository**: Upload and store PDFs, Word documents, images, and text files with preview areas and 1-click print job dispatch.
- **Analytics & History**: Interactive charts tracking daily/weekly/monthly print trends, printer utilization, and detailed activity logs.
- **Enterprise Authentication & Roles**: JSON Web Token (JWT) sessions, bcrypt password cryptography, and role-based access control (`admin` vs `user`).

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons
- **Backend**: Node.js, Express.js REST API, Multer file upload pipeline, JWT, bcryptjs
- **Database**: MongoDB / Mongoose schema models with an automatic persistent embedded document engine for instant zero-config evaluation
- **AI Engine**: Google `@google/genai` TypeScript SDK utilizing `gemini-3.8-flash` on server-side proxy routes

---

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Set the required parameters:

```env
# Optional: MongoDB Atlas URI (if left blank, the app uses its embedded persistent engine)
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/printai?retryWrites=true&w=majority

# JWT secret key
JWT_SECRET=printai-super-secret-key-2026

# Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Server Port
PORT=3000
```

### 3. Run the Database Seed Script (Optional)

Populate the database with realistic sample printers, active print jobs, and activity logs:

```bash
npm run seed
```

### 4. Start Development Server

Starts both the Express REST API backend and the Vite frontend middleware on port 3000:

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Demo Accounts

For instant evaluation without manual registration, use the pre-configured accounts or click the **One-Click Demo Access** buttons on the Login page:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **System Administrator** | `admin@printai.io` | `admin123` | Full access, printer enrollment, queue override, seed reset |
| **Staff Operator** | `sarah@printai.io` | `user123` | Document upload, job dispatch, troubleshooting |

---

## 📦 Production Build & Deployment

### Build Frontend Static Bundle

```bash
npm run build
```

This compiles your optimized client assets into `dist/`.

### Start Production Server

```bash
npm start
```

### Deploying Frontend to Vercel

1. Push this repository to GitHub.
2. Import the project into your Vercel Dashboard.
3. Configure the build settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Set environment variables (`VITE_API_URL` pointing to your deployed backend URL).

### Deploying Backend to Cloud Run, Render, or Railway

1. Add environment variables in your hosting provider's secrets panel:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: A secure random cryptographic string
   - `GEMINI_API_KEY`: Your Google Gemini API Key
   - `PORT`: `3000` (or host-assigned port)
2. Start command:
   ```bash
   node server.ts
   ```

---

## 📡 REST API Reference

### Authentication
- `POST /api/auth/register` — Register a new operator account
- `POST /api/auth/login` — Sign in and receive JWT bearer token
- `GET /api/auth/me` — Retrieve active operator profile

### Printers
- `GET /api/printers` — Retrieve printer list with status and search filters
- `POST /api/printers` — Enroll a new network printer
- `GET /api/printers/:id` — Inspect printer details
- `PUT /api/printers/:id` — Update printer parameters
- `PATCH /api/printers/:id/status` — Update status or trigger hardware alarm
- `DELETE /api/printers/:id` — Delete printer

### Print Jobs
- `GET /api/jobs` — Retrieve print queue with filters (status, printer, search)
- `POST /api/jobs` — Dispatch a new print job
- `PATCH /api/jobs/:id/status` — Transition job state (`Completed`, `Failed`, `Cancelled`)
- `DELETE /api/jobs/:id` — Delete print job record

### Documents
- `GET /api/documents` — List repository documents
- `POST /api/documents` — Multipart file upload with page calculation
- `DELETE /api/documents/:id` — Delete document file

### Analytics & AI
- `GET /api/analytics/overview` — Top-level metrics (printers, uptime, volume)
- `GET /api/analytics/printing` — Time-series print activity (7D / 30D)
- `GET /api/analytics/printers` — Capacity and utilization per hardware node
- `POST /api/ai/chat` — Grounded conversational AI assistant with live database context
- `POST /api/ai/troubleshoot` — Step-by-step diagnostic breakdown for printer errors
- `POST /api/ai/summary` — Executive briefing of fleet operations
- `POST /api/simulate/job-progress` — Advance active print spooler queue
