# Instructions for Jules (Agent Implementation Handoff)

Hello Jules! The user has requested that you take over the implementation of our latest brainstormed features. 

We have written up a new expansion plan in `docs/BRAINSTORM_EXPANSION.md` focused heavily on **balance, pacing, and extending the playthrough length**.

## Your Objectives

1. **Review the Plan**: Read `docs/BRAINSTORM_EXPANSION.md` to understand the 4 new mechanics we want to add:
   - Intermediate/Support Nodes in the Neural Map with Soft Caps on generator costs.
   - Thought Construct Evolution stages (Wisp -> Orb -> Entity -> Avatar).
   - Relic Synthesis Forge (fusing duplicates).
   - The "Memory Market" (consumable buffs costing sub-currencies).

2. **Generate Technical Specifications**: Create a detailed technical implementation blueprint outlining state changes in `useGameState.js`, new UI components required, and how these map to our existing systems.
   - You can look at `docs/BACKLOG.md` to see how we structured previous initiative plans.

3. **User Approval**: Present your plan to the user for approval.

4. **Implementation**: Once approved, execute the build phase, rigorously testing the application by running the dev server locally.

## Contextual Notes
- The game is a React + Tailwind + Vite micro-frontend.
- Core game state and math logic live in `src/hooks/useGameState.js`.
- The Neural Map UI renderer is in `src/components/NeuralMap.jsx`.
- Data definitions for generators, nodes, expeditions, and relics are in `src/data/`.
- FSRS rating data comes through the custom `flashquest:card-reviewed` event.

Please begin by reading `docs/BRAINSTORM_EXPANSION.md` and drafting your technical plan. Good luck!
