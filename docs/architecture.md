# Architecture and maintenance

## Start here

Read `src/main.js` first. It creates one scene, one landing interaction controller
and one frame loop, then installs navigation, readers and decorative effects.
It is the composition root, not a place to add new rendering algorithms.

The project deliberately keeps plain JavaScript modules. Vite resolves imports,
serves local development files and bundles production output. Anime.js controls
the paused door timeline and small decorative tweens. No UI framework is needed
for this amount of content and interaction.

## Responsibility boundaries

| Directory | Owns | Must not own |
| --- | --- | --- |
| `content/` | Authored copy, preferred order, URLs and media records | DOM queries, listeners or animation clocks |
| `scene/` | Projection, flight geometry, scene state and rendering | Personal biography or reader markup |
| `ui/` | Input, navigation, dialogs and HTML templates | Camera travel formulas or independent journey progress |
| `styles/` | Appearance, responsive layout and reduced-motion presentation | Authored portfolio claims |

Within `scene/`, `journey-math.js` and `lightning-geometry.js` are pure functions:
the same inputs produce the same output without reading the browser. The other
scene modules adapt that math to DOM/SVG. Each renderer creates its own elements
once and updates them afterward. It does not install global scroll listeners.

## Inputs, state and rendering

1. Native scroll/resize events call `loop.invalidate()`; they do not paint.
2. The next animation frame reads scroll position and panel dimensions once.
3. `journey-scene.js` derives absolute progress and camera distance, then writes
   door, cloud, beam, orb and panel presentation.
4. At most about 30 times/second, the same scheduler requests ambient rendering.
   Electrical phase uses the performance clock; cloud drift uses bounded elapsed time.
5. Opening a full reader pauses this scene clock. Closing it restores the saved
   scroll position/focus and invalidates a fresh frame. Hiding a tab also pauses it.

Checkpoint navigation requests a paint and queues focus **after** that paint.
A hidden checkpoint cannot accept focus; the ordering is covered by a test.

Cursor electricity and character electricity remain separate effects because
their lifetimes differ from the journey. They are bounded and respect reduced
motion; the character effect also stops when its artwork is offscreen. They are
not a second source of camera/door progress. Anime.js also owns its internal
scheduler for its small tweens; “one loop” refers to journey coordination.

## Coordinate systems and invariants

- **World:** fixed x/y/z cloud positions and forward-in-z beam route knots.
- **Screen:** perspective projection into viewport pixels; near-plane objects
  are culled rather than allowed to divide by zero or invert behind the camera.
- **Scroll:** normalized 0..1 progress; checkpoint times are in `CHECKPOINTS`.
- **Electrical phase:** elapsed seconds; deforms the ribbon without advancing it.

Door opening ends before the beam becomes visible. The beam and orbs share route
targets so arrival is geometric contact. The wake is resampled in projected arc
length, capped in length/point count, and extended beyond the viewport to hide
its source. Bounded normal displacement prevents zigzag bundles near an orb.
Branches grow/drain along channels rather than rotating rigid fork icons.

Orb charging is a pure function of progress, not a remembered “visited” flag.
Reversing before contact therefore restores gold consistently. Doorway cloud
phase combines signed scroll change with very slow bounded idle drift; returning
to the closed gate resets it. Ambient drift is intentionally not an exact replay
of absolute scroll time.

## Reading views and trusted content

`content/pages.js` stores full profile and experience sections as
`[heading, text, photoKeyOrNull]`. Null deliberately produces text-only layout.
`content/projects.js` holds project objects and explicit display order.
`content/gallery.js` holds `[filename, alt, caption]` photo lists.

Pure template functions escape authored text before inserting markup. Content is
trusted local source, not a remote CMS. Escaping is not a URL validation policy;
review external URLs when editing records. Native `<dialog>` supplies modal
focus containment and Escape behavior; the controller owns scroll restoration.

Preview excerpts remain in `index.html`, separate from full-reader content.
This permits shorter summaries. Changing the biography may require changing both.

## Styles and accessibility

`styles/index.css` defines import order. The five modules preserve the original
cascade order, including mobile and reduced-motion rules alongside the features
that need them. Seventy-four superseded unconditional declarations were removed;
conditional rules and deliberate fallbacks were retained. Some cross-module
refinements remain because flattening the cascade further would be a separate
visual change requiring broader device comparison.

Reduced motion uses ordinary content flow, not a frozen inaccessible scene.
Native scrolling and the cursor remain intact. Do not intercept wheel/touch
input to make timing look more uniform; visitors need control and time to read.

## Extending the site

For a new project, edit data rather than renderer code. For a new animation,
first decide whether its input is scroll or time, then add it to the owning
renderer. Keep pure calculations separate from DOM updates when they have
meaningful geometric/timing invariants to test. Avoid a general-purpose engine,
state library or component framework until actual complexity requires one.

Do not put developer status labels on the public page. Document internal work in
`CHANGELOG.md`. Preserve authored order and wording during structural changes.
