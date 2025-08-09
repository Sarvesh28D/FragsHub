# 🎮 FragsHub - Esports Tournament Platform

<div align="center">

![FragsHub Logo](https://img.shields.io/badge/FragsHub-Esports%20Platform-red?style=for-the-badge&logo=esports)

**The Complete Free Esports Tournament Management Platform**

[![Live Demo](https://img.shields.io/badge/Live-Demo-success?style=for-the-badge)](https://rad-speculoos-7ab2bb.netlify.app)
[![Backend API](https://img.shields.io/badge/Backend-API-blue?style=for-the-badge)](https://fragshub-backend.onrender.com)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15.4.6-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Express](https://img.shields.io/badge/Express.js-4.21.2-green?style=for-the-badge&logo=express)](https://expressjs.com/)

</div>

## 🚀 Overview

FragsHub is a modern, full-stack esports tournament management platform built with cutting-edge technologies. Organize tournaments, manage teams, handle payments, and generate brackets - all in one place, completely **FREE**.

### ✨ Key Features

- 🏆 **Tournament Management** - Create and manage esports tournaments
- 👥 **Team Registration** - Easy team signup and management
- 💳 **Payment Integration** - Secure payments via Razorpay
- 🏅 **Bracket Generation** - Automated tournament brackets
- 🔒 **Admin Dashboard** - Complete tournament administration
- 📱 **Responsive Design** - Works on all devices
- 📊 **Google Sheets Export** - Export team data to Google Sheets
- 🌐 **Real-time Updates** - Live tournament data
- 🆓 **100% Free** - Deploy and use completely free

## 🌐 Live Platform

- **Frontend**: [https://rad-speculoos-7ab2bb.netlify.app](https://rad-speculoos-7ab2bb.netlify.app) ✅ **LIVE**
- **Backend API**: [https://fragshub-backend.onrender.com](https://fragshub-backend.onrender.com) ✅ **LIVE**
- **Mobile Optimized**: Full responsive design for mobile testing ✅ **READY**

### 🔧 API Endpoints (All Working)
- `GET /api/test` - Health check ✅
- `GET /api/teams` - Get all teams ✅
- `GET /api/teams/export/csv` - CSV export ✅
- `POST /api/teams/export/sheets` - Google Sheets export ✅
- `GET /api/tournaments` - Tournament data ✅
- `GET /api/admin/dashboard` - Admin statistics ✅

## 🛠️ Tech Stack

### Frontend
- **Next.js 15.4.6** - React framework with App Router
- **TypeScript** - Type-safe development  
- **Tailwind CSS v4** - Modern styling
- **React 19** - Latest React features
- **Lucide Icons** - Beautiful icons
- **Static Site Generation** - Optimized for performance

### Backend
- **Express.js 4.21.2** - Node.js web framework
- **Node.js 22** - Latest runtime environment
- **CORS** - Cross-origin resource sharing
- **Google Sheets API** - Data export functionality
- **Mock Database** - In-memory data for demo

### Services & Integration
- **Google Sheets API** - Team data export
- **Razorpay Integration** - Payment processing (demo)
- **RESTful API** - Clean API architecture
### Deployment
- **Netlify** - Frontend hosting (FREE)
- **Render** - Backend hosting (FREE)
- **GitHub Actions** - Auto-deployment
- **Docker Support** - Containerized deployment

## 📁 Project Structure

```
FragsHub/
├── frontend/              # Next.js application
│   ├── src/app/          # App Router pages
│   ├── components/       # Reusable React components
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utilities and configurations
│   └── public/          # Static assets
├── backend/              # Express.js API server
│   ├── src/             # TypeScript source
│   ├── lib/             # Compiled JavaScript
│   ├── server-working.js # Production server
│   └── package.json     # Node.js dependencies
├── simple-frontend/      # Static HTML version
│   ├── index.html       # Complete tournament UI
│   ├── script.js        # JavaScript functionality
│   └── styles.css       # CSS styling
├── functions/           # Firebase Functions (legacy)
├── render.yaml          # Render deployment config
├── netlify.toml         # Netlify deployment config
└── README.md
```

## 🚀 Quick Setup

### Prerequisites
- Node.js 18+
- Git
- Code editor (VS Code recommended)

### Frontend Setup (Next.js)
```bash
cd frontend
npm install
npm run dev
# Open http://localhost:3000
```

### Backend Setup (Express.js)
```bash
cd backend
npm install
npm start
# API runs on http://localhost:5000
```

### Static Frontend Setup (Alternative)
```bash
cd simple-frontend
# Open index.html in browser
# Or serve with: python -m http.server 8080
```

## 🌐 Deployment Options

### Option 1: Netlify + Render (Recommended)
1. **Frontend on Netlify**:
   - Connect GitHub repository
   - Set build directory to `simple-frontend`
   - Auto-deploys on push

2. **Backend on Render**:
   - Connect GitHub repository
   - Auto-deploys from `render.yaml`
   - Free tier available

### Option 2: All-in-One Static Deployment
```bash
cd simple-frontend
# Deploy to any static hosting (Netlify, Vercel, GitHub Pages)
```

## 🔧 Environment Variables

### Backend (.env) - Optional
```bash
# Google Sheets API (for export functionality)
GOOGLE_SHEETS_CLIENT_EMAIL=your_service_account_email
GOOGLE_SHEETS_PRIVATE_KEY=your_private_key
GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id

# CORS Configuration
CORS_ORIGIN=https://your-frontend-url.netlify.app
FRONTEND_URL=https://your-frontend-url.netlify.app

# Server Configuration
PORT=5000
NODE_ENV=production
```

### Frontend - No Environment Setup Required
The static frontend works out of the box with demo data and mock integrations.

## 📚 API Documentation

### Base URL
- **Production**: `https://fragshub-backend.onrender.com`
- **Development**: `http://localhost:5000`

### Endpoints

#### Teams
- `GET /api/teams` - Get all teams
- `POST /api/teams` - Create new team
- `PUT /api/teams/:id` - Update team
- `DELETE /api/teams/:id` - Delete team
- `GET /api/teams/export/csv` - Export teams as CSV
- `POST /api/teams/export/sheets` - Export to Google Sheets

#### Tournaments
- `GET /api/tournaments` - Get all tournaments
- `POST /api/tournaments` - Create tournament
- `PUT /api/tournaments/:id` - Update tournament

#### Payments
- `POST /api/payments/create-order` - Create payment order
- `POST /api/payments/verify` - Verify payment

#### Admin
- `GET /api/admin/stats` - Get platform statistics

### Demo Data
The platform includes mock data for demonstration:
- 12 pre-registered teams
- Sample tournaments
- Payment history
- Admin statistics

## 🚀 Deployment

### Automatic Deployment (Current Setup)
- **Frontend**: Auto-deploys to Netlify from `simple-frontend/` on every push
- **Backend**: Auto-deploys to Render from `backend/` on every push

### Manual Deployment

#### Frontend (Netlify)
```bash
# Option 1: Static deployment
cd simple-frontend
# Deploy folder contents to Netlify

# Option 2: Next.js deployment  
cd frontend
npm run build
# Deploy .next/out folder
```

#### Backend (Render)
```bash
cd backend
git push origin master
# Render auto-deploys from render.yaml
```

#### Local Development
```bash
# Frontend
cd simple-frontend && python -m http.server 8080

# Backend  
cd backend && npm start

# Next.js Frontend (alternative)
cd frontend && npm run dev
```

## 🎮 Features Showcase

### Tournament Management
- Create unlimited tournaments
- Automatic bracket generation
- Real-time score updates
- Prize pool management

### Team Registration  
- Streamlined signup process
- Payment integration
- Team verification
- Member management

### Admin Dashboard
- Complete platform oversight
- Team approval workflows
- Payment tracking
- Statistics and analytics

### Data Export
- Google Sheets integration
- CSV export functionality
- Real-time data sync
- Custom report generation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🎯 Roadmap

- [x] Complete tournament platform
- [x] Google Sheets export
- [x] Mobile-responsive design
- [x] Production deployment
- [ ] Real-time WebSocket updates
- [ ] Discord bot integration
- [ ] Multi-game support
- [ ] Advanced bracket types
- [ ] Mobile app
- [ ] Stream integration

## 📱 Mobile Testing

The platform is fully optimized for mobile devices. Test on:
- **Live URL**: [https://rad-speculoos-7ab2bb.netlify.app](https://rad-speculoos-7ab2bb.netlify.app)
- **Responsive breakpoints**: Mobile, tablet, desktop
- **Touch-friendly interfaces**: All buttons and forms optimized for mobile

## 📞 Support & Contact

- **GitHub Issues**: [Report bugs and feature requests](https://github.com/Sarvesh28D/FragsHub/issues)
- **Email**: Open to collaboration and feedback
- **Platform Demo**: Full working demo available at live URL

## 🏆 About

FragsHub represents a complete, production-ready esports tournament platform that can be deployed and used immediately. Built with modern web technologies and best practices, it serves as both a functional platform and a showcase of full-stack development capabilities.

**Key Highlights**:
- ✅ Production deployed and functional
- ✅ Mobile-optimized and responsive
- ✅ Complete API backend with Google Sheets integration
- ✅ Professional UI/UX design
- ✅ Free hosting on industry-standard platforms
