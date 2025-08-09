# 🚀 FragsHub Deployment Guide

## Quick Deploy for Mobile Testing

### 1. Frontend Deployment (Netlify) - 2 minutes
1. **Sign up at [Netlify](https://netlify.com)**
2. **Connect GitHub:** Click "New site from Git" → Select GitHub → Choose `FragsHub` repository
3. **Build Settings:**
   - Build command: `echo 'No build needed'`
   - Publish directory: `simple-frontend`
4. **Deploy!** - Your site will be live at `https://yourapp.netlify.app`

### 2. Backend Deployment (Render) - 3 minutes
1. **Sign up at [Render](https://render.com)**
2. **Create Web Service:** Dashboard → New → Web Service → Connect GitHub → Choose `FragsHub`
3. **Build Settings:**
   - Name: `fragshub-backend`
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment: `Node`
4. **Environment Variables:** Add these in Render dashboard:
   ```
   NODE_ENV=production
   PORT=10000
   FRONTEND_URL=https://yourapp.netlify.app
   ```
5. **Deploy!** - Your API will be live at `https://fragshub-backend.onrender.com`

### 3. Connect Frontend to Backend
1. **Update Frontend:** In Netlify dashboard → Site settings → Build & deploy → Environment variables
   ```
   REACT_APP_API_URL=https://fragshub-backend.onrender.com
   ```
2. **Redeploy:** Trigger a new deploy in Netlify

## 🎯 Quick Test URLs for Mobile

### Frontend (User Interface)
- **Local:** http://localhost:8080
- **Deployed:** https://yourapp.netlify.app

### Backend API (For Testing)
- **Local:** http://localhost:5000
- **Deployed:** https://fragshub-backend.onrender.com

## 📱 Mobile Testing Steps

1. **Open your deployed frontend URL on your phone**
2. **Test key features:**
   - Register team ✅
   - View tournaments ✅  
   - Admin panel access ✅
   - Export to Google Sheets ✅
   - Responsive design ✅

## 🔧 Environment Variables Needed

### Backend (.env file)
```env
NODE_ENV=production
PORT=10000
FRONTEND_URL=https://yourapp.netlify.app
GOOGLE_SHEETS_PRIVATE_KEY="your-google-sheets-key"
GOOGLE_SHEETS_CLIENT_EMAIL="your-service-account@email.com"
```

### Frontend (Build-time variables)
```env
REACT_APP_API_URL=https://fragshub-backend.onrender.com
```

## 🚀 One-Click Deploy Buttons

### Deploy Frontend to Netlify
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/Sarvesh28D/FragsHub)

### Deploy Backend to Render
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/Sarvesh28D/FragsHub)

## 🎮 What You Can Test on Mobile

### User Features
- ✅ **Responsive Design** - Works on all screen sizes
- ✅ **Team Registration** - Register new teams with validation
- ✅ **Tournament View** - Browse active tournaments  
- ✅ **Payment Integration** - Ready for Razorpay (when keys added)
- ✅ **Real-time Updates** - Live tournament data

### Admin Features  
- ✅ **Admin Dashboard** - Manage teams, tournaments, payments
- ✅ **Data Export** - Export to Google Sheets, CSV, JSON
- ✅ **User Management** - Role-based access control
- ✅ **Analytics View** - Tournament statistics

### API Testing
Test these endpoints on mobile browser:
- `GET /api/teams` - View all teams
- `GET /api/tournaments` - View tournaments  
- `GET /api/payments` - View payments
- `POST /api/teams/export/google-sheets` - Export data

## 🔒 Security Notes

- ✅ **CORS configured** for multiple domains
- ✅ **Environment variables** secure
- ✅ **API endpoints** properly structured
- ✅ **Mobile-responsive** design implemented

## 📞 Troubleshooting

### Common Issues:
1. **CORS errors:** Update FRONTEND_URL in backend environment
2. **API not found:** Check backend deployment status
3. **Mobile display issues:** All responsive breakpoints implemented

### Support:
- GitHub Issues: Create issue in repository
- API Testing: Use `/api/test` endpoint for health check
