# Development log

Append new dated entries here. Record the problem, change, reason and validation;
keep user-facing portfolio copy out of developer status updates. Do not rewrite
past entries to imply checks were performed when they were not.

## 2026-10-24 — Code organization refactor

Branch: `refactor/codebase-organization`. Main was left untouched. Existing staged
and unstaged user edits were retained. A temporary pre-refactor source snapshot
was used for comparison; historical notes below are preserved in the repository.

### 1. Baseline and boundaries

- Baseline: 15 Node tests and production build passed before source extraction.
- Kept the current HTML, authored copy, photo choices, section IDs and choreography.
- Retained Vite and Anime.js; no framework, service or runtime dependency added.
- Included the existing untracked share-preview image referenced by the user’s
  metadata, so a checkout of this branch also contains that required asset.

### 2. Module extraction

- Reduced `main.js` from 639 lines to a small composition root.
- Split gate timeline, clouds, beam and scene coordination into `src/scene/`.
- Moved pure journey/lighting calculations into that directory with descriptive
  names; updated tests and all static/dynamic imports.
- Moved interactions and reader lifecycle into `src/ui/`.
- Extracted biography, projects, greetings and gallery records into `src/content/`.
- Replaced deeply nested reader/project markup expressions with named helpers;
  shared HTML escaping now covers reader text and project attributes.

### 3. Rendering and critic corrections

- Coalesced scroll input into a single journey frame scheduler, with a single
  ambient update cap and bounded elapsed time after suspension.
- Removed the separate greeting interval; typing uses the shared ambient clock.
- Paused scene geometry while a full reader is open; resume invalidates layout.
- Independent senior critic caught a focus ordering regression introduced by
  deferred paints. Navigation now focuses only after the section becomes visible.
- Critic also identified duplicate ambient throttling and background scene work;
  both were corrected. Regression tests cover the scheduler contracts.
- Final critic review also strengthened the resume test to assert actual delta
  values, rather than merely asserting that an ambient callback occurred.

### 4. CSS and documentation

- Split the 2,104-line stylesheet into five ordered modules and an import entry.
- Removed 74 superseded unconditional declarations without moving conditional
  rules or changing effective last declarations. Critic independently compared
  parsed declaration maps; no changed/missing/new effective declarations found.
- Replaced the iteration-heavy README with setup, file ownership, editing,
  accessibility and deployment information.
- Archived the original README/architecture notes in `docs/history/` rather than
  losing the development record. Updated photo/project guides to current paths.
- Added architecture and verification guides, formatting check and combined check.

### Validation

See `docs/verification.md` for the current test/build results, actual browser
checks and untested device coverage. A successful build is not a smoothness claim.

## Earlier prototype iterations (preserved)

The former README is preserved verbatim in `docs/history/prototype-iterations.md`.
The previous architectural narrative is in `docs/history/animation-notes.md`,
and artwork prompts are in `docs/history/asset-prompts.md`. These contain the
recorded gate, cloud, beam, orb, character and performance iterations. Some notes
are superseded; current documentation describes the active implementation.

## 2026-10-24 — Resume-style experience entries

- Converted all six existing experience sections to named records containing
  organization, role, dates, duties, photo key and skills.
- Split existing first-person descriptions at sentence boundaries into duty
  bullets; preserved photo assignments, ordering and user-authored skill choices.
- Added supported skill labels for remaining roles; corrected XD Hacks' copied
  youth-coordinator skill list to logistics/coordination/debugging skills.
- Kept Falcon dates April–May 2026 at the user's explicit preference.
- Scoped Georgia role text, italic dates, duty spacing and wrapping skill labels
  to experience entries; photo-free roles retain the full-width layout.
- Profile prose and the user's copy-email implementation remain in place.
- Validation: existing 24 tests and production build pass; desktop browser
  inspection confirms structured headings, lists and skill labels render.

## 2026-10-24 — Experience tiles follow the user's sketch

- Replaced the experience-only template with four explicit rows: organization /
  position, left location / right italic dates, duties / square photo, and
  full-width skills. Removed the redundant per-tile EXPERIENCE label.
- Used Georgia throughout experience tiles; profile and project typography is
  unaffected. On narrow screens the heading and body columns stack.
- Standardized role-photo frames to the same square size at a given viewport.
  `object-fit: cover` crops presentation only; clicking opens the original.
  Optional `photoPosition` in the experience record adjusts a crop.
- Added available location / work-arrangement values from the saved LinkedIn
  experience PDF. Freelance location remains unspecified. Ethos currently uses
  the source's broad “North America · On-site” rather than guessing a city.
- Validation: 26 tests and production build pass. Desktop browser inspection
  confirms the square Ethos crop, aligned metadata and full-width skills.

## 2026-10-24 — Approved XD Hacks duties and flexible headings

- Shortened the approved display heading to Thrive-4-Blacks.
- Applied only the four user-approved XD Hacks duty bullets; other duties remain
  unchanged pending review of new drafts.
- Replaced the equal-width header grid with wrapping Flexbox so organization
  names can claim their natural width and positions move below when necessary.
  Desktop titles remain single-line; phone titles can wrap for legibility.
- Updated the Falcon date assertion to tolerate the user's edited company name.
- Validation: all 26 Node tests and the production build pass using the bundled
  Node runtime (npm/npx were unavailable in this shell). New layout not visually
  verified during this iteration.

## 2026-10-24 — Approved STAR-style experience copy

- Applied the reviewed STAR-style duty bullets to all six existing roles.
- Preserved the user's exact interactive-stations sentence for Ethos Lab.
- Thrive now emphasizes supporting program organization/execution, scholarship
  and grant presentations, cultural-event volunteering and land acknowledgements.
- Kept all headings, dates, locations, photos, skills and layout unchanged.
- Validation: 26 Node tests and production build pass. This is a content update;
  no new visual browser verification or deployment performed in this iteration.

## 2026-10-24 — Project contribution lists, skills and real-media album

- Added a floating three-frame project preview album using existing LeSafety,
  SignWave poster and SPEAK Up BC assets. Reused bounded album styles and their
  reduced-motion behavior; the preview does not load or autoplay the large GIF.
- Added STAR-style contribution bullets and skills to all five project records,
  based on existing copy and the supplied technical resume. Preserved grouping,
  authored order, destinations, media controls and text-only in-progress handwriting.
- Rendered skills beneath both project columns with Georgia typography.
- Validation: 27 tests and production build pass; desktop browser inspection
  confirms the album, contribution lists, skills and retained demo control.

## 2026-10-24 — Project layout alignment and preview radius control

- Split project cards into full-width title/date, duties/media body and skills
  rows, matching the experience cards' hierarchy where applicable.
- Centered project media and text vertically within the body grid; preserved
  complete screenshots, the GIF control, and the single-column handwriting entry.
- Added documented `--preview-radius` in foundation.css, used by `.checkpoint`
  for the three main preview cards. Default remains 0px for the user to tune;
  no overflow clipping was added that could cut off the floating albums.
- Validation: 27 tests and production build pass; desktop browser inspection
  confirms the revised SignWave card and centered body alignment for all projects.

## 2026-10-24 — Local-only Git exclusions

- Ignored exploratory art, work/research, scratch and private folders, local
  environment files, logs, coverage output and Python caches.
- Kept website assets, source, tests, documentation and preparation scripts
  eligible for version control. `.gitignore` does not untrack existing files.
