# WellMind Troubleshooting Guide

## Common Beginner Mistakes & Fixes

---

### ❌ "npm: command not found" or "node: command not found"

**Cause:** Node.js isn't installed or not in your PATH.

**Fix:**
1. Go to https://nodejs.org and install the LTS version
2. Restart your terminal after installing
3. Try `node --version` again

---

### ❌ "python: command not found" (Windows)

**Cause:** Python wasn't added to PATH during installation.

**Fix:**
1. Uninstall Python
2. Reinstall from python.org
3. On the first installer screen, check **"Add Python to PATH"** ✅
4. Restart terminal

---

### ❌ "ModuleNotFoundError" in Python

**Cause:** Virtual environment not activated or packages not installed.

**Fix:**
```bash
# Make sure you're in the backend folder
cd wellmind/backend

# Activate the virtual environment
source venv/bin/activate  # Mac/Linux
venv\Scripts\activate     # Windows

# Reinstall packages
pip install -r requirements.txt
```

**How to tell if venv is active:** You'll see `(venv)` at the start of your terminal line.

---

### ❌ "Cannot connect to database" / "Connection refused"

**Cause:** PostgreSQL isn't running, or wrong credentials.

**Fix:**
1. Start PostgreSQL:
   - Mac: `brew services start postgresql` or open pgAdmin
   - Windows: Open Services → Find PostgreSQL → Start
2. Verify your `DATABASE_URL` in `backend/.env`:
   ```
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/wellmind
   ```
3. Make sure the `wellmind` database exists (run `CREATE DATABASE wellmind;` in psql)

---

### ❌ "OPENAI_API_KEY is not set" or OpenAI errors

**Cause:** API key not configured.

**Fix:**
1. Copy `backend/.env.example` to `backend/.env`
2. Add your OpenAI key: `OPENAI_API_KEY=sk-...`
3. Restart the backend server (`Ctrl+C` then `uvicorn main:app --reload`)

**Note:** OpenAI API requires a paid account with billing set up.

---

### ❌ Frontend shows blank white page

**Cause:** Missing environment variables or backend not running.

**Fix:**
1. Make sure `frontend/.env.local` exists with Clerk keys
2. Make sure backend is running on port 8000
3. Open browser DevTools (F12) → Console tab → look for red errors
4. Open DevTools → Network tab → look for failed API calls

---

### ❌ "Port 3000 already in use" or "Port 8000 already in use"

**Fix:**
```bash
# Mac/Linux — kill process on port 3000:
lsof -ti:3000 | xargs kill -9

# Mac/Linux — kill process on port 8000:
lsof -ti:8000 | xargs kill -9

# Windows — find what's using port 8000:
netstat -ano | findstr :8000
# Then kill it (replace PID with the number from above):
taskkill /PID 12345 /F
```

---

### ❌ Clerk auth not working / "Invalid session token"

**Cause:** Missing or wrong Clerk keys.

**Fix:**
1. Go to https://clerk.com → Your app → API Keys
2. Copy the **Publishable Key** and **Secret Key**
3. Add to `frontend/.env.local`:
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   ```
4. Add to `backend/.env`:
   ```
   CLERK_SECRET_KEY=sk_test_...
   ```
5. Restart both frontend and backend

---

### ❌ "Failed to fetch" / CORS errors in browser

**Cause:** Backend isn't running, or CORS not configured.

**Fix:**
1. Make sure backend is running: `uvicorn main:app --reload --port 8000`
2. Check `backend/.env` has: `ALLOWED_ORIGINS=http://localhost:3000`
3. Verify `NEXT_PUBLIC_API_URL=http://localhost:8000` in `frontend/.env.local`

---

### ❌ Git push rejected

**Cause:** Remote has changes you don't have locally.

**Fix:**
```bash
git pull origin main --rebase
git push origin main
```

---

### ❌ "fatal: not a git repository"

**Cause:** Git hasn't been initialized in this folder.

**Fix:**
```bash
# Make sure you're in the wellmind root folder
cd wellmind
git init
git add .
git commit -m "Initial commit"
```

---

### ❌ Changes not showing in browser

**Fix:**
1. Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. Make sure `npm run dev` is still running
3. Check terminal for any compilation errors

---

## Getting Help

1. Read the error message carefully — it usually tells you exactly what's wrong
2. Copy the error into Google — someone has almost certainly had the same issue
3. Check the official docs:
   - Next.js: https://nextjs.org/docs
   - FastAPI: https://fastapi.tiangolo.com
   - Clerk: https://clerk.com/docs
   - OpenAI: https://platform.openai.com/docs
