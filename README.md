# 💳 Credit Card Advisor

AI-powered credit card recommendation app with personalized chat advisor.

![Credit Card Advisor](https://img.shields.io/badge/Status-Ready%20for%20Deployment-green)
![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue)

## ✨ Features

- **🔍 Browse Cards**: Filter and search 25+ credit cards
- **🤖 AI Advisor**: Smart chat recommendations based on your profile
- **📊 Personalized**: Income, spending, and credit score analysis
- **📱 Responsive**: Works perfectly on mobile and desktop
- **⚡ Fast**: Built with modern tech stack

## 🚀 Live Demo

[Your app will be here after deployment]

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite
- **Backend**: Express.js, TypeScript, Drizzle ORM
- **Database**: PostgreSQL (Neon serverless)
- **Deployment**: Vercel
- **UI Components**: Radix UI, Lucide Icons

## 🏗️ Local Development

```bash
# Clone and install
git clone <your-repo>
cd credit-card-advisor
npm install

# Set up database
cp .env.example .env
# Add your DATABASE_URL
npm run db:push

# Start development
npm run dev
# Visit http://localhost:5000
```

## 📦 Deploy Your Own

Ready to share with friends? See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete setup guide.

**Quick Deploy:**
1. Fork this repo
2. Create Neon database (free)
3. Deploy to Vercel (free)
4. Share your URL!

## 🔧 API Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/cards` | GET | Get all cards with filters |
| `/api/chat` | POST | Chat with AI advisor |
| `/api/recommendations` | POST | Get recommendations |

## 📄 Environment Variables

```env
DATABASE_URL=postgresql://username:password@host:port/database
NODE_ENV=development
```
