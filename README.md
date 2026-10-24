# Chibueze · beyond the gate

Local Vite / Anime.js animation prototype. Nothing published. No accounts, analytics, backend, runtime remote assets or external API calls. Anime.js and Vite are MIT licensed.

## Preview

Requires Node.js 20.19+ or 22.12+.

```sh
npm ci
npm run dev
```

Open the Local URL printed by Vite. `npm test` runs scene-math checks. `npm run build` produces `dist/`; `npm run preview` serves that production build. Current artwork lives in `public/assets/`.

## Choreography

One native scroll runway (400 viewport heights) controls a sticky scene. No wheel/touch interception, artificial momentum, autoplay opening or scroll trap.

- First 19%: solid plum wooden doors fill the screen. No bars, spiral, wheel or knob. White vertical text reads イエス / キリスト. The upper-left greeting contains only the supplied name line and a smaller, gold, uppercase welcome line. Japanese lettering uses grain-masked translucent paint blended into the wood. A paused Anime.js timeline seeks heavy door separation and a simultaneous camera push.
- After 21.5%: the red/black beam begins behind the camera. It crosses the near projection plane, enters from the lower edge and races toward the cloud corridor. It cannot appear before the doors have opened.
- Flight: cloud banks occupy fixed positions in world space. Perspective makes them grow and move outward as the camera approaches, then disappear behind the viewer. Radial speed lines reinforce travel. Camera distance slows at checkpoints; ambient cloud drift continues when scrolling stops.
- At 46%, 67% and 88%: profile, experiences and projects panels expand from offset luminous world-space orbs, settle for reading, then compress back into the same orb. The beam holds at the orb during expansion and resumes as the panel collapses. All content beyond the supplied name remains marked as placeholder.

Scene state follows absolute scroll progress. Scrolling backward restores earlier geometry. Ambient cloud transport, lightning shape modulation and cursor-spark fades use elapsed time; route progress and door position remain scroll-controlled. Pointer sparks remain bounded, throttled and click-through, with the native cursor intact.

## Accessibility

Skip intro/checkpoint links jump to their scroll coordinates and focus semantic sections. Direct hash URLs work too. Reduced motion provides a static gate and all three sections in ordinary reading flow, without flight or cursor effects. Touch/coarse pointers do not emit sparks. Native keyboard and touch scrolling remain available. No repeated strobes or full-screen flashes.

## Source and choices

- `index.html`: semantic content and independent door layers.
- `src/main.js`: timeline, cloud field, projected beam/trail, navigation and sparks.
- `src/journey.js`: pure projection, ordering and checkpoint math, tested in `tests/journey.test.js`.
- `src/style.css`: current scene, responsive and reduced-motion styles, replacing earlier override stacks.
- `ASSET-PROMPTS.md`: original artwork prompts and reference notes.

Wood and cloud art were generated with the built-in image tool. White door lettering stays real text for correct spelling. This is a 2.5D sprite scene, not volumetric 3D, physical fluid simulation or frame-by-frame anime. The original beam geometry is informed by the supplied Shanks clip. Its near end extends behind the viewport, so no source/capped tail is visible.

## Verification and limits

Production build and five Node tests pass. Tests cover door/beam ordering, approaching/behind-camera cloud projection, readable non-overlapping checkpoint windows, the beam source staying offscreen even at central bends, and cloud camera travel starting before the doors finish opening. Desktop browser checks show readable opening typography, painted lettering, larger near-camera clouds, visible glowing orbs, an offscreen-source beam, the final expansion to white, and a loaded contact illustration. Browser accessibility state verifies all four contact destinations. Cursor sparks and checkpoint navigation are retained from the prior revision.

Mobile/touch, reduced-motion layout, cross-system Japanese fonts and long-session performance still need visual/device checks. One cloud-bank sprite is reused across the corridor, so repeated shapes may be noticeable. No real portfolio content, project URLs or personal claims were invented.


## Timing and ending

The runway is reduced from 1150 to 400 viewport heights. Adjacent milestone centers are about 0.63 viewport heights apart. This aims for a short gesture per milestone; exact elapsed seconds depend on visitor scrolling. No forced timer is imposed, so visitors can stop to read.

At 94.5–100% the final beacon blooms to white as the beam reaches it. This is a single scroll-driven light expansion, not a strobing flash. Native scrolling then reveals a normal contact page with the user-supplied email, LinkedIn, GitHub and Instagram icons. External profiles open in a new tab; the email icon opens the visitor's mail composer without sending anything.

The previous contact image, `public/assets/luffy-supplied.png`, was prepared from the user's earlier 395×432 Gear 5 Luffy artwork and is no longer displayed. This replaces the generated character: no generative model was used for this replacement. A deterministic connected-color mask removed the red background while retaining the original character pixels and pose. The original source is retained in `work/source-assets/`; the preparation script is `work/prepare-luffy-cutout.py`. The source has no phone, so none was added. Its small resolution limits enlargement. The previous generated image is archived outside `public/` and is not included in the site build. CSS adds gentle floating, disabled in reduced motion. All current website assets are local. System Georgia is still used for the name, with a letter-spaced Arial/Helvetica welcome line. Cormorant Garamond is an optional design recommendation and is not downloaded or requested remotely.


