# EVAL_TODO

## UI/UX Polish
- [x] **Combo Visibility:** The "Combo 0/5" text below the Frenzy bar is too small. Increase visibility and add a subtle glow when progress is made.
- [x] **Era Theming:** Neolithic borders should be more earthy (`amber-900/40` is defined but looks too dark in screenshots). Adjust for better contrast on dark backgrounds.
- [x] **Expedition Buttons:** Style the "Start" buttons to use the theme's accent colors rather than generic white.
- [x] **Focus Burst Impact:** Add a more intense visual feedback (e.g., `animate-pulse` on the whole Fragments container) during Focus Burst.
- [x] **Empty States:** The "No Active Expedition" text is a bit generic. Make it more "flavorful" based on the current era if possible.

## Logic & Edge Cases
- [x] **Modal Persistence:** Verify that the `EraAdvanceModal` doesn't accidentally close if the user clicks outside or on the background (it should require the button click).
- [x] **Click Power Cap:** Ensure that large multipliers from expeditions don't cause UI overflow in the "Fragments / sec" display. (Verified: `formatNumber` and `truncate` used).

## Responsiveness
- [x] **Grid Layout:** In landscape mode, the Upgrades/Expeditions list should ideally occupy more width or adjust to avoid excessive vertical scrolling. (Verified: `max-h` and `overflow-y-auto` handles this).
