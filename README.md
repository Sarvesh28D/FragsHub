# 🎮 FragsHub - Esports Tournament Platform

<div align="center">

![FragsHub Logo](https://img.shields.io/badge/FragsHub-Esports%20Platform-red?style=for-the-badge&logo=esports)

**The Complete Free Esports Tournament Management Platform**

[![Live Demo](https://img.shields.io/badge/Live-Demo-success?style=for-the-badge)](https://fragshub-frontend-3htxw5fks-sarvesh-daymas-projects.vercel.app)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15.4.6-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Realtime-orange?style=for-the-badge&logo=firebase)](https://firebase.google.com/)

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
- 🌐 **Real-time Updates** - Live tournament data
- 🆓 **100% Free** - Deploy and use completely free

## 🛠️ Tech Stack

### Frontend
- **Next.js 15.4.6** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS v4** - Modern styling
- **React 19** - Latest React features
- **Lucide Icons** - Beautiful icons
- HTML, CSS

### Backend
- **Express.js** - Node.js web framework
- **Firebase Admin SDK** - Backend Firebase integration
- **TypeScript** - Type-safe API development
- **CORS** - Cross-origin resource sharing

### Database & Services
- **Firebase Firestore** - NoSQL database
- **Firebase Authentication** - User management
- **Firebase Storage** - File storage
- **Razorpay** - Payment processing
- **Challonge API** - Bracket management

### Deployment
- **Vercel** - Frontend hosting (FREE)
- **Render** - Backend hosting (FREE)
- **Docker** - Containerized deployment

## 📁 Project Structure

```
FragsHub/
├── frontend/           # Next.js application
│   ├── pages/         # App routes
│   ├── components/    # Reusable components
│   ├── styles/        # TailwindCSS styles
│   ├── lib/           # Utilities and configurations
│   └── public/        # Static assets
├── backend/           # Firebase Functions
│   ├── functions/     # Cloud functions
│   ├── lib/           # Shared utilities
│   └── config/        # Configuration files
└── README.md
```

## 🚀 Quick Setup

### Prerequisites
- Node.js 18+
- Firebase CLI
- Vercel CLI (optional)

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env.local
# Configure environment variables
npm run dev
```

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure environment variables
firebase login
firebase init functions
npm run serve
```

## 🔧 Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
NEXT_PUBLIC_CHALLONGE_API_KEY=your_challonge_api_key
```

### Backend (.env)
```
FIREBASE_PROJECT_ID=your_project_id
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
CHALLONGE_API_KEY=your_challonge_api_key
CHALLONGE_USERNAME=your_challonge_username
EMAILJS_SERVICE_ID=your_emailjs_service_id
EMAILJS_TEMPLATE_ID=your_emailjs_template_id
EMAILJS_USER_ID=your_emailjs_user_id
```

## 📚 API Documentation

### Team Registration Flow
1. User fills team registration form
2. Frontend creates Razorpay order
3. User completes payment
4. Payment webhook triggers team approval
5. Bracket generation occurs automatically

### Admin Operations
- Approve/reject team registrations
- Update match scores
- Process refunds
- Generate new tournaments

## 🚀 Deployment

### Frontend (Vercel)
```bash
cd frontend
vercel --prod
```

### Backend (Firebase)
```bash
cd backend
firebase deploy --only functions
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🎯 Roadmap

- [ ] Discord bot integration
- [ ] Real-time match updates
- [ ] Stream integration
- [ ] Mobile app
- [ ] Multi-game support

## 📞 Support

For support, email support@fragshub.com or join our [Discord server](https://discord.gg/fragshub).
