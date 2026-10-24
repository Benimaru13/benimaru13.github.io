/** Scene coordinator.
 * Scroll owns door/camera/route/checkpoint progress. A separate capped clock
 * supplies gentle cloud drift and electrical deformation. Never advance scroll
 * from animation time. See lightning-geometry.js for anti-tangle geometry invariants.
 */
import {
  clamp,
  smoothstep,
  checkpointVisibility,
  projectPoint,
  gateProgress,
  cameraDistance,
} from "./journey-math.js";
import { orbCharge } from "./lightning-geometry.js";
import { createClouds } from "./clouds.js";
import { createBeam } from "./beam.js";
import { createGateTimeline } from "./gate.js";

export function createJourneyScene(reducedMotion) {
  const journey = document.querySelector(".journey");
  const scene = document.querySelector(".scene");
  const finalLight = document.querySelector(".final-light");
  const gate = document.querySelector(".gate-camera");
  const fog = document.querySelector(".gate-fog");
  const flight = document.querySelector(".flight");
  const seamLight = document.querySelector(".seam-light");
  const backlight = document.querySelector(".gate-backlight");
  const doorNote = document.querySelector(".door-scroll-note");
  const clouds = createClouds();
  const opening = createGateTimeline();
  const {
    targets,
    finalTarget,
    finalBeacon,
    routePoint,
    renderBeam,
    renderSpeed,
  } = createBeam();
  const portalBack = document.querySelector(".portal-back");
  const portalFront = document.querySelector(".portal-front");
  const landingCloud = document.querySelector(".landing-cloud");
  const nav = document.querySelector(".chapter-nav");
  let sceneState = null;
  let lastBeamPaint = -Infinity,
    previousGateSeek = -1;
  /** Single scroll transaction: update scene geometry, then content visibility.
   * Reads are grouped before writes to avoid forced layout between panels. */
  function renderScroll() {
    if (reducedMotion.matches) return;
    const width = scene.clientWidth,
      height = scene.clientHeight;
    const progress = clamp(
      window.scrollY / Math.max(1, journey.offsetHeight - height),
    );
    // Read panel layout BEFORE mutating any scene styles. Interleaving width/
    // position reads with transforms forced repeated synchronous layout passes.
    const panelMetrics = targets.map((checkpoint) => {
      const element = document.getElementById(checkpoint.id);
      return { element, center: element.offsetLeft + element.offsetWidth / 2 };
    });
    // Apply signed travel immediately, including jumps outside the doorway
    // segment. Idle drift waits until scrolling has genuinely stopped.
    clouds.synchronizePortal(progress, performance.now());
    const gateSeek = gateProgress(progress) * opening.duration;
    // Anime.js need not reapply every door transform throughout the cloud flight.
    if (gateSeek !== previousGateSeek) {
      opening.seek(gateSeek);
      previousGateSeek = gateSeek;
    }
    gate.style.visibility = progress >= 0.205 ? "hidden" : "visible";
    // Clouds break through the crack while the doors open. Only ambient cloud
    // drift uses time; gate/camera/beam/checkpoint state comes solely from scroll.
    const crack = clamp(progress / 0.19);
    portalBack.style.display = progress < 0.29 ? "block" : "none";
    portalFront.style.display = progress < 0.29 ? "block" : "none";
    const release = smoothstep(progress / 0.012);
    const dissolve = 1 - smoothstep((progress - 0.15) / 0.055);
    // The independent ambient cloud clock below handles actual through-gate
    // transport. Opening only changes the light and physical aperture.
    fog.style.opacity = "0";
    seamLight.style.opacity = String((0.85 + crack * 0.15) * dissolve);
    // Do not widen a full-height rectangular shadow: its two edges became
    // vertical light bars across the cloud view. The radial backlight supplies
    // expanding illumination; the seam itself stays narrow and clears with gate.
    seamLight.style.width = `${8 + Math.pow(crack, 1.4) * 16}px`;
    backlight.style.opacity = String((0.22 + release * 0.55) * dissolve);
    backlight.style.transform = `scale(${0.5 + crack * 1.8})`;
    doorNote.style.opacity = String(1 - smoothstep(progress / 0.12));
    landingCloud.style.opacity = String(1 - smoothstep(progress / 0.16));

    const cameraZ = cameraDistance(progress);
    sceneState = {
      progress,
      cameraZ,
      width,
      height,
      ending: smoothstep((progress - 0.945) / 0.055),
    };
    clouds.renderClouds(cameraZ, width, height);
    // Keep electrical phase continuous across scroll events and ambient frames.
    lastBeamPaint = performance.now();
    renderBeam(progress, cameraZ, width, height, lastBeamPaint / 1000);
    let maximumOpacity = 0;
    const ending = smoothstep((progress - 0.945) / 0.055);
    const finalProjection = projectPoint(finalTarget, cameraZ, width, height);
    if (finalProjection) {
      const size = Math.max(16, Math.min(170, finalProjection.scale * 350));
      finalBeacon.style.width = `${size}px`;
      finalBeacon.style.height = `${size}px`;
      finalBeacon.style.transform = `translate(${finalProjection.x - size / 2}px,${finalProjection.y - size / 2}px)`;
      finalBeacon.style.opacity = String(
        smoothstep((progress - 0.6) / 0.1) * (1 - ending),
      );
    }
    finalLight.style.opacity = String(ending);
    finalLight.style.transform = `translate(-50%,-50%) scale(${0.08 + ending * 18})`;
    flight.style.opacity = String(Number(flight.style.opacity) * (1 - ending));
    targets.forEach((checkpoint, index) => {
      const { element, center } = panelMetrics[index];
      const state = checkpointVisibility(progress, checkpoint.at);
      // Arrival shares the exact beam-contact threshold. The red front grows
      // from the incoming side; it is not a one-time class or a time-only tween.
      const charge = orbCharge(progress, checkpoint.at);
      checkpoint.element.style.setProperty("--charge", String(charge));
      checkpoint.element.style.setProperty("--wash-radius", `${charge * 190}%`);
      maximumOpacity = Math.max(maximumOpacity, state.opacity);
      element.style.opacity = String(state.opacity);
      element.style.visibility = state.opacity > 0.015 ? "visible" : "hidden";
      element.style.pointerEvents = state.opacity > 0.5 ? "auto" : "none";
      // Expand out of the lightning's arrival point, then settle into a
      // consistent reading position; departure shrinks back into the cloud path.
      const orb = projectPoint(checkpoint, cameraZ, width, height);
      const originX = orb?.x ?? width * 0.7;
      const originY = orb?.y ?? height * 0.47;
      if (orb) {
        // Red enters from the route's incoming tangent, not a fixed side.
        const before = projectPoint(
          routePoint(checkpoint.z - 250),
          cameraZ,
          width,
          height,
        );
        const dx = (before?.x ?? orb.x + 1) - orb.x,
          dy = (before?.y ?? orb.y + 1) - orb.y;
        const distance = Math.hypot(dx, dy) || 1;
        checkpoint.element.style.setProperty(
          "--wash-x",
          `${50 + (dx / distance) * 38}%`,
        );
        checkpoint.element.style.setProperty(
          "--wash-y",
          `${50 + (dy / distance) * 38}%`,
        );
        const size = Math.max(10, Math.min(130, orb.scale * 600));
        checkpoint.element.style.width = `${size}px`;
        checkpoint.element.style.height = `${size}px`;
        checkpoint.element.style.transform = `translate(${originX - size / 2}px,${originY - size / 2}px)`;
        checkpoint.element.style.opacity = String(
          (1 - state.opacity * 0.35) *
            smoothstep((progress - 0.18) / 0.06) *
            (1 - ending),
        );
      } else checkpoint.element.style.opacity = "0";
      const offsetWeight = 1 - state.arrival + state.departure;
      const offsetX = (originX - center) * offsetWeight;
      const offsetY = (originY - height * 0.5) * offsetWeight;
      element.style.transform = `translate(${offsetX}px,calc(-50% + ${offsetY}px)) scale(${state.scale})`;
    });
    renderSpeed(progress, cameraZ, width, height, maximumOpacity);
    nav.style.opacity = progress > 0.21 && progress < 0.95 ? "1" : "0";
    nav.style.visibility =
      progress > 0.21 && progress < 0.95 ? "visible" : "hidden";
  }

  /** The shared scheduler owns frequency and elapsed time. Scroll paints use
   * the same performance clock, so the electrical phase never resets. */
  function renderAmbient(now, deltaSeconds) {
    if (!sceneState) return;
    const state = sceneState;
    if (state.progress < 0.3) clouds.renderPortal(now, state, deltaSeconds);
    // Geometry already painted during this frame must not be rebuilt twice.
    if (
      state.progress > 0.215 &&
      state.progress < 1 &&
      now - lastBeamPaint > 30
    ) {
      lastBeamPaint = now;
      renderBeam(
        state.progress,
        state.cameraZ,
        state.width,
        state.height,
        now / 1000,
      );
      flight.style.opacity = String(
        Number(flight.style.opacity) * (1 - state.ending),
      );
    }
  }
  return { renderScroll, renderAmbient };
}
