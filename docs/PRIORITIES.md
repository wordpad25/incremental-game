# Development Priorities: Incremental Knowledge

## 1. The "Thought Construct" (Tamagotchi/Habit System)
* **Addresses:** Consistency Incentives & Content Depth
* **Scope:** Medium
* **Description:** Implement a digital companion (e.g., a "Memory Engram") that acts as the game's streak mechanic. It requires daily feeding via completed FSRS reviews. If fed, it grants escalating global multipliers. If neglected (a skipped day), it "starves" and drops its multipliers, breaking the streak.
* **SRS Link:** Uses psychological attachment to enforce daily study habits; a missed day means a visually sad companion and a massive loss in offline resource generation.

## 2. FSRS Rating-Specific Resources
* **Addresses:** Mechanic Balancing & SRS Integration Quality
* **Scope:** Medium
* **Description:** Refactor the `flashquest:card-reviewed` event listener to process the specific FSRS rating (`1: Again`, `2: Hard`, `3: Good`, `4: Easy`). Introduce 3-4 new sub-currencies dropped based on these ratings (e.g., "Clarity Sparks" for easy cards, "Resilience Cores" when recovering from an 'Again' rating).
* **SRS Link:** Makes the *quality* and *struggle* of studying mechanically meaningful. It softens the blow of forgetting a card by rewarding the player with a unique "recovery" currency.

## 3. Active "Study Expeditions" & Relics
* **Addresses:** Static Content (Content Depth)
* **Scope:** Large
* **Description:** Overhaul the passive Expedition system into an active one. Players start an expedition and have a short real-world timer (e.g., 10 minutes) to review a target number of cards. Success yields unique, equippable "Eureka Artifacts" or "Relics" that fundamentally alter game rules (not just flat multipliers).
* **SRS Link:** Provides a burst of intense, goal-oriented study motivation. Players will push themselves to complete "just 10 more cards" to secure the dungeon loot.

## 4. The "Mind Palace" Visual Refactor & Tech Tree
* **Addresses:** Visual Stagnation & Lack of World
* **Scope:** Large
* **Description:** Refactor the UI to include a visual "world" representation—a branching neural network. Move away from a linear list of generators and into an expansive, branching upgrade tree where players must commit to specific "builds" (e.g., Scholar for idle, Overclocker for active clicks).
* **SRS Link:** Gives the player a massive, visual sandbox to spend their SRS-exclusive currency. The game becomes a true reflection of their long-term learning journey.