## Latest gate refinements

The greeting is now “Hi, I am Chibueze.” with the smaller gold welcome line. A thin name-level cloud and larger lower-left/lower-right cloud banks sit in front of the closed wooden doors. The Japanese lettering is larger and still uses a grain/alpha mask to simulate paint worn into the wood. The bottom-right note reads “scroll to open doors”.

A narrow luminous slit is visible while shut. Opening progress widens it into light, with a soft bloom and foreground cloud bursts. Camera distance begins increasing at the first scroll increment, rather than waiting for the doors to clear. All opening light/burst/travel values remain deterministic and reversible; the reduced-motion layout disables them.

Desktop visual checks verified the closed gate, early gap with escaping clouds/light, and the contact page using the supplied non-generated character. Mobile and reduced-motion layouts still need device-level visual QA. No audio creaking or new remote service is added.


## Latest refinement: supplied purple-sash artwork and living discharge

The displayed character is now `public/assets/luffy-deep-purple.png`, from the user's second new attachment (735×565). Saturated sash pixels were recolored toward the site's #392440 deep purple while preserving fold brightness. Connected outside-white background was made transparent. No generative model redrew the character. The reproducible non-generative script is `work/recolor-luffy-sash.py` in the workspace, with its source in `work/source-assets/luffy-purple-sash-original.png`.

Door clouds now travel continuously across a modeled gate plane. The rear layer is hidden by the doors; new volumes start just behind the aperture, cross it, then expand outward as they approach/pass the camera. They continue at a paused opening instead of being scaled/faded into view by scroll. The front stream initializes behind the plane when opening begins, so already-close clouds are not suddenly revealed. Closed-seam lighting is stronger.

The beam is fuller and its teeth/forks deform continuously along the same scroll-controlled route, including while the visitor pauses. Its source stays outside the viewport. The independent animation loop is capped around 30 updates/second, stops work in hidden documents, and is disabled for reduced motion. This adds shape motion without strobing the beam's opacity.

Desktop screenshots taken at the same opening/flight scroll positions showed moving doorway clouds and changing lightning silhouettes. The supplied recolored image and transparent outer edge were visually checked. Build and five existing scene tests pass; mobile/reduced-motion visual QA and extended performance testing remain outstanding.

## Current tuning: slimmer lightning and scroll-responsive doorway clouds

Lightning uses its earlier 5px dark core / 9px red edge, with a 22px halo. Larger perpendicular offsets and several nonmatching smooth frequencies create wider, irregular animated zigzags while preserving the underlying travel route and orb destinations. Branches also vary in reach. Opacity does not strobe.

The doorway stream is reduced from 14 volumes to six, with lower opacity and slightly smaller projected size. Signed scroll distance is now its main clock: forward movement advances the same volumes, reverse movement retracts them. After scrolling stops for 120ms, a slow idle drift advances at 0.018 cycles/second instead of the earlier roughly 0.45 cycles/second. This keeps gentle life without rapid emission. The idle timestep is capped to avoid jumps after tab sleep, and returning to the fully closed gate resets the stream.

Build and seven tests pass, including exact forward/reverse cloud travel without idle drift, gentle paused drift, and bounded behavior after a long frame gap. Desktop browser checks confirmed reduced doorway density, reverse opening/cloud movement, and thinner lightning with visibly larger amplitude. Mobile and reduced-motion visual checks remain outstanding.

### Latest rendering repairs

The discharge now uses evenly spaced screen-space bends, a conservative travelling zigzag surge, short branches, and a simpler shallow-arc travel route. Doorway cloud crops and seam lighting are feathered to remove rectangular edges. Cloud artwork and milestone pop-up behavior are preserved. See [ARCHITECTURE.md](ARCHITECTURE.md) for ownership, tuning decisions, and verification instructions.

### Spatial flight, orb charge and supplied character update

The current beam follows a banked world-space route through the clouds, with its wake projected and resampled by screen arc length. Branch channels grow and drain in staggered travelling pulses, including while idle. Each checkpoint receives a soft red wash at contact, remains red after departure, and restores gold when scrolling back before contact. Content panel timing is unchanged. The latest supplied Luffy image is displayed as `public/assets/luffy-selected.png`; only its outside white background was made transparent using `scripts/prepare-supplied-art.py`. No character pixels were generated or recolored in this replacement. See `ARCHITECTURE.md` for tuning and implementation details.

### Diverse approaches and contact electricity

Each orb now has a distinct incoming angle, including below-eye and oblique arrivals. The pointer leaves a connected fading red-black trace. Local animated strands pass behind and across Luffy, with a soft silhouette tint. Decorative effects preserve native input and turn off for reduced motion; contact strands stop rendering offscreen. See `src/electric-effects.js` and `ARCHITECTURE.md` for comments and tuning decisions. Critic review caught and resolved phase snapping, repeated arrival tangents, sizing and sharp-corner issues.
