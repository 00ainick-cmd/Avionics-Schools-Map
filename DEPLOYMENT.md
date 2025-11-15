# Deployment Guide

Complete guide to deploying your Avionics Schools Map to production.

## Overview

- **Frontend**: GitHub Pages (automatic deployment)
- **Backend**: Railway, Render, or DigitalOcean

---

## 🎯 Quick Deploy: Railway (Recommended)

### Step 1: Deploy Backend to Railway

1. **Create Railway Account**
   - Go to https://railway.app
   - Sign up with GitHub (free)

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose `Avionics-Schools-Map`

3. **Configure Service**
   - Railway will auto-detect Node.js
   - Click on your service
   - Go to "Settings" tab
   - Set these variables:
     ```
     ROOT_DIRECTORY = backend
     BUILD_COMMAND = npm install && npm run build
     START_COMMAND = npm start
     ```

4. **Add Environment Variables**
   - Go to "Variables" tab
   - Add:
     ```
     PORT = 3001
     NODE_ENV = production
     ```

5. **Deploy!**
   - Railway will automatically deploy
   - Wait ~2-3 minutes
   - Copy your deployment URL (looks like: `https://yourapp.railway.app`)

6. **Load Sample Data** (Optional)
   - In Railway dashboard, go to "Settings" → "Deploy"
   - Run one-time command: `cd backend && npm run load-sample-data`
   - Or use the API to upload CSV files through the UI

### Step 2: Update Frontend for Production

Update the frontend to point to your Railway backend:

```bash
# Create production environment file
echo "VITE_API_URL=https://your-railway-url.railway.app/api" > frontend/.env.production
```

**Replace `your-railway-url` with your actual Railway URL!**

### Step 3: Deploy Frontend to GitHub Pages

```bash
# Commit the changes
git add .
git commit -m "Add deployment configuration"
git push origin claude/interactive-feature-dev-01MxH465zM7p9wWq3VbwJ6yS

# Or merge to main to deploy
git checkout main
git merge claude/interactive-feature-dev-01MxH465zM7p9wWq3VbwJ6yS
git push origin main
```

### Step 4: Enable GitHub Pages

1. Go to GitHub repo → **Settings** → **Pages**
2. Under "Build and deployment":
   - Source: **GitHub Actions**
3. Wait ~3-5 minutes for deployment

**Your site will be live at:**
```
https://00ainick-cmd.github.io/Avionics-Schools-Map/
```

---

## 🚀 Alternative: Render.com

### Deploy Backend to Render

1. **Create Render Account**
   - Go to https://render.com
   - Sign up with GitHub (free tier available)

2. **Create Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repo
   - Settings:
     ```
     Name: avionics-map-backend
     Environment: Node
     Region: Choose closest to you
     Branch: main (or your claude branch)
     Root Directory: backend
     Build Command: npm install && npm run build
     Start Command: npm start
     ```

3. **Set Environment Variables**
   - Add:
     ```
     PORT = 3001
     NODE_ENV = production
     ```

4. **Deploy**
   - Click "Create Web Service"
   - Wait ~3-5 minutes
   - Copy your URL: `https://avionics-map-backend.onrender.com`

5. **Update Frontend**
   ```bash
   echo "VITE_API_URL=https://avionics-map-backend.onrender.com/api" > frontend/.env.production
   ```

---

## 💎 Alternative: DigitalOcean App Platform

### Deploy Backend to DigitalOcean

1. **Create DigitalOcean Account**
   - Go to https://www.digitalocean.com
   - $200 free credit for 60 days

2. **Create App**
   - Apps → "Create App"
   - Connect GitHub repo
   - Select `Avionics-Schools-Map`

3. **Configure App**
   - Component Type: Web Service
   - Source Directory: `backend`
   - Build Command: `npm install && npm run build`
   - Run Command: `npm start`
   - Environment Variables:
     ```
     PORT = 8080
     NODE_ENV = production
     ```

