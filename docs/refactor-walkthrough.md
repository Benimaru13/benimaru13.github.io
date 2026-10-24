# What changed, why and how

## Before

`main.js` mixed scene setup, geometry, rendering, event listeners, frame clocks,
landing interactions and typing in one 639-line file. Reader files mixed long
personal content with lifecycle code and nested HTML strings. The README had
become a development diary, and the stylesheet accumulated design overrides.

This worked, but understanding or editing one feature required reading unrelated
features. Multiple scheduling paths also made timing and redundant work harder
to reason about.

## After

`main.js` connects small feature modules. `content/` contains things you edit as
the portfolio owner, `scene/` contains animation behavior, `ui/` contains inputs
and reading views, and `styles/` contains ordered presentation modules.

The refactor extracted existing behavior first, preserving geometry and tuning,
then simplified scheduling. Scroll/resize events now mark the scene as dirty.
One frame callback paints the latest scroll state; one capped ambient callback
adds drift and electrical propagation. Opening a reader pauses the scene and
closing it requests fresh geometry. Pure calculations stay independent of DOM
work so meaningful invariants can be checked with Node tests.

The HTML templates now use named helpers for chapters, photo collections,
project entries and media. Text escaping happens at the markup boundary. Your
existing copy, pictures and order remain authored data rather than being
rewritten during cleanup.

CSS was parsed, not split with fragile brace matching. Seventy-four earlier
unconditional declarations superseded by later identical selector/property
pairs were removed; conditional rules retained their order. The stylesheet was
then divided into ordered modules. A reviewer compared effective declarations,
and a browser comparison checked representative layout values against baseline.
Further consolidation should be accompanied by device checks, not guessed.

## Where to make your next edit

| You want to change… | Start here |
| --- | --- |
| Greeting languages | `src/content/greetings.js` |
| Full bio / experiences | `src/content/pages.js` |
| Project descriptions / links / demo files | `src/content/projects.js` |
| Hackathon / hobby photos | `src/content/gallery.js` |
| Brief preview text / contacts / share description | `index.html` |
| Door timing | `src/scene/gate.js` and `journey-math.js` |
| Beam shape or route math | `src/scene/lightning-geometry.js` |
| Browser animation scheduling | `src/scene/frame-loop.js` |
| Reader layout | `src/styles/readers.css` |

## What stayed deliberate

No React migration, backend, new service, runtime dependency, visible status
label or deployment was added. Existing section names already matched their
content in the starting worktree, so they were retained. Optional image
preparation scripts remain outside browser code. The main branch remains the
fallback; use the feature branch for review before merging.

The change log records stages and review corrections. Historical prototype notes
are archived rather than presented as current setup instructions. See
`verification.md` for what was tested and what still needs device testing.
