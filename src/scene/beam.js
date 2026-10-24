import {
  CHECKPOINTS,
  cameraDistance,
  clamp,
  smoothstep,
  projectPoint,
  beamDistance,
  checkpointVisibility,
} from "./journey-math.js";
import {
  flightRoutePoint,
  buildLightningRibbon,
  svgPolyline,
} from "./lightning-geometry.js";
/** Builds one world route shared by beam geometry and checkpoint arrivals.
 * The scene orchestrator owns visibility; this renderer owns SVG geometry. */
export function createBeam() {
  const flight = document.querySelector(".flight");
  const speedLines = document.querySelector(".speed-lines");
  const namespace = "http://www.w3.org/2000/svg";
  const streaks = Array.from({ length: 26 }, (_, index) => {
    const element = document.createElementNS(namespace, "line");
    speedLines.append(element);
    return {
      element,
      angle: (index / 26) * Math.PI * 2,
      offset: index * 0.381,
    };
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
    // lightning-geometry.js. This preserves banking turns without packing bends at orbs.
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

  return {
    targets,
    finalTarget,
    finalBeacon,
    routePoint,
    renderBeam,
    renderSpeed,
  };
}