4. **Deploy**
   - Click "Create Resources"
   - Wait ~5 minutes
   - Copy your URL

5. **Update Frontend**
   ```bash
   echo "VITE_API_URL=https://your-app.ondigitalocean.app/api" > frontend/.env.production
   ```

---

## 📊 Loading Data on Production

After deploying the backend, you need to populate it with data:

### Option 1: Use the Web UI
1. Go to your live site
2. Click "Upload CSV"
3. Upload your CSV files
4. Wait for geocoding (can take a while for large files)

### Option 2: Run Script Directly (Railway/Render)

**Railway:**
- Dashboard → Service → Settings → "Run a command"
- Command: `cd backend && npm run load-sample-data`

**Render:**
- Dashboard → Web Service → Shell
- Run: `npm run load-sample-data`

### Option 3: Pre-populate Database Locally
1. Load data locally: `cd backend && npm run load-sample-data`
2. Upload the `backend/data/*.db` file to your server
3. Railway: Use persistent volumes
4. Render: Use persistent disks

---

## 🔧 Production Checklist

Before going live, ensure:

- [ ] Backend deployed and accessible
- [ ] Frontend env file has correct backend URL
- [ ] GitHub Pages enabled
- [ ] Data loaded into production database
- [ ] Test all features:
  - [ ] Map loads with markers
  - [ ] Clicking markers shows popups
  - [ ] Filtering works
  - [ ] CSV upload works
  - [ ] Search works

---

## 🐛 Troubleshooting

### Frontend deploys but shows "No Data Available"
- Check frontend `.env.production` has correct backend URL
- Verify backend is running (visit `https://your-backend-url/api/health`)
- Check browser console (F12) for CORS errors

### Backend won't start
- Check logs in Railway/Render dashboard
- Verify build command completed successfully
- Ensure all dependencies are in `package.json`

### CORS Errors
The backend is already configured for CORS, but if you have issues:
- Add your frontend URL to CORS whitelist in `backend/src/index.ts`

### Geocoding Fails
- Free Nominatim API has rate limits (1 req/sec)
- For large datasets, pre-geocode locally before deploying
- Or consider paid geocoding service (Google Maps, Mapbox)

### Database Issues
- SQLite file needs persistent storage
- Railway: Add persistent volume
- Render: Attach persistent disk
- Or migrate to PostgreSQL for production (Railway offers free PostgreSQL)

---

## 💰 Cost Estimate

**Free Tier (Recommended for Testing):**
- GitHub Pages: Free
- Railway: $5 free credit/month
- Render: Free tier (with limitations)
- **Total**: $0-5/month

**Paid (For Production):**
- GitHub Pages: Free
- Railway Pro: $5/month
- OR Render Starter: $7/month
- OR DigitalOcean: $12/month
- **Total**: $5-12/month

---

## 📈 Scaling for Production

If you expect high traffic or large datasets:

1. **Use PostgreSQL instead of SQLite**
   - Railway offers free PostgreSQL
   - Update `backend/src/services/database.ts`

2. **Add Caching**
   - Cache geocoding results
   - Cache API responses with Redis

3. **Use CDN**
   - CloudFlare for frontend
   - Improves global load times

4. **Optimize Geocoding**
   - Pre-geocode all data
   - Or use paid geocoding API
   - Batch geocode during off-hours

---

## 🔐 Security Recommendations

For production:

1. **Add Authentication**
   - Protect CSV upload endpoints
   - Add admin dashboard

2. **Rate Limiting**
   - Already using rate limiting for geocoding
   - Add rate limiting for API endpoints

3. **Environment Variables**
   - Never commit `.env` files
   - Use platform's secret management

4. **HTTPS**
   - Railway/Render provide this automatically
   - GitHub Pages has HTTPS by default

---

## 🎉 You're Live!

Once deployed, share your map:
```
https://00ainick-cmd.github.io/Avionics-Schools-Map/
```

Next steps:
- Add your real data
- Customize branding
- Share with the aviation community!
