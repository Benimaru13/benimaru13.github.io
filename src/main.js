/** Application entry point.
 * Scroll owns door/camera/route/checkpoint progress. A separate capped clock
 * supplies gentle cloud drift and electrical deformation. Never advance scroll
 * from animation time. See lightning.js for anti-tangle geometry invariants.
 */
import anime from "animejs/lib/anime.es.js";
import {
  clamp,
  smoothstep,
  CHECKPOINTS,
  checkpointVisibility,
  projectPoint,
  beamDistance,
  gateProgress,
  cameraDistance,
  advancePortalMotion,
} from "./journey.js";
import {
  buildLightningRibbon,
  flightRoutePoint,
  orbCharge,
  svgPolyline,
  cloudApertureMask,
} from "./lightning.js";
import "./style.css";
import {
  installCursorTrail,
  installCharacterElectricity,
} from "./electric-effects.js";

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const journey = document.querySelector(".journey");
const scene = document.querySelector(".scene");
const finalLight = document.querySelector(".final-light");
const gate = document.querySelector(".gate-camera");
const fog = document.querySelector(".gate-fog");
const flight = document.querySelector(".flight");
const speedLines = document.querySelector(".speed-lines");
const cloudField = document.querySelector(".cloud-field");
const namespace = "http://www.w3.org/2000/svg";
const seamLight = document.querySelector(".seam-light");
const backlight = document.querySelector(".gate-backlight");
const doorNote = document.querySelector(".door-scroll-note");
// Each ambient cloud physically crosses a gate plane: the rear layer is
// occluded by solid doors; the front copy expands out of the actual aperture.
// Signed scroll drives travel; stopping allows only a very slow ambient drift.
const portalBack = document.querySelector(".portal-back");
const portalFront = document.querySelector(".portal-front");
const portalClouds = Array.from({ length: 6 }, (_, index) => {
  const element = document.createElement("div");
  element.className = "portal-cloud";
  const image = document.createElement("img");
  image.src = "/assets/cloud-volume.png";
  image.alt = "";
  element.append(image);
  portalBack.append(element);
  return {
    element,
    index,
    side: index % 2 ? 1 : -1,
    x: ((index * 83) % 160) - 80,
    y: ((index * 211) % 900) - 450,
  };
});
let sceneState = null;
let portalMotion = { progress: 0, phase: 0 };
let lastPortalScroll = 0;
function renderPortalClouds(seconds, state, deltaSeconds) {
  const { progress, width, height } = state;
  const crack = clamp(progress / 0.19);
  const handoff = 1 - smoothstep((progress - 0.19) / 0.1);
  portalBack.style.opacity = String(handoff);
  portalFront.style.opacity = String(handoff);
  portalMotion = advancePortalMotion(portalMotion, progress, deltaSeconds);
  portalClouds.forEach((cloud) => {
    // Stagger six volumes along one reversible stream. During reverse scroll
    // the same volume returns toward the aperture rather than emitting anew.
    const elapsed = portalMotion.phase - cloud.index / portalClouds.length;
    const age = elapsed < 0 ? 0 : ((elapsed % 1) + 1) % 1;
    const z = elapsed < 0 ? 400 + cloud.index * 180 : 100 - age * 1700;
    const distance = 1800 + z;
    const near = clamp(-z / 1400);
    const isFront = z < 0;
    const parent = isFront ? portalFront : portalBack;
    if (cloud.element.parentElement !== parent) parent.append(cloud.element);
    if (distance < 180 || (isFront && crack < 0.004)) {
      cloud.element.style.visibility = "hidden";
      return;
    }
    cloud.element.style.visibility = "visible";
    const scale = (Math.min(width, height) * 0.95) / distance;
    const x = width * 0.5 + (cloud.x + cloud.side * near * near * 1100) * scale;
    const y =
      height * 0.5 +
      (cloud.y + Math.sin(seconds * 0.3 + cloud.index) * 45) * scale;
    // Crop at the plane, then progressively reveal the same moving volume as
    // it clears the door. No scroll-triggered opacity pop or scale-in is used.
    const aperture = isFront ? clamp(crack * 0.9 + near * 2.8) : 1;
    // A hard clip left straight vertical cuts across the painted cloud. The
    // feathered alpha aperture reveals volume without a visible crop boundary.
    cloud.element.style.maskImage = cloudApertureMask(aperture);
    cloud.element.style.transform = `translate3d(${x - 500 * scale}px,${y - 215 * scale}px,0) scale(${scale})`;
    cloud.element.style.opacity = String(isFront ? 0.48 : 0.4);
  });
}

