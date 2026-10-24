import {
  clamp,
  smoothstep,
  projectPoint,
  advancePortalMotion,
} from "./journey-math.js";
import { cloudApertureMask } from "./lightning-geometry.js";
/** Fixed world-depth clouds and six reversible doorway volumes. Their phase
 * is local to this renderer; no DOM event or independent RAF is installed. */
export function createClouds() {
  const cloudField = document.querySelector(".cloud-field");
  const portalBack = document.querySelector(".portal-back");
  const portalFront = document.querySelector(".portal-front");
  // Each ambient cloud physically crosses a gate plane: the rear layer is
  // occluded by solid doors; the front copy expands out of the actual aperture.
  // Signed scroll drives travel; stopping allows only a very slow ambient drift.
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
      const x =
        width * 0.5 + (cloud.x + cloud.side * near * near * 1100) * scale;
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

  function synchronizePortal(progress, now) {
    if (progress !== portalMotion.progress) {
      portalMotion = advancePortalMotion(portalMotion, progress, 0);
      lastPortalScroll = now;
    }
  }
  function renderPortal(now, state, deltaSeconds) {
    renderPortalClouds(
      now / 1000,
      state,
      now - lastPortalScroll > 120 ? deltaSeconds : 0,
    );
  }
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

  return { renderClouds, renderPortal, synchronizePortal };
}
