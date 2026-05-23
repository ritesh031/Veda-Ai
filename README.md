# VedaAI – AI Assessment Creator

A full-stack app where teachers create AI-generated question papers with real-time progress, structured sections, difficulty tags, and PDF export — built to match the provided Figma designs exactly.

---

## What It Looks Like

| Screen | Description |
|--------|-------------|
| **Assignments (Empty)** | Empty state with illustration and "Create Your First Assignment" button |
| **Assignments (List)** | Grid of assignment cards with 3-dot menu (View / Delete) |
| **Create Assignment** | File upload, due date, dynamic question type rows with +/− steppers |
| **Paper Output** | Real exam-paper layout: school header, sections, difficulty tags, marks, answer key |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, Zustand |
| Backend | Node.js, Express, TypeScript |
| Database | MongoDB (via Mongoose) |
| Cache + Queue | Redis + BullMQ |
| Real-time | WebSocket (ws library) |
| AI | Anthropic Claude (claude-sonnet) |
| PDF | PDFKit |

---

## Prerequisites — Install These First

### 1. Node.js
Download from https://nodejs.org — choose the **LTS** version (e.g. 20.x).

Verify: open your terminal and type:
```
node --version
```
You should see something like `v20.11.0`.

### 2. Docker Desktop
Docker runs MongoDB and Redis for you — you don't need to install them separately.

- **Windows / Mac**: https://www.docker.com/products/docker-desktop
- **Linux**: https://docs.docker.com/engine/install/

After installing, open Docker Desktop. You'll see a whale icon in your taskbar/menu bar. **Keep it running** while you work on this project.

Verify: in your terminal:
```
docker --version
```
You should see something like `Docker version 25.0.0`.

### 3. Anthropic API Key
This is what powers the AI question generation.

1. Go to https://console.anthropic.com
2. Sign up / log in
3. Go to **Settings → API Keys**
4. Click **Create Key**, copy it somewhere safe
5. It looks like: `sk-ant-api03-xxxxxxxxxxxx`

---

## Step-by-Step Setup

### Step 1 — Download and unzip the project

Unzip `vedaai.zip`. You'll get a folder called `vedaai`. Open your terminal and navigate into it:

```bash
cd vedaai
```

### Step 2 — Start MongoDB and Redis with Docker

Make sure Docker Desktop is open and running, then:

```bash
docker-compose up -d
```

**What this does:** Downloads and starts two services in the background:
- **MongoDB** — the database that stores your assignments
- **Redis** — a fast cache that also manages background job queues

The `-d` flag means "detached" (runs in background, not blocking your terminal).

**First run** will download the images (~200 MB), subsequent starts are instant.

Verify they're running:
```bash
docker ps
```
You should see two containers listed: `vedaai-mongo` and `vedaai-redis`.

To stop them later:
```bash
docker-compose down
```

---

### Step 3 — Set up the Backend

Open a terminal in the `vedaai` folder:

```bash
cd backend
```

#### 3a. Install packages
```bash
npm install
```
This downloads all the code libraries the backend needs (takes ~1 min first time).

#### 3b. Create the environment file

The backend needs secret keys and configuration. We store these in a `.env` file:

```bash
# On Mac/Linux:
cp .env.example .env

# On Windows Command Prompt:
copy .env.example .env

# On Windows PowerShell:
Copy-Item .env.example .env
```

Now open the `.env` file in any text editor (Notepad, VS Code, etc.) and paste your Anthropic API key:

```
PORT=4000
MONGODB_URL=mongodb://localhost:27017/vedaai
REDIS_URL=redis://localhost:6379
ANTHROPIC_API_KEY=sk-ant-api03-YOUR-KEY-HERE
FRONTEND_URL=http://localhost:3000
```

Save the file.

#### 3c. Start the API server

**Open a new terminal window**, navigate to the backend folder, and run:

```bash
cd vedaai/backend
npm run dev
```

You should see:
```
[Server] MongoDB connected
[Server] Subscribed to ws-notify
[Server] Running on http://localhost:4000
```

**Keep this terminal open.**

#### 3d. Start the Worker

**Open another new terminal window** (you now need 3 terminals total):

```bash
cd vedaai/backend
npm run dev:worker
```

You should see:
```
[Worker] MongoDB connected
[Worker] Ready — waiting for jobs...
```

**Keep this terminal open too.**

> ⚠️ **Why two processes?** The API server handles web requests. The Worker handles the slow AI generation in the background. They talk to each other through Redis. Both must be running.

---

### Step 4 — Set up the Frontend

**Open a fourth terminal window**:

```bash
cd vedaai/frontend
```

#### 4a. Install packages
```bash
npm install
```

#### 4b. Create the environment file
```bash
# Mac/Linux:
cp .env.example .env.local

# Windows CMD:
copy .env.example .env.local

# Windows PowerShell:
Copy-Item .env.example .env.local
```

The defaults in `.env.local` work fine for local development — no changes needed.

#### 4c. Start the frontend
```bash
npm run dev
```

You should see:
```
▲ Next.js 14.2.0
- Local: http://localhost:3000
```

