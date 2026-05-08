# ISS & AI News Dashboard 🛸

A **production-ready** React + Vite dashboard featuring live ISS tracking, AI-powered news, an intelligent chatbot, and beautiful interactive charts.

## ✨ Features

- 🛰️ **Live ISS Tracking** — Real-time position every 15s via open-notify.org
- 📍 **Leaflet Map** — Custom ISS marker, trajectory polyline, tooltips
- 📰 **News Dashboard** — Top headlines with search, sort, 15-min caching
- 🤖 **AI Chatbot** — Mistral-7B on Hugging Face, dashboard-data restricted
- 📊 **Charts** — Speed line chart, news doughnut (Recharts)
- 🌙 **Dark/Light Mode** — Persisted in localStorage
- ✨ **Glassmorphism UI** — Framer Motion animations, toast notifications

## 🚀 Tech Stack

- React 18 + Vite
- Tailwind CSS v4
- React Router v6
- Leaflet / React-Leaflet
- Recharts
- Framer Motion
- Axios
- React Hot Toast
- Hugging Face Inference API
- newsdata.io API

## 🛠️ Setup

### 1. Clone & Install

```bash
cd iss-ai-dashboard
npm install
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env`:
```
VITE_NEWS_API_KEY=your_newsdata_io_key
VITE_AI_TOKEN=your_huggingface_token
```

- Get a free NewsData.io key at: https://newsdata.io/
- Get a Hugging Face token at: https://huggingface.co/settings/tokens

### 3. Run Development Server

```bash
npm run dev
```

Open: http://localhost:5173

## 📁 Project Structure

```
src/
  components/     # Reusable UI components
  pages/          # Route pages
  hooks/          # Custom React hooks
  services/       # API service layer
  utils/          # Helper functions (Haversine, etc.)
  context/        # Global state (Theme, ISS, News)
  charts/         # Chart components (Recharts)
```

## ☁️ Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Add env vars in Vercel Dashboard → Project → Settings → Environment Variables:
- `VITE_NEWS_API_KEY`
- `VITE_AI_TOKEN`

## 📄 License

MIT
