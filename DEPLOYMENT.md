# 🚀 FragsHub - FREE Deployment Guide

## Deploy your esports tournament platform completely FREE!

### **Step 1: Deploy Frontend to Vercel (FREE)**

1. **Login to Vercel:**
   ```bash
   cd frontend
   vercel login
   ```

2. **Deploy:**
   ```bash
   vercel --prod
   ```

3. **Configuration:**
   - Project name: `fragshub`
   - Framework: `Next.js`
   - Build command: `npm run build`
   - Output directory: `.next`

### **Step 2: Deploy Backend to Railway (FREE $5/month credit)**

1. **Go to [Railway.app](https://railway.app)**
2. **Sign up with GitHub**
3. **Create New Project → Deploy from GitHub repo**
4. **Select your FragsHub repository**
5. **Configure deployment:**
   - Root Directory: `backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

6. **Set Environment Variables in Railway:**
   ```
   NODE_ENV=production
   PORT=3001
   FIREBASE_PROJECT_ID=fragshub-e79a7
   FIREBASE_PRIVATE_KEY_ID=your-private-key-id
   FIREBASE_PRIVATE_KEY=your-private-key
   FIREBASE_CLIENT_EMAIL=your-client-email
   FIREBASE_CLIENT_ID=your-client-id
   RAZORPAY_KEY_ID=your-razorpay-key
   RAZORPAY_KEY_SECRET=your-razorpay-secret
   CHALLONGE_API_KEY=your-challonge-key
   FRONTEND_URL=https://your-app.vercel.app
   ```

### **Step 3: Get Required API Keys**

#### **Firebase Setup:**
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project (fragshub-e79a7)
3. Project Settings → Service Accounts
4. Generate new private key
5. Copy the values to Railway environment variables

#### **Razorpay Setup:**
1. Sign up at [Razorpay.com](https://razorpay.com)
2. Go to Account & Settings → API Keys
3. Generate Test/Live keys
4. Copy Key ID and Secret

#### **Challonge Setup:**
1. Sign up at [Challonge.com](https://challonge.com)
2. Account Settings → Developer API
3. Copy your API key

### **Step 4: Connect Frontend to Backend**

After backend is deployed, update frontend config:

```typescript
// frontend/src/lib/firebase.ts
const API_BASE_URL = 'https://your-railway-app.railway.app';

export const api = {
  baseURL: API_BASE_URL,
  // ... rest of config
};
```

### **Alternative: Render.com (Also FREE)**

1. Go to [Render.com](https://render.com)
2. Create Web Service from Git (or use `render.yaml` blueprint in repo root)
3. Settings:
   - Runtime: Docker
   - Root Directory: repository root (Render reads render.yaml)
   - Health Check Path: `/health`
4. Set Environment Variables (in Render dashboard):
   - PORT=3001
   - NODE_ENV=production
   - FRONTEND_URL=https://your-frontend.vercel.app
   - FIREBASE_PROJECT_ID=fragshub-e79a7
   - FIREBASE_CLIENT_EMAIL=from service account
   - FIREBASE_PRIVATE_KEY=from service account (escape newlines as \n)
   - RAZORPAY_KEY_ID=...
   - RAZORPAY_KEY_SECRET=...
   - CHALLONGE_API_KEY=... (optional)
5. Deploy. Verify https://<service>.onrender.com/health returns healthy.
6. Update frontend env `NEXT_PUBLIC_API_BASE_URL` to the Render URL and redeploy frontend.

---

## 🎯 **Quick Deploy Commands**

### **Frontend (from frontend folder):**
```bash
npm install
vercel login
vercel --prod
```

### **Backend Setup:**
1. Push code to GitHub
2. Connect GitHub to Railway/Render (Render reads render.yaml)
3. Set environment variables
4. Deploy automatically

---

## 💡 **Free Tier Benefits**

- **Vercel**: Unlimited personal projects, custom domains
- **Railway**: $5 free credit monthly (covers small apps)
- **Render**: 750 hours/month free tier
- **Firebase**: Generous free Firestore quotas

## � **Troubleshooting**

### **If backend fails to start:**
1. Check environment variables are set
2. Verify Firebase service account JSON
3. Check Railway/Render logs

### **If frontend can't connect:**
1. Update CORS settings in backend
2. Check API_BASE_URL in frontend
3. Verify environment variables

---

## 🎮 **Your FragsHub will be LIVE and FREE!**

After following these steps:
- ✅ Frontend: `https://fragshub.vercel.app`
- ✅ Backend: `https://fragshub-backend.railway.app`
- ✅ Database: Firebase Firestore (free tier)
- ✅ Payments: Razorpay integration
- ✅ Tournaments: Challonge API

**Total Cost: $0/month** (within free tiers)
