# Game Backlog

## Initiative 1: The "Thought Construct" (Tamagotchi/Habit System)
> Scope: Medium
> Vector: Consistency Incentives (Features)

### Feature Mechanics
We currently have a basic `streak` in `useGameState.js` that increments daily. We need to attach this to a visual "virtual pet" (The Thought Construct). 
- **Hunger System:** The construct has 3 states: `Starving`, `Hungry`, and `Sated`. 
- **Feeding:** Completing a flashcard review (with an event payload) "feeds" the construct. 15 reviews = `Sated`. 
- **Decay:** Every 24 real-world hours, hunger drops by one tier. If it hits `Starving`, the global `streak` multiplier breaks and resets to 0. 
- **Benefits:** A `Sated` construct provides a 2x bonus to all offline Fragment generation and a 1.5x bonus to Insight Gem drops.

### State Shape Changes
```json
// Add to INITIAL_STATE in useGameState.js
{
  ...
  "constructSatiation": 15, // Max 15, drops by 5 per day
  "lastFedTimestamp": null, // Unix ms
  "constructLevel": 1, // Optional: leveling up the pet
}
```

### UI/UX
- Add a floating UI element (perhaps replacing or modifying the `MilestoneBanner` area or sitting below the Clicker button) depicting a glowing orb.
- Orb color changes based on hunger: Red/Pulsing = Starving, Yellow = Hungry, Giant/Blue/Sparkling = Sated.

### Tasks
- [ ] Update `useGameState.js` INITIAL_STATE with `constructSatiation` and `lastFedTimestamp`.
- [ ] Modify the `calculateOfflineProgress` function to decay the `constructSatiation` based on time passed (loss of 5 points per 24h). Break the streak if it hits 0.
- [ ] Modify the FSRS event listener (`flashquest:card-reviewed`) to add +1 to `constructSatiation` (cap at 15) and update `lastFedTimestamp`.
- [ ] Update `useGameState.js` multiplier calculations: If satiation >= 10, apply the 2x offline and 1.5x Gem buffs.
- [ ] Create UI component `ThoughtConstruct.jsx` and render it in `App.jsx`.

---

## Initiative 2: FSRS Rating-Specific Resources
> Scope: Medium
> Vector: SRS Integration & Economy

### Feature Mechanics
Currently, `flashquest:card-reviewed` just gives generic Insight Gems (sometimes based on chance). We will parse `event.detail.rating` from the platform event.
- **Rating 4 (Easy) -> "Clarity Sparks"**: Used to buy Automation upgrades (e.g., auto-clickers).
- **Rating 2/3 (Hard/Good) -> "Focus Shards"**: Used to buy Active Clicker and Frenzy buffs.
- **Rating 1 (Again) -> "Resilience Cores"**: Used to buy "Shields" that protect your streak/construct from decaying for 24 hours.

### State Shape Changes
```json
{
  ...
  "claritySparks": 0,
  "focusShards": 0,
  "resilienceCores": 0,
  // Existing insightGems can remain as the premium currency for Epiphanies
}
```

### UI/UX
- Add a new row to the `ResourcePanel.jsx` component to display the 3 new sub-currencies with distinct icons/colors.
- Categorize `UpgradeItem.jsx` lists so it's clear which currency buys which upgrade.

### Tasks
- [ ] Update `useGameState.js` INITIAL_STATE with the three new resource integers.
- [ ] Update the event listener in `useGameState.js`: accept `e.detail.rating`. Map $R=4 \to$ Sparks, $R=2,3 \to$ Shards, $R=1 \to$ Cores. Add RNG or baseline drop amounts (e.g., base 1 drop + % chance for extra).
- [ ] Update `ResourcePanel.jsx` to render the new currencies.
- [ ] Refactor the upgrade data (e.g., `buyClickPower`, `buyInsightBurst`) to cost these specific sub-currencies instead of (or in addition to) generic Insight Gems. Look at `UpgradeItem.jsx` `costType` prop.

---

## Initiative 3: Active "Study Expeditions" 
> Scope: Large
> Vector: Content Depth

### Feature Mechanics
Replace or augment the current passive timer-based expeditions (in `expeditions.js`).
- To start an expedition, the player spends Fragments. 
- A 10-minute real-time timer begins.
- To "Win", the player must complete $X$ FSRS reviews (e.g., 30) before the timer expires.
- Winning yields a permanent "Relic" (e.g., "+0.5 base click scaling per Combo"). Failing yields a small Fragment refund.

### State Shape Changes
```json
{
  ...
  // Modify existing expedition state
  "activeExpeditionTarget": 30, // Cards needed
  "activeExpeditionProgress": 0, // Cards completed in this run
  "activeExpeditionEndTime": null, // Unix ms
  "relics": ["relic_id_1"] // Array of owned relic keys
}
```

### UI/UX
- The `ExpeditionPanel.jsx` needs a major UI overhaul to show a ticking countdown clock and a progress bar (e.g., "14/30 Cards Reviewed").
- Add a "Relics Inventory" tab or section to view passive bonuses.

### Tasks
- [ ] Define Relic objects and their mathematical effects in a new file `data/relics.js`.
- [ ] Update `useGameState.js` to handle starting an active expedition (setting end time and target).
- [ ] Modify the FSRS event listener to increment `activeExpeditionProgress` if a run is active.
- [ ] Add a `useEffect` tick in `useGameState.js` to check if `Date.now() > activeExpeditionEndTime`. If true, fail the run.
- [ ] Check win condition inside the FSRS listener. If `progress >= target`, award the specific Relic and end the run.
- [ ] Update `ExpeditionPanel.jsx` UI to reflect the active challenge state.

---

## Initiative 4: The "Mind Palace" Visual Refactor
> Scope: Large
> Vector: Visual Depth

### Feature Mechanics
Move away from a linear text list of upgrades in `App.jsx`. Represent unlocked generators and upgrades graphically.
- Generators function as "Nodes".
- Purchasing a generator physically adds a node to a visual canvas or absolute-positioned div container.
- Upgrading interconnected nodes (e.g., "Synergy" buffs) draws glowing lines between them.

### UI/UX
- Replace the right-hand `flex-1` upgrade scrolling list with a zoomed, draggable, or statically gorgeous "Map" view.
- Requires CSS node-graph styling (could use standard divs with `absolute` positioning or an SVG overlay for lines).

### Tasks
- [ ] Extract the upgrade list rendering logic from `App.jsx`.
- [ ] Create a `NeuralMap.jsx` component.
- [ ] Define X/Y coordinates for all generators in `data/generators.js` to plot them on the map.
- [ ] Draw the map background based on the current `Era`.
- [ ] Only render generator nodes if their unlock condition is met (or render them heavily obscured as "Undiscovered"). 
- [ ] Add visual polish: pulsing animations when a node is clicked or auto-generates.
