# Deployment Guide for Render.com

This guide walks you through deploying the Can't Stop game on Render.com for free.

## Prerequisites

- A GitHub account with this repository pushed
- A Render.com account (free tier)

## Deployment Steps

### Option 1: Automatic Deployment (Recommended)

1. **Sign up/Login to Render**
   - Go to https://render.com
   - Sign up or log in with your GitHub account

2. **Create New Blueprint**
   - Click "New +" button in the dashboard
   - Select "Blueprint"
   - Connect your GitHub account if not already connected
   - Select the `cantstop-game` repository
   - Render will automatically detect the `render.yaml` file

3. **Configure Services**
   - Render will show you two services that will be created:
     - `cantstop-backend` - Python web service
     - `cantstop-frontend` - Static site
   - Click "Apply" to create both services

4. **Wait for Deployment**
   - Backend will deploy first (takes 2-3 minutes)
   - Frontend will deploy next (takes 1-2 minutes)
   - Watch the logs for any errors

5. **Access Your Game**
   - Once both services show "Live", click on the frontend service
   - Copy the URL (will be something like `https://cantstop-frontend.onrender.com`)
   - Open in browser and play!

### Option 2: Manual Deployment

If automatic deployment doesn't work, you can deploy manually:

#### Deploy Backend

1. Click "New +" → "Web Service"
2. Connect to your repository
3. Configure:
   - **Name**: `cantstop-backend`
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: Free
4. Add environment variable:
   - **Key**: `PYTHON_VERSION`
   - **Value**: `3.11.0`
5. Click "Create Web Service"

#### Deploy Frontend

1. Click "New +" → "Static Site"
2. Connect to your repository
3. Configure:
   - **Name**: `cantstop-frontend`
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/dist`
4. Add environment variable:
   - **Key**: `VITE_API_URL`
   - **Value**: Your backend URL (e.g., `https://cantstop-backend.onrender.com`)
5. Click "Create Static Site"

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

## Alternative Free Hosting Options

If Render doesn't work for you, here are alternatives:

- **Railway.app**: Similar to Render, $5/month free credit
- **Fly.io**: More complex but very powerful
- **Vercel (frontend)** + **Render (backend)**: Split deployment

## Support

For issues specific to Render deployment, check:
- Render documentation: https://render.com/docs
- Render community: https://community.render.com
