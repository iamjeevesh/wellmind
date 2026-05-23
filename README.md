# 🌿 WellMind — Student Wellness & Burnout Support App

> A calming, AI-powered wellness companion for students managing stress, burnout, and academic pressure.

**IMPORTANT DISCLAIMER:** This application is a wellness and productivity support tool — it is NOT a replacement for licensed medical or psychological care.

---

## 📋 Table of Contents

1. [What You'll Build](#what-youll-build)
2. [Software You Need to Install](#software-you-need-to-install)
3. [Project Setup (Step by Step)](#project-setup)
4. [Environment Variables](#environment-variables)
5. [Running the App](#running-the-app)
6. [Git & GitHub Setup](#git--github-setup)
7. [Deployment](#deployment)
8. [Troubleshooting](#troubleshooting)

---

## 🌟 What You'll Build

| Feature | Description |
|---|---|
| 🔐 Authentication | Sign up/login via Clerk |
| 📊 Dashboard | Mood/stress trends with charts |
| 🤖 AI Chat | Emotionally supportive AI assistant |
| 📝 Daily Check-in | Mood + stress score entry |
| 📔 Journaling | Private journal with AI insights |
| 🔥 Burnout Score | Auto-calculated from your data |
| 🍅 Pomodoro Timer | Focus session tracking |
| 💡 Insights | Personalized wellness recommendations |

---

## 💻 Software You Need to Install

### Step 1 — Install Node.js
Node.js lets you run JavaScript on your computer.

1. Go to: https://nodejs.org
2. Download the **LTS** version (recommended for most users)
3. Run the installer — click Next → Next → Install
4. To verify it worked, open your Terminal (Mac) or Command Prompt (Windows) and type:
```bash
node --version
# Should print something like: v20.11.0

npm --version
# Should print something like: 10.2.4
```

### Step 2 — Install Python
Python powers the backend (FastAPI).

1. Go to: https://python.org/downloads
2. Download Python **3.11** or newer
3. ⚠️ IMPORTANT (Windows): Check the box **"Add Python to PATH"** during install
4. Verify:
```bash
python --version
# Should print: Python 3.11.x

pip --version
# Should print: pip 23.x
```

### Step 3 — Install PostgreSQL
PostgreSQL is the database.

1. Go to: https://postgresql.org/download
2. Download for your OS and install
3. During install, set a password for the `postgres` user — **write it down!**
4. Default port is **5432** — keep it as is
5. After install, open **pgAdmin** (installed with PostgreSQL) to manage the database visually

### Step 4 — Install VS Code
Your code editor.

1. Go to: https://code.visualstudio.com
2. Download and install
3. Open VS Code and install these extensions (click the Extensions icon on left sidebar):
   - **ESLint** — code quality
   - **Prettier** — auto-formatting
   - **Python** — Python support
   - **Tailwind CSS IntelliSense** — CSS autocomplete
   - **GitLens** — Git superpowers

### Step 5 — Install Git
Git tracks your code changes.

1. Go to: https://git-scm.com/downloads
2. Download and install (keep all defaults)
3. Verify:
```bash
git --version
# Should print: git version 2.x.x
```

---

## 🚀 Project Setup

### Step 1 — Download This Project

Open your Terminal (Mac/Linux) or Command Prompt (Windows) and run:

```bash
# Navigate to where you want the project (e.g., your Desktop)
cd Desktop

# If you downloaded as ZIP, unzip it and cd into it:
cd wellmind

# OR if cloning from GitHub:
git clone https://github.com/YOUR_USERNAME/wellmind.git
cd wellmind
```

> 💡 **What is `cd`?** It stands for "change directory" — it moves you into a folder.

### Step 2 — Open in VS Code

```bash
# While inside the wellmind folder:
code .
```

> This opens the entire project in VS Code. The `.` means "current folder".

### Step 3 — Set Up the Database

Open pgAdmin (installed with PostgreSQL), then:

1. Right-click **Databases** → **Create** → **Database**
2. Name it: `wellmind`
3. Click **Save**

OR use the terminal:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create the database
CREATE DATABASE wellmind;

# Exit
\q
```

### Step 4 — Set Up the Backend

Open a terminal **inside VS Code** (Menu → Terminal → New Terminal):

```bash
# Navigate to the backend folder
cd backend

# Create a virtual environment (isolates Python packages for this project)
python -m venv venv

# Activate the virtual environment:
# On Mac/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# You should see (venv) appear at the start of your terminal line ✓

# Install all required packages
pip install -r requirements.txt

# Run database migrations (creates all tables)
python -m database.init_db

# Start the backend server
uvicorn main:app --reload --port 8000
```

> 💡 `--reload` means the server restarts automatically when you save changes.

You should see: `Uvicorn running on http://127.0.0.1:8000` ✓

### Step 5 — Set Up the Frontend

Open a **second terminal** in VS Code (click the `+` icon in the terminal panel):

```bash
# Navigate to the frontend folder
cd frontend

# Install all JavaScript packages (this may take 1-2 minutes)
npm install

# Start the frontend development server
npm run dev
```

You should see: `Local: http://localhost:3000` ✓

Open your browser and go to: **http://localhost:3000** 🎉

---

## 🔑 Environment Variables

Environment variables store secret keys — **never share these publicly or commit them to Git!**

### Backend `.env` Setup

```bash
# In the backend folder, copy the example file:
cp .env.example .env

# Then open .env in VS Code and fill in your values
```

```env
# backend/.env

# Database
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/wellmind

# OpenAI (get from https://platform.openai.com/api-keys)
OPENAI_API_KEY=sk-...

# Security
SECRET_KEY=your-very-long-random-secret-key-here-make-it-256-bits
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Clerk (get from https://clerk.com)
CLERK_SECRET_KEY=sk_test_...

# App
ENVIRONMENT=development
ALLOWED_ORIGINS=http://localhost:3000
```

### Frontend `.env.local` Setup

```bash
# In the frontend folder:
cp .env.example .env.local
```

```env
# frontend/.env.local

NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

### How to Get API Keys

**OpenAI API Key:**
1. Go to https://platform.openai.com
2. Create an account and add billing
3. Go to API Keys → Create new secret key
4. Copy and paste into `.env`

**Clerk Keys:**
1. Go to https://clerk.com
2. Create a free account
3. Create a new application named "WellMind"
4. In the dashboard, copy **Publishable Key** and **Secret Key**

---

## 🎮 Running the App

Every time you want to work on the project:

```bash
# Terminal 1 — Backend
cd wellmind/backend
source venv/bin/activate  # Mac/Linux
# OR: venv\Scripts\activate  # Windows
uvicorn main:app --reload --port 8000

# Terminal 2 — Frontend
cd wellmind/frontend
npm run dev
```

Then open: http://localhost:3000

---

## 📦 Git & GitHub Setup

### Step 1 — Configure Git (one time only)

```bash
git config --global user.name "Your Name"
git config --global user.email "your@email.com"
```

### Step 2 — Create a GitHub Repository

1. Go to https://github.com and log in
2. Click the **+** button → **New repository**
3. Name it: `wellmind`
4. Set to **Private** (recommended — keeps your API keys safer)
5. Do NOT check "Initialize with README" (we already have one)
6. Click **Create repository**

### Step 3 — Initialize Git Locally

```bash
# Make sure you're in the root wellmind folder
cd wellmind

# Initialize git
git init

# Add all files
git add .

# Make your first commit
git commit -m "Initial commit: WellMind project setup"
```

### Step 4 — Connect to GitHub

Copy the commands GitHub shows you after creating the repo, they look like:

```bash
git remote add origin https://github.com/YOUR_USERNAME/wellmind.git
git branch -M main
git push -u origin main
```

### Step 5 — Future Commits

Every time you make changes and want to save them to GitHub:

```bash
# See what files changed
git status

# Add all changed files
git add .

# Write a descriptive message about what you changed
git commit -m "Add mood check-in feature"

# Push to GitHub
git push
```

> 💡 **Good commit messages** describe WHAT changed and WHY. Bad: "fix stuff". Good: "Fix mood chart not updating after check-in"

---

## 🚀 Deployment

### Deploy Backend — Render.com (Free)

1. Go to https://render.com and sign up
2. Click **New** → **Web Service**
3. Connect your GitHub and select the `wellmind` repo
4. Settings:
   - **Root Directory:** `backend`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add your environment variables in the **Environment** tab
6. Click **Create Web Service**

### Deploy Database — Neon.tech (Free PostgreSQL)

1. Go to https://neon.tech
2. Create a free account and a new project
3. Copy the **Connection String** (starts with `postgresql://`)
4. Update `DATABASE_URL` in your Render environment variables

### Deploy Frontend — Vercel (Free)

1. Go to https://vercel.com and sign up with GitHub
2. Click **New Project** → import your `wellmind` repo
3. Set **Root Directory** to `frontend`
4. Add environment variables (copy from `.env.local`)
5. Update `NEXT_PUBLIC_API_URL` to your Render backend URL
6. Click **Deploy**

---

## 🔧 Troubleshooting

### "npm: command not found"
→ Node.js isn't installed or not in PATH. Reinstall Node.js.

### "python: command not found" (Windows)
→ Python wasn't added to PATH. Reinstall Python and check "Add to PATH".

### "Cannot connect to database"
→ Check that PostgreSQL is running and your `DATABASE_URL` password is correct.

### "OPENAI_API_KEY is not set"
→ Make sure your `.env` file exists and has the correct key. Restart the server after editing `.env`.

### Frontend shows blank page
→ Check that the backend is running on port 8000. Check browser console for errors (F12).

### "Module not found" in Python
→ Make sure your virtual environment is activated (`source venv/bin/activate`).

### Port already in use
```bash
# Find and kill the process using port 8000
# Mac/Linux:
lsof -ti:8000 | xargs kill -9
# Windows:
netstat -ano | findstr :8000
taskkill /PID <PID_NUMBER> /F
```

---

## 📁 Project Structure

```
wellmind/
├── frontend/                 # Next.js app
│   ├── app/                  # Pages (Next.js App Router)
│   │   ├── dashboard/        # Main dashboard
│   │   ├── chat/             # AI chat assistant
│   │   ├── journal/          # Journaling feature
│   │   ├── checkin/          # Daily mood check-in
│   │   └── insights/         # Wellness insights
│   ├── components/           # Reusable React components
│   ├── lib/                  # Utility functions
│   ├── hooks/                # Custom React hooks
│   └── types/                # TypeScript types
│
├── backend/                  # FastAPI app
│   ├── routes/               # API endpoints
│   ├── services/             # Business logic
│   ├── models/               # Database models
│   ├── ai/                   # AI/OpenAI integration
│   ├── middleware/           # Auth, CORS, logging
│   └── database/             # DB connection & migrations
│
├── docs/                     # Additional documentation
└── README.md                 # This file
```
