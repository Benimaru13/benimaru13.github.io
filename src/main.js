/** Composition root: install features once, then share one journey/UI clock.
 * Content belongs in content/, scene rendering in scene/, interaction in ui/.
 * Native scrolling remains the only input that advances journey progress.
 */
import "./styles/index.css";
import { createJourneyScene } from "./scene/journey-scene.js";
import { createFrameLoop } from "./scene/frame-loop.js";
import { installLanding } from "./ui/landing.js";
import { installNavigation } from "./ui/navigation.js";
import { installReadingViews } from "./ui/reading-view.js";
import {
  installCursorTrail,
  installCharacterElectricity,
} from "./ui/electric-effects.js";

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const scene = createJourneyScene(reducedMotion);
const landing = installLanding(reducedMotion);
const loop = createFrameLoop({
  renderScroll: scene.renderScroll,
  renderAmbient(now, deltaSeconds) {
    scene.renderAmbient(now, deltaSeconds);
    landing.renderGreeting(now);
  },
  reducedMotion,
});
window.addEventListener("scroll", loop.invalidate, { passive: true });
window.addEventListener("resize", loop.invalidate);
// Rebuild the alternate layout when the OS preference changes mid-session.
reducedMotion.addEventListener("change", () => location.reload());
installNavigation(reducedMotion, loop.invalidate);
installReadingViews({
  onOpen: () => loop.setPaused(true),
  onClose: () => loop.setPaused(false),
});
installCursorTrail(document.querySelector(".cursor-sparks"), reducedMotion);
installCharacterElectricity(
  document.querySelector(".character-rig"),
  reducedMotion,
);
loop.start();
