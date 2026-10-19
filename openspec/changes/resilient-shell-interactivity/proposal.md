# Proposal: resilient shell interactivity

## Why

Static page content is ready before the `client:load` React islands finish hydrating. This leaves the theme/accessibility controls temporarily unresponsive, and the desktop and mobile layouts both hydrate a terminal even though only one is active. A denied or full `localStorage` can also interrupt user actions.

## What Changes

- Replace the top bar React island with small inline, delegated native controls while preserving labels, state, persistence, and Astro navigation behavior.
- Render and initialize one responsive terminal panel, keeping mobile collapse and desktop visibility.
- Make terminal and control state persistence best-effort when storage is unavailable.
- Add focused unit and browser regression tests, plus reproducible before/after interaction and resource measurements.

## Out of scope

- Dependency changes, visual redesign, unrelated page/island optimizations, and changes to publication content or workflow policy.
- Claiming the changes fix all network-related slowness; measurements only characterize this browser/environment and the tested site.
