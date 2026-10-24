/** Pure scene math, shared with Node's built-in tests. World distances are
 * arbitrary scene units; they are never accumulated from scroll events. */
export const clamp = (value) => Math.max(0, Math.min(1, value));
export const smoothstep = (value) => {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
};
export const CHECKPOINTS = [
  { id: "experience", at: 0.46, label: "01 / PERSONAL PROFILE" },
  { id: "projects", at: 0.67, label: "02 / EXPERIENCES" },
  { id: "hobbies", at: 0.88, label: "03 / PROJECTS" },
];

// A short arrival, readable hold, then recession. Checkpoint windows do not
// overlap, so only one content panel can be active at a time.
export function checkpointVisibility(progress, at) {
  const arrival = smoothstep((progress - (at - 0.065)) / 0.04);
  const departure = smoothstep((progress - (at + 0.025)) / 0.055);
  return {
    opacity: arrival * (1 - departure),
    scale: 0.025 + 0.975 * arrival - 0.975 * departure,
    arrival,
    departure,
  };
}

/** Perspective projection makes objects grow and move away from the vanishing
 * point as the camera approaches, then removes them as they pass behind it. */
export function projectPoint(point, cameraZ, width, height) {
  const distance = point.z - cameraZ;
  if (distance <= 80) return null;
  const focal = Math.min(width, height) * 0.95;
  return {
    x: width * 0.5 + (point.x * focal) / distance,
    y: height * 0.47 + (point.y * focal) / distance,
    scale: focal / distance,
    distance,
  };
}
export function beamDistance(progress) {
  // Invisible behind the camera until AFTER the gate finishes opening.
  // It overtakes from below/right, then establishes a lead in the cloud corridor.
  return -500 + 3500 * smoothstep((progress - 0.215) / 0.085);
}
export function gateProgress(progress) {
  return smoothstep(progress / 0.19);
}

/** Extend the near end beyond the viewport so a finite source/capped tail can
 * never be visible, even when a projected bend points toward screen center. */
export function extendTrailBehindViewport(points, width, height) {
  if (points.length < 2) return points;
  const first = points[0],
    next = points[1];
  const dx = first.x - next.x;
  const dy = first.y - next.y || (dx === 0 ? 1 : 0);
  const length = Math.hypot(dx, dy) || 1;
  const reach = Math.max(width, height) * 5;
  return [
    { x: first.x + (dx / length) * reach, y: first.y + (dy / length) * reach },
    ...points,
  ];
}

/** Camera travel starts with the opening, including the first small crack. */
export function cameraDistance(progress) {
  const keys = [
    [0, 0],
    [0.2, 1600],
    [0.395, 6100],
    [0.435, 7200],
    [0.485, 7280],
    [0.55, 10000],
    [0.605, 12000],
    [0.645, 13700],
    [0.695, 13780],
    [0.76, 16500],
    [0.815, 18500],
    [0.855, 20100],
    [0.905, 20180],
    [1, 25000],
  ];
  for (let i = 1; i < keys.length; i++) {
    if (progress <= keys[i][0]) {
      const [start, startZ] = keys[i - 1],
        [end, endZ] = keys[i];
      return (
        startZ +
        (endZ - startZ) * smoothstep((progress - start) / (end - start))
      );
    }
  }
  return 25000;
}

/** Door-cloud phase is driven primarily by signed scroll distance. Time adds
 * only a slow idle drift, and a bounded timestep avoids jumps after tab sleep.
 * Returning to the closed gate resets the stream's starting position. */
export function advancePortalMotion(previous, progress, deltaSeconds) {
  const delta = progress - previous.progress;
  const idleDrift =
    Math.abs(delta) < 0.000001
      ? Math.min(0.1, Math.max(0, deltaSeconds)) * 0.018
      : 0;
  return {
    progress,
    phase: progress <= 0.0007 ? 0 : previous.phase + delta * 5.5 + idleDrift,
  };
}