// A small paused Anime.js timeline handles the doors' weight and their
// concurrent camera push. No elapsed clock can open the doors on page load.
const opening = anime
  .timeline({ autoplay: false, easing: "easeInOutCubic" })
  .add(
    { targets: ".door-left", translateX: ["0%", "-108%"], duration: 1000 },
    0,
  )
  .add(
    { targets: ".door-right", translateX: ["0%", "108%"], duration: 1000 },
    0,
  )
  .add(
    {
      targets: ".gate-camera",
      scale: [1, 2.35],
      duration: 1000,
      easing: "easeInQuad",
    },
    0,
  )
  .add(
    {
      targets: ".intro-copy",
      opacity: [1, 0],
      duration: 270,
      easing: "linear",
    },
    0,
  );

/** Populate a corridor in world space. Every cloud has a fixed depth, so
 * scrolling past it moves it BEHIND the camera; it never wraps in front.
 * Transform a wrapper for perspective; animate only its child for ambient flow. */
const clouds = Array.from({ length: 54 }, (_, index) => {
  const element = document.createElement("div");
  element.className = "flight-cloud";
  const image = document.createElement("img");
  image.src = "/assets/cloud-volume.png";
  image.alt = "";
  image.style.setProperty("--drift", `${24 + (index % 6) * 4}s`);
  image.style.setProperty("--delay", `${-index * 2.7}s`);
  if (index % 3 === 0) image.style.scale = "-1 1";
  element.append(image);
  cloudField.append(element);
  return {
    element,
    x: (index % 2 ? 1 : -1) * (440 + ((index * 379) % 1000)),
    y: ((index * 491) % 1700) - 850,
    z: 650 + index * 590,
    size: 1.9 + (index % 4) * 0.38,
  };
});
const streaks = Array.from({ length: 26 }, (_, index) => {
  const element = document.createElementNS(namespace, "line");
  speedLines.append(element);
  return { element, angle: (index / 26) * Math.PI * 2, offset: index * 0.381 };
});
const orbField = document.querySelector(".orb-field");
// These world-space targets are the SAME knots used by the lightning route.
// Arrival is geometric contact, not a separate unrelated screen-space timer.
const targets = CHECKPOINTS.map((checkpoint, index) => {
  const element = document.createElement("div");
  element.className = "light-orb";
  const charge = document.createElement("span");
  charge.className = "orb-charge";
  element.append(charge);
  orbField.append(element);
  return {
    ...checkpoint,
    element,
    x: (index % 2 ? -1 : 1) * (1050 + index * 80),
    y: index % 2 ? -230 : 120,
    z: cameraDistance(checkpoint.at - 0.065) + 3000,
  };
});
const finalTarget = { x: 0, y: 0, z: cameraDistance(0.945) + 3000 };
const finalBeacon = document.createElement("div");
finalBeacon.className = "light-orb";
orbField.append(finalBeacon);
const routeKnots = [{ x: 750, y: 800, z: -500 }, ...targets, finalTarget];
/** One shared world route drives both the traveller and its visible wake.
 * Perspective changes turn size as the camera flies forward; electricity is
 * layered onto this route after projection, never used as camera movement. */
function routePoint(z) {
  return flightRoutePoint(routeKnots, z);
}
const head = document.querySelector(".beam-head");
const beamPaths = [".beam-halo", ".beam-edge", ".beam-core"].map((selector) =>
  document.querySelector(selector),
);
const branches = document.querySelector(".beam-forks");

