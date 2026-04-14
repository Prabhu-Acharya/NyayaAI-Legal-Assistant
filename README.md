# ⚖️ NyayaAI

AI-powered legal assistant for Indian businesses & startups. Built on MERN + Groq AI.

## Features

- 🤖 AI Legal Chat — powered by Groq Llama 3.3 70B
- 📄 Contract Generator — 5 contract types, Indian law compliant
- 💳 Payments — Razorpay integration, free/premium plans
- 📁 Chat History — persistent sessions per user
- 🔐 JWT Auth — secure register/login

## Tech Stack

**Frontend:** React 19, Vite, React Router v7, Axios  
**Backend:** Node.js, Express 5, MongoDB, Mongoose  
**AI:** Groq SDK, Llama 3.3 70B  
**Payments:** Razorpay  

## Local Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Groq API key
- Razorpay account

### Backend

```bash
cd server
npm install
cp .env.example .env
# Fill in your .env values
npm start
```

### Frontend

```bash
cd client
npm install
cp .env.example .env
# Fill in your .env values
npm run dev
```

## Environment Variables

See `server/.env.example` and `client/.env.example` for required variables.

## License

MIT