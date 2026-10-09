## ADDED Requirements

### Requirement: Body images SHALL progressively open in a native modal
The system MUST enhance unlinked `.prose-terminal` images with accessible buttons and a native modal on Baseline browsers. Original alt, title, source processing and lazy loading MUST remain intact; linked images and no-JavaScript content MUST remain readable and usable. A maintained lightweight pan/zoom dependency SHALL load only on first viewer activation.

#### Scenario: Open an unlinked body image
- **WHEN** a reader clicks or activates the image button with Enter or Space
- **THEN** the modal SHALL display that image and its title or alt caption without changing the original image attributes

#### Scenario: Preserve image links and unsupported browsers
- **WHEN** an image already belongs to a link or native command support is absent or JavaScript is disabled
- **THEN** the original image and link SHALL remain usable without nested or dead buttons

### Requirement: Modal viewing SHALL preserve keyboard and pointer accessibility
The system MUST provide an accessible dialog name, visible close control, native Escape, inert background and focus containment. All close paths MUST restore focus to the invoker. Pointer interaction inside the viewer MUST NOT dismiss it; a pointer gesture begun and ended on the backdrop SHALL close it without depending on `closedby`.

#### Scenario: Close and return to reading
- **WHEN** the reader uses Escape, the close button or a backdrop click
- **THEN** the modal SHALL close and focus SHALL return to the corresponding image button

### Requirement: Viewer SHALL fit both themes and mobile viewports
The system MUST reuse terminal panel/button styling, light blue and dark green, contain images within the viewport, keep caption and close control reachable, and prevent background document and terminal scrolling while open.

#### Scenario: View wide and tall images
- **WHEN** the viewport is desktop or 390 CSS pixels wide in either theme
- **THEN** images SHALL keep aspect ratio without viewer or page overflow and background scroll SHALL resume after closing

### Requirement: Astro navigation SHALL initialize the viewer exactly once per page
The system MUST support first load, `astro:page-load`, navigation away and back, and repeated open/close without duplicated controls/listeners or stale image state.

#### Scenario: Return to an article
- **WHEN** a reader navigates away from the article and returns, or page initialization repeats
- **THEN** each eligible image SHALL have exactly one invoker and the viewer SHALL open and close normally

### Requirement: Readers SHALL zoom and pan the original image
The viewer MUST support accessible zoom buttons, mouse-wheel focal zoom, mouse/touch drag and two-finger pinch using a maintained community gesture library. Scale MUST stay between the fitted view and five times that view, and the stage MUST clip transformed content. Reset MUST restore fit and centered position; resizing and opening another image MUST start from fit. Close and navigation MUST release gestures and pending initialization.

#### Scenario: Inspect an image detail on desktop
- **WHEN** a reader zooms by button or wheel and drags the image
- **THEN** magnification and translation SHALL change within bounded scale/pan, and reset SHALL restore the full fitted image

#### Scenario: Inspect on a touch screen
- **WHEN** two fingers spread or pinch, followed by one-finger dragging
- **THEN** image scale and position SHALL update without scrolling the background, and close SHALL return focus normally
