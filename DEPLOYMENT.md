# Deployment Guide for Render.com

This guide walks you through deploying the Can't Stop game on Render.com completely **FREE** - no credit card required!

## Prerequisites

- A GitHub account with this repository pushed
- A Render.com account (free tier - no payment info needed)

## Deployment Steps

**Important**: We'll deploy each service manually. The Blueprint (render.yaml) feature requires a paid plan, so we skip that.

### Step 1: Sign up for Render

1. Go to https://render.com
2. Click "Get Started for Free"
3. Sign up with your GitHub account (no credit card required!)

### Step 2: Deploy the Backend (Python API)

1. **Click "New +" → "Web Service"**

2. **Connect your repository**:
   - If first time: Click "Connect account" and authorize GitHub
   - Select the `cantstop-game` repository
   - Click "Connect"

3. **Configure the service**:
   - **Name**: `cantstop-backend` (or any name you like)
   - **Region**: Choose closest to you
   - **Branch**: `master`
   - **Root Directory**: Leave empty
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`

4. **Select the Free plan**:
   - Scroll down to "Instance Type"
   - Select **"Free"** (should be selected by default)

5. **Add environment variable** (Optional but recommended):
   - Click "Advanced"
   - Click "Add Environment Variable"
   - **Key**: `PYTHON_VERSION`
   - **Value**: `3.11.0`

6. **Click "Create Web Service"**

7. **Wait for deployment** (2-3 minutes):
   - Watch the logs as it builds and deploys
   - When you see "Your service is live 🎉", it's ready!
   - **Copy the URL** - it will look like `https://cantstop-backend.onrender.com`
   - **Keep this URL handy** - you'll need it for the frontend!

### Step 3: Deploy the Frontend (React App)

1. **Go back to Render Dashboard**

2. **Click "New +" → "Static Site"**

3. **Connect to the same repository**:
   - Select `cantstop-game` repository
   - Click "Connect"

4. **Configure the static site**:
   - **Name**: `cantstop-frontend` (or any name you like)
   - **Branch**: `master`
   - **Root Directory**: Leave empty
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/dist`

5. **Add environment variable** (CRITICAL):
   - Click "Advanced"
   - Click "Add Environment Variable"
   - **Key**: `VITE_API_URL`
   - **Value**: Your backend URL from Step 2 (e.g., `https://cantstop-backend.onrender.com`)
   - ⚠️ **Important**: Use the EXACT URL from your backend, do NOT add `/api` at the end

6. **Click "Create Static Site"**

7. **Wait for deployment** (1-2 minutes):
   - Watch the build logs
   - When complete, you'll see your frontend URL

### Step 4: Play Your Game!

1. Click on your frontend service
2. Copy the URL (will be like `https://cantstop-frontend.onrender.com`)
3. Open it in your browser
4. Start playing!

The first load might take ~30 seconds as the backend wakes up from sleep.

## Important Notes

### Free Tier Limitations

- **Sleep after inactivity**: Services spin down after 15 minutes of inactivity
- **Spin-up time**: Takes ~30 seconds to wake up
- **750 hours/month**: Should be enough for personal use
- **No credit card required**

### Backend URL

The backend service will have a URL like:
```
https://cantstop-backend.onrender.com
```

### Frontend URL

The frontend will have a URL like:
```
https://cantstop-frontend.onrender.com
```

### CORS Configuration

The backend is already configured to accept requests from any origin, so the frontend will work correctly.

## Troubleshooting

### Frontend can't connect to backend

1. Check that the `VITE_API_URL` environment variable is set correctly in the frontend service
2. Make sure it points to your backend URL (without `/api` at the end)
3. Rebuild the frontend service after changing environment variables

### Backend not responding

1. Check the backend logs in Render dashboard
2. Make sure the service is "Live" (green status)
3. If it's sleeping, make a request to wake it up

### Build failures

1. Check the build logs in Render dashboard
2. Make sure all dependencies are listed in:
   - `backend/requirements.txt` for Python
   - `frontend/package.json` for Node.js

## Troubleshooting

### "Service Unavailable" or 502 Error

- The backend is probably sleeping. Wait 30 seconds and refresh.
- Check that the backend service shows "Live" status in Render dashboard

### Frontend shows blank page or "Failed to fetch"

1. Open browser developer console (F12)
2. Check for CORS errors or network errors
3. Verify the `VITE_API_URL` environment variable in frontend settings:
   - Go to your frontend service in Render
   - Click "Environment" tab
   - Make sure `VITE_API_URL` is set to your backend URL
   - If you change it, click "Manual Deploy" → "Clear build cache & deploy"

### Backend build fails

- Check the logs for Python version issues
- Make sure `PYTHON_VERSION` is set to `3.11.0` or higher
- Verify `backend/requirements.txt` exists and has all dependencies

### Frontend build fails

- Check logs for npm/Node.js errors
- Render uses Node 14+ by default, which should work
- Verify `frontend/package.json` and `vite.config.js` exist

## Alternative Free Hosting Options

If Render doesn't work for you, here are alternatives:

- **Railway.app**: Similar to Render, $5/month free credit (no card required initially)
- **Fly.io**: Free tier available, more complex setup
- **Vercel (frontend only)**: Great for static sites, would need backend elsewhere
- **Netlify (frontend only)**: Similar to Vercel

## Support

For issues specific to Render deployment, check:
- Render documentation: https://render.com/docs
- Render community: https://community.render.com

---

**Note**: The `render.yaml` file in this repository is for reference only. It requires a paid Render account to use the Blueprint feature. Always use the manual deployment steps above for the free tier.