/** Distance holds around the content stops make the checkpoints feel like
 * arrivals. The visitor still owns native scroll and can reverse at any point. */

/** Perspective-only cloud placement; keeps the existing painted cloud design. */
function renderClouds(cameraZ, width, height) {
  // Draw far to near. zIndex expresses depth without needing a WebGL runtime.
  clouds.forEach((cloud, index) => {
    const sway = Math.sin(cameraZ * 0.00018) * 130;
    const projected = projectPoint(
      { x: cloud.x - sway, y: cloud.y, z: cloud.z },
      cameraZ,
      width,
      height,
    );
    if (!projected || projected.distance > 12000) {
      cloud.element.style.display = "none";
      cloud.element.style.willChange = "auto";
      return;
    }
    cloud.element.style.display = "block";
    cloud.element.style.willChange = "transform, opacity";
    const scale = projected.scale * cloud.size;
    const alpha =
      smoothstep((12000 - projected.distance) / 6500) *
      smoothstep((projected.distance - 80) / 400) *
      0.8;
    cloud.element.style.opacity = String(alpha);
    cloud.element.style.zIndex = String(clouds.length - index);
    cloud.element.style.transform = `translate3d(${projected.x - 500 * scale}px,${projected.y - 215 * scale}px,0) scale(${scale})`;
  });
}

/** The beam enters from behind the camera, not as a fixed screen-space icon.
 * A negative lead is invisible; a small positive lead projects a huge streak
 * from the lower edge, then it shrinks toward its distant zigzagging lead. */
function renderBeam(progress, cameraZ, width, height, seconds = 0) {
  const lead = beamDistance(progress);
  if (lead <= 90) {
    flight.style.opacity = "0";
    return;
  }
  flight.style.opacity = String(smoothstep((lead - 90) / 160));
  flight.setAttribute("viewBox", `0 0 ${width} ${height}`);
  let headZ = cameraZ + lead;
  targets.forEach((target) => {
    const state = checkpointVisibility(progress, target.at);
    if (progress >= target.at - 0.065 && progress <= target.at + 0.08) {
      // Hold at the orb while it blooms; depart as it compresses back down.
      headZ = target.z + (headZ - target.z) * state.departure;
    }
  });
  // Project only the destination. The visible ribbon is sampled in pixels,
  // not in depth, so the wavelength cannot collapse into an orb-side bundle.
  const entrance = 1 - smoothstep((progress - 0.24) / 0.065);
  const route = routePoint(headZ);
  const projectedHead = projectPoint(
    { x: route.x + entrance * 1600, y: route.y + entrance * 2100, z: headZ },
    cameraZ,
    width,
    height,
  );
  if (!projectedHead) {
    flight.style.opacity = "0";
    return;
  }
  // Sample the actual 3D wake, then resample by projected arc length in
  // lightning.js. This preserves banking turns without packing bends at orbs.
  const guide = [];
  for (let index = 0; index <= 100; index++) {
    const z = cameraZ + 95 + ((headZ - cameraZ - 95) * index) / 100;
    const point = routePoint(z);
    const depthEntrance = 1 - smoothstep((z - cameraZ) / 900);
    const projected = projectPoint(
      {
        x: point.x + entrance * 1600 + depthEntrance * 700,
        y: point.y + entrance * 2100 + depthEntrance * 1000,
        z,
      },
      cameraZ,
      width,
      height,
    );
    if (projected) guide.push(projected);
  }
  guide[guide.length - 1] = projectedHead;
  const ribbon = buildLightningRibbon(
    projectedHead,
    width,
    height,
    seconds,
    guide,
  );
  const path = svgPolyline(ribbon.points);
  beamPaths.forEach((element) => element.setAttribute("d", path));
  branches.setAttribute("d", ribbon.branches.map(svgPolyline).join(" "));
  // One small directional tip replaces the old overlapping star-shaped head.
  // Its actual position/route/checkpoint timing are unchanged.
  head.setAttribute(
    "transform",
    `translate(${projectedHead.x} ${projectedHead.y}) rotate(${ribbon.angle}) scale(.65)`,
  );
}

