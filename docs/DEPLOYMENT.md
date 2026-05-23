# WellMind Deployment Guide

## Overview

This guide walks you through deploying WellMind to production for free using:
- **Frontend** → Vercel
- **Backend** → Render
- **Database** → Neon (serverless PostgreSQL)

---

## Step 1: Set Up Production Database (Neon)

1. Go to https://neon.tech and sign up for free
2. Click **New Project**
3. Name it `wellmind-prod`
4. Select a region close to your users
5. Click **Create Project**
6. Copy the **Connection String** — it looks like:
   ```
   postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
7. Save this — you'll need it for the backend

---

## Step 2: Deploy Backend (Render)

1. Push your code to GitHub (see README for instructions)
2. Go to https://render.com and sign up
3. Click **New** → **Web Service**
4. Connect GitHub and select your `wellmind` repository
5. Configure:
   - **Name:** `wellmind-backend`
   - **Root Directory:** `backend`
   - **Environment:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt && python -m database.init_db`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Add Environment Variables (click "Advanced" → "Add Environment Variable"):
   ```
   DATABASE_URL = postgresql://... (your Neon connection string)
   OPENAI_API_KEY = sk-...
   SECRET_KEY = (long random string — generate at: https://generate-secret.vercel.app/32)
   ALGORITHM = HS256
   ACCESS_TOKEN_EXPIRE_MINUTES = 10080
   CLERK_SECRET_KEY = sk_live_...
   ENVIRONMENT = production
   ALLOWED_ORIGINS = https://your-frontend-url.vercel.app
   ```
7. Click **Create Web Service**
8. Wait 2-5 minutes for the first deploy
9. Copy your Render URL: `https://wellmind-backend.onrender.com`

---

## Step 3: Deploy Frontend (Vercel)

1. Go to https://vercel.com and sign up with GitHub
2. Click **New Project** → Import your `wellmind` repo
3. Configure:
   - **Framework Preset:** Next.js
   - **Root Directory:** `frontend`
4. Add Environment Variables:
   ```
   NEXT_PUBLIC_API_URL = https://wellmind-backend.onrender.com
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = pk_live_...
   CLERK_SECRET_KEY = sk_live_...
   NEXT_PUBLIC_CLERK_SIGN_IN_URL = /sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL = /sign-up
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL = /dashboard
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL = /dashboard
   ```
5. Click **Deploy**
6. Your app will be live at `https://wellmind-xxx.vercel.app`

---

## Step 4: Update Clerk Settings

1. Go to your Clerk dashboard → **Domains**
2. Add your Vercel URL as a production domain
3. Update allowed redirect URLs

---

## Step 5: Update Backend CORS

1. Go to Render dashboard → your backend service → **Environment**
2. Update `ALLOWED_ORIGINS` to your actual Vercel URL:
   ```
   ALLOWED_ORIGINS = https://wellmind-xxx.vercel.app
   ```
3. Render will auto-redeploy

---

## Troubleshooting Deployment

### Backend not starting
- Check Render logs for Python errors
- Verify all environment variables are set

### Frontend can't connect to backend
- Check `NEXT_PUBLIC_API_URL` in Vercel env vars
- Ensure backend `ALLOWED_ORIGINS` includes your frontend URL

### Database connection errors
- Verify Neon connection string includes `?sslmode=require`
- Check that `init_db` ran successfully in Render build logs

### Clerk auth not working
- Ensure production keys (not test keys) are used in production
- Add your domain to Clerk's allowed origins

---

## Custom Domain (Optional)

To use your own domain (e.g., `wellmind.yourdomain.com`):

1. **Vercel:** Settings → Domains → Add domain
2. Update your DNS with the CNAME Vercel provides
3. Update Clerk allowed origins with your new domain
4. Update `ALLOWED_ORIGINS` in Render

---

## Monitoring

- **Backend health:** Visit `https://your-backend.onrender.com/health`
- **API docs:** Visit `https://your-backend.onrender.com/docs`
- **Logs:** Check Render dashboard → Logs tab
