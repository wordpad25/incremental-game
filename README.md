# Incremental Game

This is an incremental idle/clicker game for the Flashcard Framework platform.

## Getting Started

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Run in Development Mode:**
   ```bash
   npm run dev
   ```
   This will start the Vite dev server with a standalone Mock Harness. Use the mock platform controls on the left to simulate application events (like card reviews), and build your game on the right.

3. **Building Your Game:**
   * Your game entry point is `src/App.jsx`.
   * Listen to platform custom events like `window.addEventListener('flashquest:card-reviewed', handler)`.
   * Add any game logic, assets, and styling here.

4. **Saving and Loading State:**
   The `fff-platform` exposes a `gameStateApi` via its `api.js` client, but since your game runs inside an iframe/federation, the simplest way to save state uses standard API calls (handled via JWT auth transparently).
   ```javascript
   // Assuming your game has imported gameStateApi from the platform host,
   // or makes an authenticated fetch to:
   // PUT /api/games/:gameId/state (Body: your JSON state object)
   // GET /api/games/:gameId/state (Returns: { state: {...} })
   ```

## Micro-Frontend Setup
The project uses Vite Module Federation. The `vite.config.js` is already pre-configured to expose the `./Game` module (which points to `src/App.jsx`). When you are ready to integrate your game into the main platform, ensure the main platform's remote configuration points to this module.

## Responsive Design
All UI and canvas elements must adhere to the [Responsive View Guide](../RESPONSIVE_GUIDE.md). Specifically, the game must scale dynamically to support both vertical (portrait) and horizontal (landscape) layouts without causing the container to scroll.