/** Sparse radial motion indicators, reduced during readable checkpoints. */
function renderSpeed(progress, cameraZ, width, height, checkpointOpacity) {
  speedLines.setAttribute("viewBox", `0 0 ${width} ${height}`);
  const intensity =
    smoothstep((progress - 0.21) / 0.07) * (1 - checkpointOpacity * 0.85);
  speedLines.style.opacity = String(intensity * 0.6);
  const maxRadius = Math.hypot(width, height) * 0.65;
  streaks.forEach(({ element, angle, offset }) => {
    const cycle = (((cameraZ / 1900 + offset) % 1) + 1) % 1;
    const start = maxRadius * (0.22 + cycle * 0.65),
      end = start + maxRadius * (0.025 + cycle * 0.1);
    element.setAttribute("x1", width * 0.5 + Math.cos(angle) * start);
    element.setAttribute("y1", height * 0.47 + Math.sin(angle) * start);
    element.setAttribute("x2", width * 0.5 + Math.cos(angle) * end);
    element.setAttribute("y2", height * 0.47 + Math.sin(angle) * end);
    element.style.opacity = String(Math.sin(cycle * Math.PI) * 0.75);
  });
}

let pending = false;
let lastBeamPaint = -Infinity,
  previousGateSeek = -1;
/** Single scroll transaction: update scene geometry, then content visibility.
 * Checkpoint appearance/timing is intentionally unchanged in this bug-fix pass. */
function renderScroll() {
  pending = false;
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
  if (progress !== portalMotion.progress) {
    portalMotion = advancePortalMotion(portalMotion, progress, 0);
    lastPortalScroll = performance.now();
  }
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
  document.querySelector(".landing-cloud").style.opacity = String(
    1 - smoothstep(progress / 0.16),
  );

  const cameraZ = cameraDistance(progress);
  sceneState = {
    progress,
    cameraZ,
    width,
    height,
    ending: smoothstep((progress - 0.945) / 0.055),
  };
  renderClouds(cameraZ, width, height);
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
  const nav = document.querySelector(".chapter-nav");
  nav.style.opacity = progress > 0.21 && progress < 0.95 ? "1" : "0";
  nav.style.visibility =
    progress > 0.21 && progress < 0.95 ? "visible" : "hidden";
}
function queueRender() {
  if (!pending) {
    pending = true;
    requestAnimationFrame(renderScroll);
  }
}
window.addEventListener("scroll", queueRender, { passive: true });
window.addEventListener("resize", queueRender);
reducedMotion.addEventListener("change", () => location.reload());

// Checkpoint links jump to their scroll coordinate, then focus the semantic
// section. Reduced-motion mode retains standard anchor/reading behavior.
function navigateTo(id) {
  const checkpoint = CHECKPOINTS.find((item) => item.id === id);
  if (!checkpoint || reducedMotion.matches) return false;
  window.scrollTo({
    top: checkpoint.at * (journey.offsetHeight - scene.clientHeight),
    behavior: "instant",
  });
  renderScroll();
  document.getElementById(id).focus({ preventScroll: true });
  return true;
}
document.querySelectorAll('a[href^="#"]').forEach((link) =>
  link.addEventListener("click", (event) => {
    const id = link.getAttribute("href").slice(1);
    if (navigateTo(id)) {
      event.preventDefault();
      history.replaceState(null, "", `#${id}`);
    }
    if (id === "top" && !reducedMotion.matches) {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: "instant" });
      history.replaceState(null, "", location.pathname);
    }
  }),
);
// A checkpoint lives in the sticky scene, so the browser's ordinary anchor
// restoration can compete with its virtual scroll coordinate after a reload.
// Reapply it after pageshow/layout; normal contact and reduced-motion anchors
// retain browser behavior. Manual restoration is scoped to checkpoint URLs.
if (
  !reducedMotion.matches &&
  CHECKPOINTS.some((item) => `#${item.id}` === location.hash)
) {
  history.scrollRestoration = "manual";
}
function placeInitialAnchor() {
  requestAnimationFrame(() => {
    if (!navigateTo(location.hash.slice(1))) renderScroll();
  });
}
placeInitialAnchor();
window.addEventListener("pageshow", placeInitialAnchor);
/** Continuous atmosphere/discharge is independent from scroll choreography.
 * The route stays fixed when scrolling stops, but the electrical shape lives.
 * Reduced motion disables this loop; a hidden document does no animation work. */
