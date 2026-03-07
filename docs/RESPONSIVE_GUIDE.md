# Game MFE — Responsive View Guide

## Context

Each game runs inside a container panel in `GameView`. The container dimensions change based on orientation:

| Mode | Container Width | Container Height |
|---|---|---|
| Desktop landscape (1920×1080) | ~640px (1/3 of screen) | 100vh (~1080px) |
| Mobile landscape (812×375) | ~270px | 100dvh (~375px) |
| Mobile portrait (375×812) | 375px (full width) | ~45% of 812 = ~365px |

The container has `overflow: auto`, so if a game overflows it will scroll — but the goal is **no scrolling**.

## Requirements

1. **No fixed pixel dimensions for the root layout.** Use `width: 100%; height: 100%;` or flexbox to fill the container.
2. **Canvas-based games** (e.g., RTS) should read their container size and set canvas dimensions dynamically, or use CSS to scale:
   ```css
   canvas { width: 100%; height: auto; max-height: 100%; object-fit: contain; }
   ```
3. **DOM-based games** should use relative units (`%`, `vh`, `flex`, `min-h-0`) instead of fixed `px` heights.
4. **Font sizes** should scale: use `clamp()`, `vw` units, or responsive classes (`text-xs sm:text-sm`).
5. **The game root element** must fill its container:
   ```css
   .game-root {
       width: 100%;
       height: 100%;
       display: flex;
       flex-direction: column;
       overflow: hidden;
   }
   ```

## How to test

1. Build the game: `npm run build`
2. Serve it: `npx vite preview --port PORT --strictPort`
3. Run the platform: `cd fff-platform && npm run dev -- --port 5176`
4. Open `http://localhost:5176/game/deck-en-es?game=GAME_KEY`
5. Resize browser to these sizes and verify no scrolling is needed:
   - Desktop: 1920×1080
   - Landscape mobile: 812×375
   - Portrait mobile: 375×812

## Game keys and ports

| Game | Key (in URL) | Port | Directory |
|---|---|---|---|
| FlashQuest RPG | `placeholder` | 5001 | `games/placeholder-game` |
| Template | `template` | 5002 | `games/template-game` |
| Merger | `merger` | 5003 | `games/merger-game` |
| Tower Defense | `tower_defense` | 5004 | `games/tower-defense-game` |
| Incremental | `incremental` | 5005 | `games/incremental-game` |
| RTS | `rts` | 5006 | `games/rts-game` |

## Event interface

Games receive card review events via:
```js
window.addEventListener('flashquest:card-reviewed', () => {
    // Award in-game resources here
});
```

## Example fix (canvas game)

```jsx
// Before (fixed size):
<canvas width={580} height={420} />

// After (responsive):
const containerRef = useRef(null);
const [size, setSize] = useState({ w: 580, h: 420 });

useEffect(() => {
    const obs = new ResizeObserver(([entry]) => {
        const { width, height } = entry.contentRect;
        setSize({ w: width, h: height });
    });
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
}, []);

<div ref={containerRef} style={{ flex: 1, minHeight: 0 }}>
    <canvas width={size.w} height={size.h} />
</div>
```

## Example fix (DOM game)

```css
/* Before */
.game-root { width: 500px; height: 600px; }

/* After */
.game-root {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}
.game-section { flex: 1; min-height: 0; overflow: auto; }
```
