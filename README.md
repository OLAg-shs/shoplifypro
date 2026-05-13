# ⚡ Eagle Choice — AI-Powered Multi-Seller E-Commerce Platform

A Shopify-clone built for modern sellers. Eagle Choice lets you create uniquely branded stores, manage products with AI background removal, generate viral ad cards, and track orders — all in one platform.

## ✨ Features

- 🤖 **AI Store Builder** — Describe your store in plain English and get a generated theme instantly
- 🎨 **Live Store Customizer** — Real-time color, font, and layout editing with instant preview
- 🖼️ **AI Background Removal** — Upload product images and get studio-quality white-background photos via Cloudinary
- 📸 **Branded Ad Card Generator** — Create social-media-ready product cards and download them as high-res PNG
- 📦 **Product Management** — Full product catalog with image processing badges
- 📊 **Order Tracking** — Visual step-by-step order progress tracker
- 🔐 **Seller Auth** — JWT-based authentication with role system (admin, seller, buyer, agent)
- ☁️ **Supabase Backend** — Fully migrated from MongoDB to Supabase (PostgreSQL)

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, React Router v6 |
| Styling | Vanilla CSS, Glassmorphism design system |
| Backend | Node.js, Express |
| Database | Supabase (PostgreSQL) |
| Image Processing | Cloudinary |
| Icons | Lucide React |
| Deployment | Vercel |

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) project with the schema from `FULL_SUPABASE_SETUP.sql`
- A [Cloudinary](https://cloudinary.com) account for image processing

### Environment Variables

Copy `.env.example` to `.env` in the root folder and fill in:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Local Development

```bash
# Install server dependencies
cd server && npm install

# Start the Express server (port 5000)
node server.js

# In a new terminal — install client dependencies
cd client && npm install

# Start the React dev server (port 3000)
npm run dev
```

## 📁 Project Structure

```
eagle-choice/
├── client/               # React + Vite frontend
│   ├── src/
│   │   ├── components/   # Header, Footer
│   │   ├── pages/        # All page components
│   │   └── styles/       # Global CSS design system
│   ├── index.html
│   └── vite.config.js
├── server/               # Express backend
│   ├── routes/           # API routes (auth, ai, products, stores, orders, upload)
│   ├── middleware/        # JWT auth middleware
│   └── server.js
├── FULL_SUPABASE_SETUP.sql   # Database schema
└── vercel.json               # Vercel deployment config
```

## 🌐 Deployment

This project is deployed on **Vercel**. The frontend is built as a static site and the backend runs as serverless functions.

Set the following environment variables in your Vercel project settings (same as `.env` above).

---

Built with ❤️ for ambitious sellers.