let ambientFrame = 0,
  lastAmbientFrame = 0;
function animateAmbient(now) {
  if (reducedMotion.matches || document.hidden) {
    ambientFrame = 0;
    return;
  }
  if (sceneState && now - lastAmbientFrame > 33) {
    const state = sceneState;
    if (state.progress < 0.3)
      renderPortalClouds(
        now / 1000,
        state,
        now - lastPortalScroll > 120 ? (now - lastAmbientFrame) / 1000 : 0,
      );
    // Scroll already painted this discharge; do not build/project the same
    // wake a second time in the ambient callback of the same display frame.
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
    lastAmbientFrame = now;
  }
  ambientFrame = requestAnimationFrame(animateAmbient);
}
if (!reducedMotion.matches)
  ambientFrame = requestAnimationFrame(animateAmbient);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    cancelAnimationFrame(ambientFrame);
    ambientFrame = 0;
  } else if (!ambientFrame && !reducedMotion.matches)
    ambientFrame = requestAnimationFrame(animateAmbient);
});

// Decorative effects retain native pointer behavior and obey reduced motion.
installCursorTrail(document.querySelector(".cursor-sparks"), reducedMotion);
installCharacterElectricity(
  document.querySelector(".character-rig"),
  reducedMotion,
);

/** Clicks reveal latent paint ON each moving door, rather than opening it.
 * The scene listener also catches clicks over decorative fog layers. Native
 * scrolling remains the only way to advance the gate timeline. */
const doorHints = document.querySelectorAll(".door-hint");
scene.addEventListener("click", (event) => {
  if (
    reducedMotion.matches ||
    gate.style.visibility === "hidden" ||
    event.target.closest("a")
  )
    return;
  anime.remove(doorHints);
  anime({
    targets: doorHints,
    opacity: [0, 1],
    duration: 160,
    easing: "easeOutQuad",
    complete: () => {
      anime({
        targets: doorHints,
        opacity: 0,
        delay: 850,
        duration: 450,
        easing: "easeInQuad",
      });
    },
  });
});

/** Three-second language slots: type for ~0.9s, hold, then erase briefly.
 * A stable accessible heading avoids screen readers announcing every letter.
 * Hidden tabs/closed intro do no typing work; reduced motion keeps English.
 */
const greetings = [
  ["en", "Hi, I am Chibueze."],
  ["ja", "こんにちは、Chibuezeです。"],
  ["ig", "Ndewo, aha m bụ Chibueze."],
  ["fr", "Bonjour, je suis Chibueze."],
  ["zh", "你好，我是 Chibueze。"],
  ["pa", "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ, ਮੈਂ ਹਾਂ Chibueze."],
];
const typedGreeting = document.querySelector(".typed-greeting");
const greetingStart = performance.now();
setInterval(() => {
  if (
    reducedMotion.matches ||
    document.hidden ||
    gate.style.visibility === "hidden"
  )
    return;
  const elapsed = performance.now() - greetingStart;
  const [language, phrase] =
    greetings[Math.floor(elapsed / 3000) % greetings.length];
  const letters = Array.from(phrase),
    phase = elapsed % 3000;
  const count =
    phase < 900
      ? Math.ceil((phase / 900) * letters.length)
      : phase > 2750
        ? Math.ceil(((3000 - phase) / 250) * letters.length)
        : letters.length;
  typedGreeting.lang = language;
  typedGreeting.textContent = letters.slice(0, count).join("");
}, 50);

// Long-form readers preserve the flight position and native keyboard access.
import { installReadingViews } from "./reading-view.js";
installReadingViews();
