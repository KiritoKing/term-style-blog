# Design: resilient shell interactivity

## Top bar controls

Render semantic buttons in Astro and register a single inline delegated handler. Initialize theme in the document head before first paint from safe persisted state, then `prefers-color-scheme`, with dark as the existing fallback. Keep the `dark` class, body font-mode classes, button titles, labels, `aria-pressed`, and storage keys. Re-synchronize state after Astro page swaps. Storage read/write exceptions are swallowed and controls keep operating in memory.

## Responsive terminal

Render one terminal island inside one native `<details>` element. It is collapsed on narrow screens and expanded on desktop. A `matchMedia` listener updates the open state at the existing 768px breakpoint while remembering the user's mobile disclosure state. One React panel means one hydration and one serialized post index per document.

## Storage resilience

Use typed safe read/write helpers for terminal state. Parse failures and storage access failures return an empty/default state; persistence remains best-effort. Navigation is not conditional on a successful storage write.

## Risks

- Astro ClientRouter swaps need state reapplication and event delegation must not accumulate listeners.
- A details-based single terminal must preserve mobile disclosure behavior, desktop placement, keyboard access, and commands through resize and history navigation.
- Head-script behavior must remain CSP-compatible with the project's existing inline JSON-LD; no new external dependency or unsafe HTML is added.
- Comparison results are environment-specific; no claim is made that they model every user's network.
