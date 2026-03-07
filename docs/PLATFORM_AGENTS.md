# FlashQuest — Agent Knowledge

> **⚠️ IMPORTANT: Keep this file and both README files (`fff-api/README.md`, `fff-platform/README.md`) updated when making any changes to the codebase.** This is the single source of truth for the project architecture and current state.

## Project Overview

FlashQuest is a gamified flashcard learning platform with spaced repetition. It consists of:

| Component | Path | Tech | Port |
|---|---|---|---|
| **fff-platform** | `fff-platform/` | React 19, Vite 5, Tailwind CSS 3.4 | 5176 |
| **fff-api** | `fff-api/` | Cloudflare Workers, D1, ts-fsrs | 8787 (local) / `fff-api.wordpad.workers.dev` |
| **Game MFEs** | `games/*/` | React, Vite, Module Federation | 5001 |

## Architecture

```
┌─────────────────────────────────────────────┐
│  fff-platform (Host MFE)                     │
│  ┌──────────────┐  ┌──────────────────────┐  │
│  │ Flashcard UI │  │ Game MFE (remote)    │  │
│  │ (FSRS review)│  │ or MockGame fallback │  │
│  └──────────────┘  └──────────────────────┘  │
│  Layout │ DueCountBadge │ GlobalChat          │
└─────────────┬───────────────────────────────┘
              │ REST API (JWT auth)
┌─────────────▼───────────────────────────────┐
│  fff-api (Cloudflare Worker)                 │
│  Auth │ FSRS Scheduling │ Gacha │ Chat       │
│  ┌──────────────────────────────────────┐    │
│  │  D1 Database (SQLite at the edge)    │    │
│  └──────────────────────────────────────┘    │
└──────────────────────────────────────────────┘
```

## Spaced Repetition (FSRS)

The SRS system uses the [ts-fsrs](https://github.com/open-spaced-repetition/ts-fsrs) library. Key design decisions:

- **4 rating buttons**: Again (1), Hard (2), Good (3), Easy (4) — NOT the old SM-2 quality 0–5 scale
- **Session queue**: Frontend maintains a main queue + learning queue. Cards rated Again/Hard while in Learning or Relearning state are re-queued and reappear within the same session after their FSRS-computed interval
- **Countdown timer**: When the main queue is empty but learning cards aren't due yet, a timer counts down
- **Interval preview**: Before each review, the frontend calls `POST /api/study/preview` to get interval labels for all 4 buttons (e.g., "1m", "6m", "2d", "4d")
- **Due count includes learning cards**: Both `due-count` and `remaining_due` count cards in Learning/Relearning state that are due within 20 minutes, preventing premature session completion
- **Completion reward**: 500 coins awarded when `remaining_due === 0` (enough for 5 summon pulls)

### FSRS Card States
| Value | State | Description |
|---|---|---|
| 0 | New | Never reviewed |
| 1 | Learning | Going through initial learning steps |
| 2 | Review | Graduated, on long-term schedule |
| 3 | Relearning | Failed a review, re-learning |

## Economy

| Action | Cost/Reward |
|---|---|
| Pull x1 | -100 coins |
| Pull x10 | -900 coins (10% discount) |
| Duplicate card refund | +25 coins |
| Complete all reviews | +500 coins |
| Starting balance | 500 coins |

## Key Files

### Backend (`fff-api/`)
- `src/index.js` — All route handlers (~525 lines)
- `src/router.js` — Lightweight request router with CORS
- `src/auth.js` — JWT + password hashing utilities
- `schema.sql` — Full database schema (DDL)
- `seed.sql` — US States & Capitals deck (50 cards)
- `seed-es.sql` — English → Spanish deck (30 cards)

### Frontend (`fff-platform/`)
- `src/pages/GameView.jsx` — Core study page with FSRS session queue
- `src/components/Layout.jsx` — Navigation with due count badge
- `src/utils/api.js` — All API client methods
- `src/context/AuthContext.jsx` — Auth state management
- `src/pages/Gacha.jsx` — Summon UI with animated card reveal

## API Endpoints Summary

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| `POST` | `/api/auth/register` | No | Create account |
| `POST` | `/api/auth/login` | No | Log in |
| `GET` | `/api/users/me` | Yes | Get profile |
| `GET` | `/api/users/friends` | Yes | List bookmarks |
| `POST` | `/api/users/friends` | Yes | Add bookmark |
| `DELETE` | `/api/users/friends` | Yes | Remove bookmark |
| `GET` | `/api/decks` | No | List decks |
| `GET` | `/api/decks/:id/cards` | No | Deck cards |
| `POST` | `/api/gacha/pull` | Yes | Summon cards |
| `GET` | `/api/study/due` | Yes | Due cards |
| `GET` | `/api/study/due-count` | Yes | Due count |
| `POST` | `/api/study/preview` | Yes | Rating intervals |
| `POST` | `/api/study/review` | Yes | Submit review |
| `GET` | `/api/collection` | Yes | Owned cards |
| `GET` | `/api/chat` | No | Chat messages |
| `POST` | `/api/chat` | Yes | Send message |
| `GET` | `/api/games/:gameId/state` | Yes | Load game state |
| `PUT` | `/api/games/:gameId/state` | Yes | Save game state |

## Deployment

```bash
# Backend
cd fff-api
npx wrangler@3.99.0 deploy

# Frontend (dev)
cd fff-platform
npm run dev -- --port 5176
```

Test credentials: `test` / `password123`
