## ADDED Requirements

### Requirement: Top bar controls work without waiting for React hydration
The system MUST render theme and accessibility mode controls that respond through native browser event handling without requiring a React island, preserve their accessible labels and current visual states, persist preferences when storage is available, and reapply current preferences after Astro navigation.

#### Scenario: Use controls before other page islands initialize
- **WHEN** the document is parsed and the top bar controls are available
- **THEN** theme and accessibility mode changes MUST update the document immediately without waiting for React hydration
- **THEN** button labels, titles, and pressed state MUST describe the current mode

#### Scenario: Keep preferences across navigation
- **WHEN** a user changes theme or accessibility mode and navigates through Astro ClientRouter or browser history
- **THEN** the current preference MUST be applied on `astro:after-swap` before the swapped DOM is painted
- **THEN** controls MUST continue to respond after navigation

### Requirement: Only one responsive terminal panel is initialized
The system MUST render and initialize one TerminalPanel per page while preserving desktop visibility, the mobile disclosure control, existing commands, and behavior when the viewport changes.

#### Scenario: Switch between mobile and desktop layouts
- **WHEN** the viewport crosses the shell's responsive breakpoint
- **THEN** the same terminal instance MUST remain functional
- **THEN** desktop MUST show the panel and mobile MUST provide a usable collapsible terminal control

#### Scenario: Preserve terminal disclosure across navigation
- **WHEN** a user navigates through Astro ClientRouter with the terminal expanded on mobile or visible on desktop
- **THEN** the new terminal panel MUST restore the corresponding open state on `astro:after-swap` before the swapped DOM is painted

### Requirement: Storage failures do not block shell interactions
The system MUST treat localStorage reads and writes as best-effort and MUST keep theme/accessibility controls, terminal commands, and command-driven navigation usable when storage is denied, unavailable, corrupt, or full.

#### Scenario: Browser denies storage access
- **WHEN** localStorage access throws during a preference or terminal command action
- **THEN** the action MUST still update in-memory UI state or complete navigation
- **THEN** the page MUST NOT surface an uncaught error

#### Scenario: Stored terminal state is corrupt
- **WHEN** terminal history or output contains invalid serialized data
- **THEN** the terminal MUST start with its default state and remain usable
