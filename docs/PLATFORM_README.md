# FlashQuest — FFF Platform

**FlashQuest** is a gamified flashcard learning platform built on Micro Frontend (MFE) architecture. Players study flashcards using FSRS spaced repetition while simultaneously playing side-panel games that are powered by their study progress. Features include gacha card collection, social bookmarks, global chat, and an admin dashboard.

> **⚠️ Keep this README up-to-date!** When adding new projects or changing the architecture, update this document and `AGENTS.md`.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Project Structure](#project-structure)
- [Projects in Detail](#projects-in-detail)
- [Game MFE System](#game-mfe-system)
- [Spaced Repetition (FSRS)](#spaced-repetition-fsrs)
- [Economy System](#economy-system)
- [Tech Stack](#tech-stack)
- [Development Setup](#development-setup)
- [Deployment](#deployment)
- [Production URLs](#production-urls)
- [API Reference](#api-reference)
- [Contributor Guide](#contributor-guide)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│  Player Browser                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  fff-platform (Host MFE)  — fq-platform.pages.dev    │  │
│  │  ┌──────────────────┐  ┌────────────────────────┐    │  │
│  │  │ SRS Flashcard UI │  │ Game MFE (remote, lazy) │   │  │
│  │  │ FSRS review      │  │ or MockGame fallback    │   │  │
│  │  └──────────────────┘  └────────────────────────┘    │  │
│  │  Home │ Codex │ Summon │ Quests │ Profile │ Chat     │  │
│  └──────────────┬────────────────────────────────────────┘  │
│                 │ REST → JWT auth                            │
│  ┌──────────────▼────────────────────────────────────────┐  │
│  │  fff-api (Cloudflare Worker)                          │  │
│  │  Auth │ FSRS │ Gacha │ Chat │ Social                  │  │
│  │  ┌─────────────────────────────────────────────┐      │  │
│  │  │  D1 Database (flashquest-db)                │      │  │
│  │  └─────────────────────────────────────────────┘      │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Admin Browser                                              │
│  fff-admin (React) → fff-admin-api (Worker) → Same D1 DB   │
└─────────────────────────────────────────────────────────────┘
```

Both API workers share the **same D1 database** (`flashquest-db`) but are completely isolated codebases:
- **Player API** — JWT Bearer token auth
- **Admin API** — Static `X-Admin-Key` header

The platform loads game MFEs at runtime via **Vite Module Federation**. Each game is a separate Cloudflare Pages deployment. If a game's remote isn't available, a `MockGame` placeholder loads instead.

---

## Project Structure

```
framework site/
├── README.md              # This file — project overview
├── AGENTS.md              # Agent knowledge — FSRS details, API reference
├── deploy-all.ps1         # One-click deploy all MFEs + platform
├── start-games.ps1        # Local dev: build & serve all game MFEs
│
├── fff-api/               # Player API (Cloudflare Worker)
│   ├── src/index.js       #   All route handlers
│   ├── src/router.js      #   Lightweight request router with CORS
│   ├── src/auth.js        #   JWT + password hashing (PBKDF2-SHA256)
│   ├── schema.sql         #   Full database DDL
│   ├── seed.sql           #   US States & Capitals deck (50 cards)
│   ├── seed-es.sql        #   English → Spanish deck (30 cards)
│   └── wrangler.toml      #   Worker config (DB binding, vars)
│
├── fff-platform/          # Player web app (Vite + React 19 + Tailwind)
│   ├── vite.config.js     #   Federation host config (env-aware remotes)
│   ├── src/
│   │   ├── App.jsx        #   Router: /login, /register, /(protected)
│   │   ├── pages/
│   │   │   ├── Home.jsx       # Deck cards with per-deck game picker
│   │   │   ├── GameView.jsx   # SRS study + game side panel
│   │   │   ├── Gacha.jsx      # Summon with animated card reveal
│   │   │   ├── Codex.jsx      # Card collection browser
│   │   │   ├── Quests.jsx     # Placeholder quests page
│   │   │   └── Profile.jsx    # User profile + bookmarks
│   │   ├── components/
│   │   │   ├── Layout.jsx     # Nav with due count badge
│   │   │   ├── MockGame.jsx   # Fallback when game MFE unavailable
│   │   │   └── GlobalChat.jsx # Real-time chat panel
│   │   ├── context/
│   │   │   └── AuthContext.jsx # Auth state (JWT, user)
│   │   ├── utils/
│   │   │   └── api.js         # All API client methods
│   │   └── index.css          # Design system + responsive GameView layout
│   └── dist/              #   Production build output
│
├── fff-admin/             # Admin dashboard (Vite + React, dark theme)
├── fff-admin-api/         # Admin API (Cloudflare Worker)
│
└── games/                 # Game Micro Frontends
    ├── RESPONSIVE_GUIDE.md    # Agent instructions for making games responsive
    ├── placeholder-game/      # FlashQuest RPG (turn-based combat)
    ├── template-game/         # Starter template for new games
    ├── merger-game/           # Merge-style crafting game
    ├── tower-defense-game/    # Tower defense with creep waves
    ├── incremental-game/      # Idle/clicker with upgrades
    └── rts-game/              # Lane-based RTS (Command & Conquer Rivals style)
```

---

## Projects in Detail

| Project | Type | Dev Port | CI Pages Project | Docs |
|---|---|---|---|---|
| `fff-api` | Cloudflare Worker | 8787 | — (Worker deploy) | [README](./fff-api/README.md) |
| `fff-platform` | Vite + React (Host) | 5175/5176 | `fq-platform` | [README](./fff-platform/README.md) |
| `fff-admin-api` | Cloudflare Worker | 8787 | — (Worker deploy) | [README](./fff-admin-api/README.md) |
| `fff-admin` | Vite + React | 5177 | — | — |
| `placeholder-game` | Game MFE | 5001 | `fq-placeholder-game` | — |
| `template-game` | Game MFE | 5002 | `fq-template-game` | — |
| `merger-game` | Game MFE | 5003 | `fq-merger-game` | — |
| `tower-defense-game` | Game MFE | 5004 | `fq-tower-defense-game` | — |
| `incremental-game` | Game MFE | 5005 | `fq-incremental-game` | — |
| `rts-game` | Game MFE | 5006 | `fq-rts-game` | — |

---

## Game MFE System

### How It Works

1. **Home page** — Each deck card has a **game picker** dropdown. The user selects which game to play alongside studying that deck. Selection is persisted per-deck in `localStorage`.
2. **Start Learning** — Navigates to `/game/:deckId?game=KEY`, passing the selected game via query parameter.
3. **GameView** — Reads `?game=KEY`, looks up the component in `GAME_REGISTRY`, and lazy-loads it via Module Federation. Falls back to `MockGame` if the remote isn't available.
4. **Responsive layout** — SRS panel and game panel use CSS `@media (orientation:)`:
   - **Landscape**: side-by-side (SRS 2/3 left, game 1/3 right)
   - **Portrait**: vertical stack (SRS 55% top, game 45% bottom)

### Game–Platform Communication

Games receive events from the SRS system via custom DOM events:

```js
// Dispatched by GameView after each card review
window.dispatchEvent(new CustomEvent('flashquest:card-reviewed'));

// Games listen for this to award in-game resources
window.addEventListener('flashquest:card-reviewed', () => {
    // Award resources (e.g. advance progress, earn currency)
});
```

### Creating a New Game

1. Copy `games/template-game/` to `games/my-game/`
2. Update `name` in `package.json` and `vite.config.js` (federation `name` field)
3. Set a unique port in `vite.config.js` (next available: 5007)
4. Add the remote to `fff-platform/vite.config.js` (both dev and prod URLs)
5. Add entry to `GAME_REGISTRY` in `fff-platform/src/pages/GameView.jsx`
6. Follow `games/RESPONSIVE_GUIDE.md` for responsive container support

### Game Registry (GameView.jsx)

```
placeholder   →  FlashQuest RPG      (port 5001)
template      →  Game Template       (port 5002)
merger        →  Merge Laboratory    (port 5003)
tower_defense →  Tower Defense       (port 5004)
incremental   →  Incremental Knowledge (port 5005)
rts           →  RTS Commander       (port 5006)
```

---

## Spaced Repetition (FSRS)

Uses the [ts-fsrs](https://github.com/open-spaced-repetition/ts-fsrs) library (algorithm v5).

- **4 rating buttons**: Again (1), Hard (2), Good (3), Easy (4)
- **Session queue**: Main queue + learning queue. Cards rated Again/Hard in Learning/Relearning state re-queue for review within the session
- **Countdown timer**: When main queue is empty but learning cards aren't due yet
- **Interval preview**: `POST /api/study/preview` returns human-readable intervals for all 4 buttons
- **Due count badge**: Navigation "Learn" link shows badge with cards due for review
- **Completion reward**: 500 coins when `remaining_due === 0` (enough for 5 summon pulls)

### Card States

| Value | State | Behavior |
|---|---|---|
| 0 | New | Never reviewed, pulled from gacha |
| 1 | Learning | Initial learning steps, short intervals |
| 2 | Review | Graduated, on long-term schedule |
| 3 | Relearning | Failed a review, re-learning |

---

## Economy System

| Action | Amount |
|---|---|
| Starting balance | +500 coins |
| Complete all reviews | +500 coins |
| Duplicate card refund | +25 coins |
| Pull ×1 | −100 coins |
| Pull ×10 | −900 coins (10% discount) |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Runtime** | Cloudflare Workers |
| **Database** | Cloudflare D1 (SQLite at edge) |
| **Player Auth** | JWT (HMAC-SHA256) via `jose` |
| **Password Hashing** | PBKDF2-SHA256 (Web Crypto API) |
| **Admin Auth** | Static API key (`X-Admin-Key`) |
| **Spaced Repetition** | FSRS via `ts-fsrs` |
| **Frontend** | Vite 5 + React 19 |
| **MFE** | `@originjs/vite-plugin-federation` |
| **Player Styling** | Tailwind CSS 3.4 |
| **Admin Styling** | Vanilla CSS (dark theme) |
| **Hosting (static)** | Cloudflare Pages |
| **Deployment** | Wrangler CLI |

---

## Development Setup

### Prerequisites

- Node.js v20+ (`nvm use 20`)
- npm

### Full Local Development

```powershell
# 1. Start the API (in its own terminal)
cd fff-api && npm install && npm run dev

# 2. Build & serve all game MFEs (in their own terminal)
.\start-games.ps1

# 3. Start the platform (in its own terminal)
cd fff-platform && npm install && npm run dev -- --port 5176
```

The platform dev server uses **localhost** remote URLs. Games fall back to `MockGame` if their local server isn't running — you only need to run the games you're actively developing.

### Single Game Development

```powershell
cd games/my-game
npm install && npm run dev     # Dev server with hot reload
npm run build                  # Production build
npx vite preview --port PORT   # Serve built dist/ for federation
```

Test credentials: `test` / `password123`

---

## Deployment

### Full Deployment (All MFEs + Platform)

```powershell
nvm use 20
.\deploy-all.ps1    # Builds and deploys all 7 projects
```

### Manual Deployment

```powershell
# Deploy a single game
cd games/my-game
npm run build
npx wrangler pages deploy dist/ --project-name fq-my-game --branch production

# Deploy platform (builds with production remote URLs automatically)
cd fff-platform
npm run build    # NODE_ENV=production → uses Cloudflare URLs
npx wrangler pages deploy dist/ --project-name fq-platform --branch production

# Deploy Player API
cd fff-api
npx wrangler deploy

# Deploy Ecosystem API (Idle RPG backend)
cd fff-ecosystem-api
npx wrangler deploy

# Deploy Admin API
cd fff-admin-api
npx wrangler deploy
```

### How Production Federation Works

The `vite.config.js` in `fff-platform` is **environment-aware**:
- `npm run dev` → remotes point to `http://localhost:500X`
- `npm run build` → remotes point to `https://fq-GAME.pages.dev`

This means dev and production use the same codebase with no manual URL switching.

---

## Production URLs

| Service | URL |
|---|---|
| **Platform** | `https://fq-platform.pages.dev` |
| **Player API** | `https://fff-api.wordpad.workers.dev` |
| **Ecosystem API** | `https://fff-ecosystem-api.wordpad.workers.dev` |
| **Admin API** | `https://fff-admin-api.wordpad.workers.dev` |
| FlashQuest RPG | `https://fq-placeholder-game.pages.dev` |
| Template Game | `https://fq-template-game.pages.dev` |
| Merger Game | `https://fq-merger-game.pages.dev` |
| Tower Defense | `https://fq-tower-defense-game.pages.dev` |
| Incremental | `https://fq-incremental-game.pages.dev` |
| RTS | `https://fq-rts-game.pages.dev` |

---

## API Reference

See [AGENTS.md](./AGENTS.md) for full endpoint documentation.

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| `POST` | `/api/auth/register` | No | Create account |
| `POST` | `/api/auth/login` | No | Log in, get JWT |
| `GET` | `/api/users/me` | Yes | Get profile |
| `GET`/`POST`/`DELETE` | `/api/users/friends` | Yes | Manage bookmarks |
| `GET` | `/api/decks` | No | List all decks |
| `GET` | `/api/decks/:id/cards` | No | Deck cards |
| `POST` | `/api/gacha/pull` | Yes | Summon cards |
| `GET` | `/api/study/due` | Yes | Due cards for review |
| `GET` | `/api/study/due-count` | Yes | Badge count |
| `POST` | `/api/study/preview` | Yes | Rating interval preview |
| `POST` | `/api/study/review` | Yes | Submit card review |
| `GET` | `/api/collection` | Yes | Owned cards |
| `GET`/`POST` | `/api/chat` | Mixed | Global chat |

---

## Contributor Guide

1. **Database schema** — Lives in `fff-api/schema.sql`. Both APIs share the same DB.
2. **API docs** — Each API has its own README. Keep in sync with code changes.
3. **API URL config** — Hardcoded in `fff-platform/src/utils/api.js`. Set to `localhost:8787` for local dev.
4. **Admin key** — Default `CHANGE_ME_IN_PRODUCTION`. Use `wrangler secret put ADMIN_KEY` for prod.
5. **Seed data** — `fff-api/seed.sql` (US States) and `fff-api/seed-es.sql` (English → Spanish).
6. **New games** — See [Creating a New Game](#creating-a-new-game) above.
7. **Game responsiveness** — See `games/RESPONSIVE_GUIDE.md` for container size constraints.
8. **Documentation** — Update this README, `AGENTS.md`, and per-project READMEs when making changes.
