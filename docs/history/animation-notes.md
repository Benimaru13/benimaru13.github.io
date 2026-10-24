> Historical record, preserved from before the 2026-10-24 refactor. Paths and
> implementation details may be superseded. See the current README and architecture guide.

# Animation maintenance guide

## Ownership and clocks

- `src/main.js` owns DOM layers, the paused Anime.js door timeline, native scroll mapping, perspective projection and the render clock. Scroll controls travel. Elapsed time supplies only ambient drift and electrical propagation.
- `src/journey.js` contains pure camera, projection, checkpoint and signed cloud-motion math. Content panel timing is preserved.
- `src/lightning.js` contains the shared world route, projected wake resampling, propagating discharge branches, scroll-pure orb charge and doorway cloud masking.
- `src/style.css` controls compositing and responsive/reduced-motion presentation. Later rules contain visual refinements from prototype iterations. Run `npm run format` after edits.

## Spatial flight and living electricity

`flightRoutePoint` banks in x/y while moving forward in z. Both the head and the wake use this same world route; moving only the head while drawing a straight diagonal wake was the rejected earlier version. Each leg sweeps around a cloud bank and ends exactly at the next orb. The camera approaches independently using the existing camera-distance curve, so apparent turn size changes with depth.

The wake is sampled in world depth, projected, then **resampled in screen arc length** (about 62 pixels). Only 1,900 pixels of the recent projected wake are retained, with a maximum of 37 centerline vertices. This prevents perspective from packing dozens of bends into a tiny orb-side bundle. An incoming tangent extension keeps the source offscreen. Local normal displacement is capped at 26 pixels and also bounded by sample spacing. This is a lightweight projected 3D illusion rendered with SVG, not a WebGL scene.

Electrical phase travels toward the head while scroll is idle. Short branches progressively grow from root to kink to tip, then drain from the root; spatially staggered phases make propagation visible instead of scaling rigid forks together. All three beam strokes share geometry to avoid gaps. No repeated flash/strobe is used.

## Orb red wash

`orbCharge(progress, at)` shares the existing arrival threshold (`at - .065`) and fills over .04 of journey progress. It returns a smooth 0..1 value with no stored visited state. Thus visited milestones remain red after departure, and scrolling before contact restores gold exactly. A soft radial mask spreads the red overlay from the incoming route tangent. Gold haze drains as the red charge fills. The orb remains partly visible behind the content expansion; the panel's existing transition is otherwise unchanged.

## Cloud and light repairs

The existing cloud artwork is preserved. Doorway sprites use an alpha gradient instead of a hard rectangular crop. A narrow feathered seam and radial backlight replace the broad rectangular light shadow; both disappear with the gate. The sticky scene uses `overflow: clip` so focusing a checkpoint cannot internally scroll its layers and expose a straight background boundary.

## Supplied character asset

`public/assets/luffy-selected.png` comes from the user's latest 564×564 image. Only border-connected neutral white was made transparent. Character colors and pose were preserved, with no generated pixels. Reproduce with `scripts/prepare-supplied-art.py SOURCE OUTPUT` using Python and Pillow. This is optional asset preparation, not a website runtime dependency.

## Verify locally

Run `npm install`, `npm run dev`, then open the localhost URL printed by Vite. Run `npm test` and `npm run build`. Geometry tests cover route contact, projection spacing, phase changes, branch lengths and reversible orb charge. Visually review partial opening, forward/reverse cloud travel, idle electrical propagation, and all checkpoints. Reduced motion presents readable content without flight. No deployment or external API is required.

## Approach diversity and decorative electricity

Flight legs now have explicit lift, skew, sway and lean profiles. The first orb receives an overhead dive, the second an upward climb, and the third an oblique low bank. Test the **incoming tangent**, not only midpoint altitude: a strong skew can curl an apparently low route overhead at its last moment. Lean gives the final bank a lateral arrival component. A minimum chord filter removes near-duplicate points straddling tight projected turns before electrical displacement.

`src/electric-effects.js` owns the connected cursor trail and contact artwork electricity. Cursor segments share exact endpoints and fade by age over 650ms; at most36 groups exist, with three aligned strokes each. Coarse pointers, touch, tab hiding and reduced motion suppress/clear the trail. Accepted pointer samples are retained through throttling, preventing dotted gaps.

