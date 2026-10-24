# Verification record and release checklist

## Refactor review · 2026-10-24

Environment: Node 20.20.2, Vite 6.4.5, local in-app browser. No deployment or
remote repository mutation was performed for this refactor.

### Automated

`npm run check` passes: Prettier check, **24 Node tests**, production Vite build.
Tests include the original 15 geometry/choreography checks plus reader media
existence, template contracts, Unicode greeting additions, HTML escaping,
coalesced frame scheduling, visibility suspension, reduced-motion suppression,
after-paint navigation focus and reader pause/resume timing.

The scheduler tests use injected fake browser callbacks, not sleeps. They assert
that resume supplies zero elapsed time and long active gaps are capped to 0.1s.
They do not simulate a complete browser layout or replace the checks below.

### Browser checks actually performed

- Closed textured gate and greeting render; partial scroll opens doors while
  the beam is still hidden. Reverse scroll returns the doors to zero translation.
- Skip intro arrives at Profile and focuses its semantic section after rendering.
- Profile, Experiences and Projects readers open with the reader heading focused.
- Escape from Experiences restores the exact 1447px flight coordinate and its
  opening button. Projects’ bottom shrink control restores its opening button
  and 1901px coordinate at the 1280×720 viewport.
- SignWave Play switches the image to the GIF and the pressed state to true;
  Pause switches it back to the poster and false.
- Experience reader photo elements reported no failed loaded images.
- Final contact layout and four destination links remain present.
- No captured console warnings/errors in the final desktop session.
- Production preview on port 5176 loads the Projects checkpoint and opens its
  reader with correct heading focus; no captured warnings/errors in that smoke test.
- Compared computed width, height, padding, position, overflow, font size,
  display and background for eleven key elements at matching 1280×720
  baseline/refactor viewports: values matched.
- At a roughly 576×673 narrow pane, profile reader opens with no horizontal
  overflow. This is responsive desktop-browser coverage, **not touch-device QA**.

Independent senior review checked module ownership, preserved content, dialog
lifecycle and parsed CSS declaration equivalence. It caught and led to fixes for
navigation focus ordering, unnecessary scene rendering behind readers and
nested ambient throttling. The final review found no further concrete source
regression. Review is evidence, not a guarantee of bug-free behavior.

Screenshots from this session are retained in the workspace’s sibling
`outputs/refactor-review/` folder, outside the published site assets.

### Not established by this pass

- Real iOS/Android touch behavior, Safari/Firefox coverage or small-phone sizes.
- Visual reduced-motion layout on a device with that preference enabled (the
  scheduler suppression is unit tested; the alternate CSS layout is retained).
- Measured frame-time improvement, battery use or long-session memory behavior.
- Continued availability of third-party demo/profile URLs.
- Pixel equivalence for every selector, viewport and animated frame.

## Repeat before publishing

1. Run `npm ci` if dependencies changed, then `npm run check`.
2. Run `npm run preview` and test the generated production build.
3. Scroll slowly/quickly forward and backward; stop at doors and each orb.
4. Open/close each reader using pointer, keyboard and Escape. Check return focus.
5. Play/pause demo media; inspect every photo and external destination.
6. Test narrow phone and desktop widths, then a real touch device.
7. Enable reduced motion and confirm all content remains readable/reachable.
8. Use browser Performance tools while scrolling if stutter is reported. Measure
   long frames and image decode/layout work before adding speculative optimizations.
9. Review the feature branch and changelog; merge only the intended changes.
   Pages publication remains a separate manual workflow action.
