# VISION: Incremental Knowledge

## Identity
"Incremental Knowledge" is an idle/clicker MFE game running alongside the FlashQuest SRS platform. It provides a slow-burn, mathematically satisfying progression loop where active SRS study fuels the most valuable premium upgrades, while idle time generates the baseline resource.

## Target Experience
The player should feel like a multi-tasking genius. While they are actively building their real-world knowledge (via flashcards), they are simultaneously constructing a massive, automated digital brain (the game). The dopamine from answering a flashcard correctly is paired with a burst of game resources, creating a tightly coupled feedback loop. When they log in the next day, they should be greeted with a massive offline progress screen, making the start of every study session inherently rewarding.

## Core Design Pillars

1. **SRS is the Premium Currency:** Normal gameplay (clicking, idling) generates "Fragments". SRS reviews are the EXCLUSIVE source of "Insight Gems", which are required to buy the game's most powerful, permanent multipliers.
2. **Offline Dopamine:** The game is an idle game; therefore, it MUST reward the player for time spent away. Opening the flashcard app should feel like opening a treasure chest of accumulated offline resources.
3. **Active Study Frenzy:** Engaging in a rapid string of flashcard reviews should create a compounding "Frenzy" state, motivating the player to maintain their study focus and pacing without getting distracted.
4. **Endless Mathematical Depth:** The progression must last for months to map to a real-world study habit. This requires prestige mechanics, deep exponential scaling, and distinct paradigms of upgrades.
5. **Milestone-Driven Engagement:** Clear goals and achievements give the player concrete targets beyond "buy the next generator". Milestones map game progress to study milestones, creating a visible record of growth.

## Current State (Post v2 Build)

### What's Working
- **Advanced Core loop**: Multi-layer prestige (Epiphany, Enlightenment) provides months of progression.
- **Strong SRS integration**: Gems, Frenzy, and Rating-aware rewards create a tight study-game loop.
- **Automation Unlocked**: Enlightenment provides auto-clickers and auto-buyers, reducing late-game friction.
- **Milestone System**: Players have concrete targets and celebrated achievements.
- **Robust Architecture**: Extracted components and centralized state management in `useGameState`.

### What Needs Work
- **Visual Stagnation**: Despite component extraction, the UI remains a static list. It lacks "juice" and visual evolution over time.
- **Lack of "World"**: The game feels like a spreadsheet. There's no sense of place or exploration.
- **No Consistency Incentives**: While single sessions are rewarded (Frenzy), there's no long-term reward for studying every day (Streaks).
- **Static Content**: Once you unlock all generators, you're just waiting for numbers to go up. No dynamic events or mini-objectives.

## Strategic Filtering Rule
Any new feature proposed must answer the question: **"How does this make the player want to review more flashcards?"**
*If an idea only encourages leaving the browser open without studying, it must be redesigned or discarded.*
