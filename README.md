# TPL Auction

A real-time, IPL-style cricket auction platform built with the MERN stack. Admins manage teams and players, captains bid live on players through a Socket.io-powered auction engine, and Google Gemini auto-rates every player to sort them into auction pools.

**Live demo:** [https://tpl-auction-1.onrender.com](https://tpl-auction-1.onrender.com)

> Note: the backend runs on Render's free tier and spins down after inactivity — the first request after a period of idleness may take 30–60 seconds to respond while it wakes up.

---

## Features

### Authentication & Roles
- JWT-based auth with three roles: **Admin**, **Captain**, **Player**
- Role-based UI and route protection throughout the app

### Team & Player Management
- Admins create teams and add players
- Player stats are auto-rated by the **Google Gemini API**, which assigns an overall rating (1–10) and sorts each player into a **Marquee / Elite / Rookie** pool
- Each pool has its own configurable base price
- Captains select an unassigned team (a fixed captain fee is deducted and they join their own squad)

### Live Auction Engine
- Real-time bidding via **Socket.io**, with a server-authoritative countdown timer (clients never trust their own clock)
- Tiered minimum bid increments based on the current price
- Automatic **sold / unsold / requeue** cycling — a player who gets no bids is requeued once, then permanently removed after a second unsold pass
- Pause/resume that freezes and correctly resumes the timer for every connected client, not just the admin
- **Right to Match (RTM):** if a team previously released a player, they get a 5-second window after normal bidding closes to match the winning bid and reclaim them — limited to one RTM per team, per auction
- All purse and squad updates (sales, retentions, releases, trades) run inside **MongoDB transactions**, so a failure partway through never leaves a team or player in a half-updated state
- Optimistic-concurrency bid validation (`findOneAndUpdate` with a match condition) prevents two simultaneous bids from corrupting the current price

### Squad Management
- Retain one previously-released player per team at a fixed price before the auction
- Release a player mid-season with a full purse refund
- Transfer captaincy to another squad member
- Propose team-to-team trades (player-for-player, player-for-purse, or both), which require the receiving captain's acceptance **and** admin approval before anything actually changes hands

### Summary & Reporting
- Per-team squad view with total spend and role breakdown
- Auction-wide summary: most expensive signing, best value pick, and the full unsold list

---

## Tech Stack

**Frontend:** React, Redux Toolkit, React Router, Tailwind CSS, Axios, Socket.io-client
**Backend:** Node.js, Express, MongoDB (Mongoose), Socket.io, JWT, bcrypt
**AI:** Google Gemini API (player rating)
**Deployment:** Render (Web Service for the API, Static Site for the client)

---

## Project Structure

```
auction-app/
├── server/
│   ├── auction/        # The auction engine (timers, bids, RTM, sold/unsold logic)
│   ├── config/         # Database connection
│   ├── gemini/         # Player rating via the Gemini API
│   ├── middleware/     # Auth + admin-only route guards
│   ├── models/         # Mongoose schemas
│   ├── routes/         # Express route handlers
│   └── index.js        # App entry point, Express + Socket.io setup
└── client/
    └── src/
        ├── api/         # Shared axios instance
        ├── app/         # Redux store
        ├── components/  # Reusable UI pieces
        ├── features/    # Redux slices
        ├── pages/       # Route-level pages
        └── socket/      # Shared Socket.io client instance
```

---

## Running Locally

### Prerequisites
- Node.js
- A MongoDB connection string (Atlas or local)
- A Google Gemini API key

### Backend
```bash
cd server
npm install
cp .env.example .env 
npm run dev
```
Runs on `http://localhost:5000`.

### Frontend
```bash
cd client
npm install
npm start
```
Runs on `http://localhost:3000`.

---

## Key Technical Decisions

**Server-authoritative timers.** The countdown a client sees is calculated locally from a `timerEndsAt` timestamp broadcast by the server — the server never trusts a client's own clock, and the actual sale/unsold decision is only ever made by a single `setTimeout` running server-side.

**Atomic writes over optimistic assumptions.** Every place money or squad membership changes — a sale, a retention, a release, a trade — runs inside a MongoDB transaction, and every bid update uses a conditional `findOneAndUpdate` rather than a naive read-then-write. This was driven by real race conditions found during testing (two captains bidding within milliseconds of each other), not added speculatively.

**Client-side routing needs a server rewrite rule.** Since this is a single-page app, a direct page load or refresh on a route like `/auction` isn't a real file on the server — Render (and most static hosts) need an explicit rewrite rule (`/* → /index.html`) so the client-side router can take over.

---

## Known Limitations

- Free-tier hosting means occasional cold-start delays
- No automated test suite yet — testing has been manual, checkpoint-based throughout development
- Trade and RTM logic assume a single-admin, cooperative environment rather than fully adversarial input