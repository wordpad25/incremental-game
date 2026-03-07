# Game Backlog

## Initiative 1: Thematic Eras & Visual Evolution
> Scope: Medium
> Vector: Content Depth / Visual Feedback

### Feature Mechanics

The game is divided into 5 "Eras". Each Era is unlocked by reaching a specific production threshold AND a study requirement.

| Era | Name | Threshold | Study Req | Theme |
|---|---|---|---|---|
| 1 | Neolithic | 0 FPS | 0 cards | Sepia / Stone |
| 2 | Industrial | 100 FPS | 25 cards | Grey / Iron |
| 3 | Atomic | 10k FPS | 100 cards | Green / Uranium |
| 4 | Digital | 1M FPS | 500 cards | Blue / Silicon |
| 5 | Galactic | 1B FPS | 1,000 cards | Purple / Gold |

**How this makes the player study more:** Reaching the economic goal (FPS) isn't enough; you must also satisfy the "knowledge" requirement (card reviews) to evolve the game world.

### Tasks
- [x] Create `src/data/eras.js` with era definitions.
- [x] Add `era` and `cardsReviewedInEra` to `useGameState` state.
- [x] Implement `checkEraAdvancement()` to notify and apply new era.
- [x] Add `advanceEra` action to handle the transition.
- [x] Update `App.jsx` to apply era-specific CSS classes to the root container.
- [x] Add an "Era Advancement" celebratory modal/banner.

---

## Initiative 2: Research Expeditions (Map System)
> Scope: Large
> Vector: SRS Integration / Content Depth

### Feature Mechanics

A new "Expeditions" tab allows players to send their idle researchers on missions. Unlike passive generation, expeditions only move when the player reviews cards. 1 card = 1 step.

**Initial Expeditions:**

| ID | Name | Steps | Reward |
|---|---|---|---|
| `exp_1` | The Rosetta Stone | 20 | Permanent +5% Gems from reviews |
| `exp_2` | The Silk Road | 100 | -5% Upgrade Costs |
| `exp_3` | Apollo 11 | 500 | +20% click power |

### Tasks
- [x] Create `src/data/expeditions.js`.
- [x] Add `activeExpedition`, `expeditionProgress`, and `completedExpeditions` to `useGameState`.
- [x] Create `ExpeditionPanel.jsx` component.
- [x] Add a "Tabs" system to the UI (Upgrades / Expeditions).
- [x] Implement "Waypoint reached" logic and rewards.

---

## Initiative 3: Study Streaks & Mastery Combos
> Scope: Small
> Vector: SRS Integration Quality

### Tasks
- [x] Add `streak` (days) and `lastStudyDate` to state.
- [x] Add `comboCount` to track consecutive "Easy" ratings.
- [x] Implement "Focus Burst" (10s of 2x production) triggered by 5-count combo.
- [x] Add visual "Combo Counter" next to the Frenzy bar.
- [x] Add "Streak" icon to the header.

---
## Completed Initiatives

- [x] Milestone & Achievement System
- [x] Rating-Aware SRS Rewards
- [x] Player Stats Panel
- [x] Codebase Refactor
- [x] Prestige Layer 2 (Enlightenment)
