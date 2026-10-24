# Chibueze Benneth · Portfolio

A personal portfolio that begins at painted wooden gates, travels through a
cloud corridor, and introduces Chibueze’s profile, experiences and projects.
Visitors can open full reading views and finish at the contact section.

Built with **plain HTML, CSS and JavaScript**, **Vite 6** and **Anime.js 3**.
There is no application framework, backend, database, analytics or runtime API.
Artwork and photographs are served locally. Contact links lead to external sites.

## Run locally

Use Node.js 20.19+ (this refactor was checked on 20.20.2) or a compatible newer
Node release, with npm. Run commands from the folder containing this README.

```sh
npm ci
npm run dev
```

Open the localhost URL Vite prints. Saving source files updates that preview;
it does not publish the website.

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local development server. |
| `npm test` | Test scene geometry, scheduling and content/media contracts. |
| `npm run build` | Create the production website in `dist/`. |
| `npm run preview` | Preview the latest production build locally. |
| `npm run format` | Format application source and tests with Prettier. |
| `npm run format:check` | Check formatting without editing files. |
| `npm run check` | Run formatting checks, tests and production build. |

## Find your way around

```text
index.html                 Landing markup, previews, contact and sharing metadata
src/
  main.js                  Entry point: connects the features and starts the clock
  content/                 Editable copy, greetings, project records and photo lists
  scene/
    frame-loop.js          Coalesces scroll input and schedules ambient rendering
    journey-scene.js       Coordinates doors, camera, orbs and preview visibility
    gate.js                Paused Anime.js door-opening timeline
    clouds.js              Doorway transport and perspective cloud placement
    beam.js                SVG beam, route targets and speed indicators
    journey-math.js        Pure camera, projection and checkpoint calculations
    lightning-geometry.js Pure route, zigzag, branch and orb-charge calculations
  ui/
    landing.js             Click-to-reveal door hint and typed greeting updates
    typing.js              Pure typing-cycle calculation
    navigation.js          Checkpoint anchors and keyboard focus
    reading-view.js        Dialog opening, closing and scroll/focus restoration
    reader-template.js     Full profile/experience page markup
    project-view.js        Project markup and explicit GIF play/pause controls
    electric-effects.js   Cursor trail and stationary character sparks
    html.js                Text escaping at template boundaries
  styles/
    index.css              Explicit stylesheet import/cascade order
    foundation.css         Base layout, gate and foundational responsive rules
    journey.css            Cloud-flight, orb and contact layout
    atmosphere.css        Gate lighting, foreground clouds and cloud apertures
    effects.css            Electrical effects, painted hint and typing cursor
    readers.css            Reading views, preview cards, albums and project media
public/assets/             Published images, textures, SVG lettering and photos
scripts/                   Optional artwork preparation; not browser code
tests/                    Node’s built-in test runner; no test framework dependency
docs/                     Architecture, editing, deployment and verification guides
CHANGELOG.md              Append-only development/refactor record
```

`dist/` and `node_modules/` are generated/installed directories and are ignored.
`art-history/`, if present locally, holds exploratory artwork and is not runtime
input. It is excluded from the Pages artifact, which contains only `dist/`.

## How the animation works

The browser keeps native scrolling. A sticky scene occupies the viewport while
scroll position maps to a normalized journey progress from 0 to 1. That value
seeks the paused door timeline and determines camera distance, beam travel,
orb charging and preview expansion. Scrolling backward reverses those states.

Elapsed time adds cloud drift and electrical propagation; it never moves the
visitor forward. The main scheduler combines scroll events into one geometry
paint per display frame and caps ambient updates at about 30 per second.
It pauses in hidden tabs and while a full reader is open. Decorative cursor and
character effects have their own bounded, visibility-aware lifetimes.

The flight is projected 3D math rendered with image layers and SVG, not a WebGL
scene or fluid simulation. Read [the architecture guide](docs/architecture.md)
for ownership, state flow and the geometry constraints that prevent tangles.
For a plain-language before/after explanation, read the
[refactor walkthrough](docs/refactor-walkthrough.md).

## Make common edits

- **Greeting languages:** `src/content/greetings.js`. Add a language/text pair;
  the cycle automatically uses the list length.
- **Full biography and experience roles:** `src/content/pages.js`.
- **Projects, repository links and demo media:** `src/content/projects.js`.
- **Hobby/hackathon photo collections:** `src/content/gallery.js`.
- **Short preview blurbs and contact links:** `index.html`.
- **Door hint text:** `.door-hint` elements in `index.html`; appearance in
  `src/styles/effects.css`.
- **Link-sharing title/description/image:** metadata inside `index.html`’s head.

Preview and full-reader copy intentionally live in separate places so a short
excerpt can differ from the longer story. See [photos](docs/photos.md) and
[projects](docs/projects.md) for editing examples.

## Accessibility and checks

Native keyboard/touch scrolling, a skip link, named checkpoint links and native
dialog focus containment are retained. Escape or either reader return button
restores the flight position and opening control. Reduced-motion preferences
show content in normal reading flow and disable decorative travel and sparks.

Tests verify important invariants; they do not establish visual smoothness on
all devices. Use the [verification checklist](docs/verification.md) for browser
checks and remaining device coverage. Large photographic assets and the optional
SignWave GIF still affect download/decode cost; the GIF starts as a still poster.

## Deployment and development history

Production hosting is [GitHub Pages](https://benimaru13.github.io/).
The Pages workflow remains manual: pushing a branch does not run that workflow.
Only its built `dist/` artifact is published. Follow [deployment instructions](docs/deployment.md).

Start with [CHANGELOG.md](CHANGELOG.md) for current work. Earlier prototype notes
are preserved under `docs/history/` as historical records; they may describe
superseded designs. Current architecture and editing guides take precedence.
Third-party artwork retains its owners’ rights; dependency licenses do not grant
rights to supplied character artwork or photographs.