---

### Step 5 — Open the App

Go to **http://localhost:3000** in your browser.

You should see the VedaAI app with the sidebar.

---

## Using the App

### Creating an Assignment

1. Click **Create Assignment** in the sidebar or the empty state button
2. **Upload a file** (optional) — PDF or image of your syllabus/notes
3. Enter the **subject** (e.g. "Physics", "English")
4. Pick a **due date**
5. Configure **question types** — use the + / − buttons to set the count and marks per question
6. Add any **additional instructions** (e.g. "Focus on chapter 3, make it 45 minutes")
7. Click **Next →** then **Generate Paper →**

### Watching Generation

You'll see a real-time progress bar with steps:
- Received → Building prompt → AI generating → Formatting → Done

This takes **15–40 seconds** depending on the number of questions.

### Viewing the Paper

The output looks like a real printed exam paper with:
- School name, subject, class
- Time allowed and maximum marks
- Student info lines (Name, Roll Number, Section)
- Questions grouped into sections (Section A, B, etc.)
- Difficulty tags: [Easy], [Moderate], [Challenging]
- Marks per question
- Answer key at the bottom

### Downloading PDF

Click **Download as PDF** in the dark bar at the top of the paper.

### Regenerating

Click **Regenerate** to generate a fresh set of questions with the same settings.

### Deleting an Assignment

On the assignments list, click the **⋮** (three dots) on any card → **Delete**.

---

## Troubleshooting

### "Cannot connect to MongoDB"
→ Docker is not running. Open Docker Desktop, wait for it to start, then run `docker-compose up -d` again.

### Paper stays at "Pending" forever
→ The Worker is not running. Open a new terminal, go to `vedaai/backend`, and run `npm run dev:worker`.

### "ANTHROPIC_API_KEY" error in worker logs
→ Check your `backend/.env` file. Make sure the key starts with `sk-ant-` and has no extra spaces.

### Port 3000 already in use
→ Change the frontend port: `npm run dev -- --port 3001`, then open http://localhost:3001.

### Port 4000 already in use
→ Change `PORT=4001` in `backend/.env`, and update `NEXT_PUBLIC_API_URL=http://localhost:4001` in `frontend/.env.local`.

### npm install fails
→ Make sure Node.js version is 18 or higher: `node --version`.

### docker-compose command not found
→ Docker Desktop may not be installed. Download it from https://www.docker.com/products/docker-desktop.

---

## Project Structure

```
vedaai/
├── docker-compose.yml         ← Starts MongoDB + Redis
│
├── backend/
│   ├── .env.example           ← Copy this to .env
│   ├── src/
│   │   ├── index.ts           ← Express API server
│   │   ├── worker.ts          ← BullMQ background worker
│   │   ├── models/
│   │   │   └── Assignment.ts  ← MongoDB schema
│   │   ├── routes/
│   │   │   └── assignments.ts ← All API endpoints
│   │   └── lib/
│   │       ├── ai.ts          ← Claude prompt + parser
│   │       ├── queue.ts       ← Redis + BullMQ setup
│   │       └── websocket.ts   ← WS server
│
└── frontend/
    ├── .env.example           ← Copy this to .env.local
    └── src/
        ├── app/
        │   ├── assignments/   ← List page + detail page
        │   └── create/        ← Create form
        ├── components/
        │   ├── Sidebar.tsx    ← Left navigation
        │   └── Header.tsx     ← Top bar
        ├── store/index.ts     ← Zustand global state
        └── hooks/useWebSocket.ts ← Real-time hook
```

---

## How It Works (Architecture)

```
Browser                    Backend                   Worker
  │                          │                          │
  │── POST /assignments ─────►│                          │
  │                          │── Add job to BullMQ ──────►│
  │◄── { assignmentId } ─────│                          │
  │                          │                          │
  │── WS subscribe ──────────►│                          │
  │                          │                          │
  │                          │◄── Redis pub/sub ─────────│ (progress 30%)
  │◄── WS: progress 30% ─────│                          │
  │                          │                          │
  │                          │◄── Redis pub/sub ─────────│ (paper ready)
  │◄── WS: completed + paper ─│                          │
```

The worker calls Claude API, validates the JSON response, and stores it in MongoDB. The browser gets live updates via WebSocket — no polling needed.

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/assignments` | Create + enqueue generation |
| GET | `/api/assignments` | List all |
| GET | `/api/assignments/:id` | Get one (with paper if done) |
| GET | `/api/assignments/:id/paper` | Get generated paper |
| POST | `/api/assignments/:id/regenerate` | Re-generate |
| DELETE | `/api/assignments/:id` | Delete |
| GET | `/api/assignments/:id/pdf` | Download PDF |
| GET | `/api/health` | Health check |

---

## Summary of Terminals You Need Open

| Terminal | Command | Purpose |
|----------|---------|---------|
| 1 | `docker-compose up -d` (once) | Starts DB + Redis |
| 2 | `cd backend && npm run dev` | API server |
| 3 | `cd backend && npm run dev:worker` | AI worker |
| 4 | `cd frontend && npm run dev` | Frontend |
