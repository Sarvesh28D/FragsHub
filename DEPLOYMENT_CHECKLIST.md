# 🚀 FragsHub Deployment Checklist

## ✅ Completed
- [x] Frontend deployed to Vercel
- [x] Code pushed to GitHub: https://github.com/Sarvesh28D/FragsHub
- [x] Docker configuration ready
- [x] render.yaml configuration ready

## 🔄 Next: Deploy Backend to Render

### Step 1: Deploy Backend
1. Go to [Render.com](https://render.com) and sign up/login
2. Click "New +" → "Web Service" 
3. Connect your GitHub account
4. Select repository: `Sarvesh28D/FragsHub`
5. Configure:
   - **Name**: `fragshub-backend`
   - **Runtime**: `Docker`
   - **Region**: `Oregon (US West)`
   - **Branch**: `master`
   - **Root Directory**: (leave empty - uses render.yaml)

### Step 2: Set Environment Variables in Render
**Required Variables:**
```
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://fragshub-frontend-3htxw5fks-sarvesh-daymas-projects.vercel.app
```

**Firebase Variables:**
```
FIREBASE_PROJECT_ID=fragshub-e79a7
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@fragshub-e79a7.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...your key...\n-----END PRIVATE KEY-----\n
```

**Optional Payment Variables:**
```
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
CHALLONGE_API_KEY=your_challonge_api_key
```

### Step 3: Wire Frontend to Backend
1. After backend deploys, copy the backend URL (e.g., `https://fragshub-backend.onrender.com`)
2. Go to Vercel Dashboard → FragsHub project → Settings → Environment Variables
3. Add: `NEXT_PUBLIC_API_BASE_URL = https://fragshub-backend.onrender.com`
4. Redeploy frontend

## 🎯 Final URLs
- **Frontend**: https://fragshub-frontend-3htxw5fks-sarvesh-daymas-projects.vercel.app
- **Backend**: https://fragshub-backend.onrender.com (after deployment)
- **Health Check**: https://fragshub-backend.onrender.com/health

## 🔑 API Keys Needed

### Firebase (Required)
1. Go to [Firebase Console](https://console.firebase.google.com/project/fragshub-e79a7)
2. Project Settings → Service Accounts
3. Generate new private key
4. Use the values in Render environment variables

### Razorpay (Optional - for payments)
1. Sign up at [Razorpay.com](https://razorpay.com)
2. Go to Account & Settings → API Keys
3. Generate Test/Live keys
4. Add to Render environment variables

### Challonge (Optional - for tournaments)
1. Sign up at [Challonge.com](https://challonge.com)
2. Account Settings → Developer API
3. Copy API key
4. Add to Render environment variables

## 🎮 After Deployment
Your complete esports tournament platform will be live with:
- Team registration and management
- Payment processing (when Razorpay is configured)
- Tournament brackets (when Challonge is configured)
- Admin dashboard
- Real-time updates

## 🛠️ Troubleshooting
- **Backend fails to start**: Check environment variables are set correctly
- **Frontend can't connect**: Verify NEXT_PUBLIC_API_BASE_URL points to backend
- **Firebase errors**: Ensure service account credentials are properly escaped
- **CORS issues**: Check FRONTEND_URL matches your actual frontend domain

## 📚 Documentation
- Full setup guide: `README.md`
- Deployment details: `DEPLOYMENT.md`
- Environment setup: `ENVIRONMENT_SETUP.md`
