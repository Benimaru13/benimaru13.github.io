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
