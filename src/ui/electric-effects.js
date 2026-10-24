/** Small local SVG effects, independent of the scroll-owned flight sequence.
 * Bounded DOM pools, coarse-pointer exclusion and visibility gating keep these
 * decorations from intercepting input or running unnecessarily in the background.
 */
import anime from "animejs/lib/anime.es.js";
import { svgPolyline } from "../scene/lightning-geometry.js";
const NS = "http://www.w3.org/2000/svg";

/** All effects share the same red edge / black core as the main discharge. */
function electricStroke(parent) {
  const group = document.createElementNS(NS, "g");
  const paths = ["electric-halo", "electric-edge", "electric-core"].map(
    (name) => {
      const path = document.createElementNS(NS, "path");
      path.setAttribute("class", name);
      group.append(path);
      return path;
    },
  );
  parent.append(group);
  return {
    group,
    setPath: (d) => paths.forEach((path) => path.setAttribute("d", d)),
  };
}

/** A connected, age-fading trail rather than disconnected cursor starbursts.
 * Each segment starts EXACTLY at the preceding accepted pointer sample. Every
 * segment fades independently, producing a bright head and a vanishing wake.
 */
export function installCursorTrail(canvas, reducedMotion) {
  const finePointer = matchMedia("(pointer:fine)");
  let previous = null,
    lastTime = 0,
    serial = 0;
  const clear = () => {
    previous = null;
    canvas.querySelectorAll("g.cursor-segment").forEach((group) => {
      anime.remove(group);
      group.remove();
    });
  };
  window.addEventListener(
    "pointermove",
    (event) => {
      if (
        reducedMotion.matches ||
        !finePointer.matches ||
        event.pointerType === "touch" ||
        document.hidden
      )
        return;
      const now = performance.now(),
        point = { x: event.clientX, y: event.clientY };
      if (!previous || now - lastTime > 140) {
        previous = point;
        lastTime = now;
        return;
      }
      const dx = point.x - previous.x,
        dy = point.y - previous.y,
        length = Math.hypot(dx, dy);
      if (now - lastTime < 16 || length < 3) return;
      // Discontinuous pointer teleports must not draw a bolt across the page.
      if (length > 220) {
        previous = point;
        lastTime = now;
        return;
      }
      const normal = { x: -dy / length, y: dx / length };
      const amplitude = Math.min(9, length * 0.24),
        sign = ++serial % 2 ? 1 : -1;
      const points = [
        previous,
        ...[0.28, 0.6, 0.82].map((t, i) => ({
          x:
            previous.x + dx * t + normal.x * amplitude * (i % 2 ? -sign : sign),
          y:
            previous.y + dy * t + normal.y * amplitude * (i % 2 ? -sign : sign),
        })),
        point,
      ];
      const segment = electricStroke(canvas);
      segment.group.classList.add("cursor-segment");
      segment.setPath(svgPolyline(points));
      const pool = canvas.querySelectorAll(".cursor-segment");
      if (pool.length > 36) {
        anime.remove(pool[0]);
        pool[0].remove();
      }
      anime({
        targets: segment.group,
        opacity: [0.95, 0],
        duration: 650,
        easing: "easeOutQuad",
        complete: () => segment.group.remove(),
      });
      previous = point;
      lastTime = now;
    },
    { passive: true },
  );
  window.addEventListener("blur", clear);
  document.documentElement.addEventListener("pointerleave", clear);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) clear();
  });
  reducedMotion.addEventListener("change", clear);
  finePointer.addEventListener("change", clear);
}

/** Fixed discharge sites coat the supplied silhouette. Only local deformation
 * and opacity change with time: no angle, center or orbit advances around him.
 * The shared rig still provides the character's existing gentle float.
 */
export function installCharacterElectricity(rig, reducedMotion) {
  if (!rig) return;
  const rear = rig.querySelector(".character-electric-back");
  const front = rig.querySelector(".character-electric-front");
  // Authored in the cutout's 564px coordinate system: hair, shoulder, waist,
  // raised leg, lower leg and sash. Keep the face and contact controls clear.
  const sites = [
    [
      [270, 65],
      [300, 48],
      [313, 64],
      [338, 52],
      [355, 74],
    ],
    [
      [120, 190],
      [101, 217],
      [115, 229],
      [98, 248],
      [120, 267],
    ],
    [
      [209, 300],
      [235, 283],
      [248, 303],
      [269, 291],
      [288, 309],
    ],
    [
      [466, 219],
      [480, 241],
      [465, 254],
      [484, 276],
      [463, 294],
    ],
    [
      [121, 365],
      [101, 387],
      [118, 400],
      [104, 424],
      [126, 438],
    ],
    [
      [353, 397],
      [375, 415],
      [358, 429],
      [380, 448],
      [362, 469],
    ],
  ];
  const channels = Array.from({ length: sites.length }, () => ({
    rear: electricStroke(rear),
    front: electricStroke(front),
  }));
  let visible = false,
    frame = 0,
    last = 0;
  function stop() {
    cancelAnimationFrame(frame);
    frame = 0;
    rig.style.setProperty("--electric-glow", "0");
  }
  function tick(now) {
    if (!visible || document.hidden || reducedMotion.matches) {
      stop();
      return;
    }
    if (now - last > 40) {
      const seconds = now / 1000;
      let strongest = 0;
      channels.forEach((channel, index) => {
        // Each burst lasts ~1.8s inside a ~3s cycle. Smooth edges keep the
        // black-flash-inspired surges local and avoid repeated hard strobing.
        const cycle = (seconds / (2.6 + index * 0.13) + index * 0.23) % 1;
        const envelope =
          cycle < 0.66 ? Math.sin((cycle / 0.66) * Math.PI) ** 2 : 0;
        strongest = Math.max(strongest, envelope);
        // Endpoints remain fixed. A few pixels of normal deformation make
        // each anchored channel crackle without migrating around the body.
        const points = sites[index].map(([x, y], sample) => ({
          x:
            x +
            (sample === 0 || sample === 4
              ? 0
              : Math.sin(seconds * 8 + sample * 2 + index) * 3),
          y:
            y +
            (sample === 0 || sample === 4
              ? 0
              : Math.sin(seconds * 6 + sample + index) * 2),
        }));
        const path = svgPolyline(points);
        const paths = {
          front: index % 3 === 0 ? "" : path,
          rear: index % 3 === 0 ? path : "",
        };
        for (const layer of ["front", "rear"]) {
          channel[layer].setPath(paths[layer]);
          channel[layer].group.style.opacity = String(
            envelope * (layer === "front" ? 0.85 : 0.65),
          );
        }
      });
      rig.style.setProperty("--electric-glow", String(strongest * 0.23));
      last = now;
    }
    frame = requestAnimationFrame(tick);
  }
  function resume() {
    if (visible && !document.hidden && !reducedMotion.matches && !frame)
      frame = requestAnimationFrame(tick);
    else if (document.hidden || reducedMotion.matches) stop();
  }
  // Offscreen contact artwork incurs no animation work during the gate flight.
  const observer = new IntersectionObserver(
    (entries) => {
      visible = entries[0].isIntersecting;
      if (visible) resume();
      else stop();
    },
    { threshold: 0.05 },
  );
  observer.observe(rig);
  document.addEventListener("visibilitychange", resume);
  reducedMotion.addEventListener("change", resume);
}