The character, silhouette tint and rear/front SVGs share one floating square rig. Three tilted partial orbits split by depth create strands passing behind and in front of the supplied cutout. Slow staggered envelopes create local surges rather than hard flashes. IntersectionObserver and document visibility stop rendering outside the visible contact scene; reduced motion removes the effect. Rig sizing is capped at560px and corners use a modest miter limit to prevent needle spikes. Scroll and ambient beam renders use the same performance clock so scrolling cannot reset the electrical phase.

The independent critic reviewed source and a desktop contact screenshot, and added arrival-angle regression checks. That review is not a mobile or live-motion certification.

### Anchored charge refinement

The contact effect now uses six authored discharge sites around hair, shoulder,
waist, raised leg, lower leg and sash. It supersedes the earlier partial-orbit
model described above. Endpoints remain fixed in artwork coordinates; interior
vertices deform by only2–3 pixels. Independent smooth envelopes pulse each site
in and out, producing a charged coating without rotational travel. Existing
shared float, visibility gating, reduced-motion behavior and cursor effect remain.

### Landing guidance and multilingual greeting

Door clicks reveal gold text split across the two physical panels for roughly
one second, then fade it. The hint moves with its parent panel and uses the
existing paint-grain filter. Clicking does not advance the gate. Reduced motion
shows the hint persistently. Japanese door lettering now loads through SVG image
elements with selection and dragging disabled; its painted treatment remains.

The greeting cycles English, Japanese, Igbo, French and Mandarin in three-second
slots, with typing, a hold and brief erasure. A stable English accessible heading
prevents per-character announcements. Reduced motion retains static English;
the animated span carries the current language tag. The name remains Chibueze.

### Scroll performance pass

Panel layout measurements are gathered before scene style writes, avoiding
per-panel read/write layout thrashing. The door timeline is sought only when its
progress changes. Scroll and idle discharge paints share a timestamp so they do
not rebuild the projected wake twice in the same display frame. Clouds outside
the camera depth range use display:none and release their will-change promotion.
These remove known redundant work; frame-rate improvement still requires browser
profiling on the visitor's device. No timing or route changes are intended.

### Long-form reading views and content sources

`src/reading-view.js` holds editable page data and the full-viewport native dialog.
Preview panels now represent Profile, Experiences and Projects in that order.
Historical anchor IDs remain unchanged for compatibility. The reader scrolls
normally, holds native keyboard focus, closes with Escape or either return button,
and restores the trigger and original flight scroll coordinate. Decorative clouds
are local assets, with motion disabled under reduced motion. Images remain labelled
placeholders until the user selects them.

The initial profile and four experience descriptions are first-person drafts from
Chibueze_Benneth_Technology_Co-op_Resume.docx and
Chibueze_Benneth_ML_Internship_Resume.docx in the user's OneDrive Chibueze's Resume
folder, reviewed23 October2026. No phone, address, immigration documents or family
resumes were imported. LinkedIn was supplied but could not be read through the web
fetch. Drive search identified a headshot and Ethos Lab team image; neither was
included in public assets or displayed on the website.

### Profile preview

The first checkpoint uses the user's supplied student/interests bio and a
right-side portrait placeholder. Only the excerpt is height-clipped and softly
masked; the expansion control remains fully visible and keyboard accessible.
The full reading view contains the unabridged revised bio and previously supplied
dream statement. No Drive photo has been selected or installed. Reduced motion
removes the excerpt clipping so ordinary reading retains all content.

### Experience preview and paused photography

The second checkpoint is titled “How it’s been going” and uses a short,
user-directed nonprofit/team introduction with a “Click to learn more” control.
A gently floating three-frame album sits alongside it, currently containing
placeholders only. Downloads were reviewed for candidates, but no photographs
were added: the user paused image additions. Reduced motion disables album float.
Thrive-4-Blacks now correctly identifies the Youth Coordinator role; the prior
hackathon description was removed rather than reused as coordinator duties.
Scholarship inclusion and placement are still undecided; none were invented.
