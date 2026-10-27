/**
 * Screen-space discharge geometry.
 *
 * The traveller's destination still comes from the existing 3D route. Its
 * visible ribbon is deliberately shorter/simpler: depth sampling previously
 * projected many bends into a tiny area near an orb, creating tangled bundles.
 *
 * The world route supplies the centerline. Animated offsets act
 * only along local normals, with amplitude limited by bend spacing.
 * Bends are spaced in pixels rather than world depth; this also keeps wavelength
 * consistent across viewport sizes and around camera/orb pauses.
 */
/** A forward-only world route with alternating banking turns. Each leg
 * sweeps around a cloud bank in x/y while z always moves deeper. The envelope
 * vanishes at endpoints, keeping the beam's actual arrival on the orb exact. */
export function flightRoutePoint(knots, z) {
  for (let leg = 1; leg < knots.length; leg++) {
    const a = knots[leg - 1],
          b = knots[leg];

    if (z <= b.z) {
      const t = Math.max(0, Math.min(1, (z - a.z) / (b.z - a.z))); // segmentProgress or time stamp
      // Preserve exact contact coordinates despite sin(PI) roundoff.
      if (t === 0) return { ...a, z };
      if (t === 1) return { ...b, z };
      const ease = t * t * (3 - 2 * t);
      // Distinct approach silhouettes: overhead dive, upward climb, low bank,
      // then a gentle lift into the final beacon. Positive y is below eye line.
      const profile = [
        { lift: -650, sway: 900, skew: 170, lean: 0 },
        { lift: 850, sway: -760, skew: -220, lean: -180 },
        { lift: 480, sway: 1080, skew: 120, lean: 650 },
        { lift: -300, sway: -620, skew: -100, lean: 100 },
      ][(leg - 1) % 4];
      // lift for vertical climb or dive, sway for sideways movement, lean to tilt the curve to one side, skew to make the approach assymetrical

      const bendStrength = Math.sin(Math.PI * t);
      const verticalBend = profile.lift * bendStrength;
      const sidewaysLean = profile.lean * bendStrength;
      return {
        x:
          a.x + (b.x - a.x) * ease + // the basic beam's horizontal path
          profile.sway * Math.sin(2 * Math.PI * t) * bendStrength + sidewaysLean, // dynamic features that make the beam's horizontal more "alive"
        y:
          a.y + (b.y - a.y) * ease + // the basic beam's vertical path
           // this is the vertical bend that progressively towards the middle of the segment
          Math.sin(2 * Math.PI * t) * profile.skew + verticalBend,
        z,
      };
    }
  }
  return { ...knots.at(-1), z };
}

/** Resample by projected arc length, rather than depth. A distant curl must
 * not accumulate dozens of vertices into the same small screen area. The
 * trailing window is deliberately bounded; old turns disappear behind us. */
function spacedGuide(guide, spacing = 62) {
  const distances = [0];
  for (let i = 1; i < guide.length; i++) {
    distances.push(
      distances.at(-1) +
        Math.hypot(guide[i].x - guide[i - 1].x, guide[i].y - guide[i - 1].y),
    );
  }
  const total = distances.at(-1);
  const begin = Math.max(0, total - 1900);
  const count = Math.max(3, Math.min(36, Math.ceil((total - begin) / spacing)));
  let index = 1;
  const samples = Array.from({ length: count + 1 }, (_, i) => {
    const distance = begin + ((total - begin) * i) / count;
    while (index < distances.length - 1 && distances[index] < distance) index++;
    const t =
      (distance - distances[index - 1]) /
      Math.max(0.001, distances[index] - distances[index - 1]);
    return {
      x: guide[index - 1].x + (guide[index].x - guide[index - 1].x) * t,
      y: guide[index - 1].y + (guide[index].y - guide[index - 1].y) * t,
    };
  });
  // An equal arc interval can still straddle a tight projected U-turn and
  // produce two nearly identical screen points. Remove that local crowding
  // before electrical displacement, while preserving the exact head endpoint.
  const separated = [samples[0]],
    minimum = Math.min(24, total / 4);
  for (let i = 1; i < samples.length - 1; i++) {
    const previous = separated.at(-1),
      point = samples[i];
    if (Math.hypot(point.x - previous.x, point.y - previous.y) >= minimum)
      separated.push(point);
  }
  const endpoint = samples.at(-1);
  while (
    separated.length > 1 &&
    Math.hypot(
      endpoint.x - separated.at(-1).x,
      endpoint.y - separated.at(-1).y,
    ) < minimum
  )
    separated.pop();
  separated.push(endpoint);
  return separated;
}

/** Keep the caller's 3D trajectory; electricity is a separate, restrained
 * displacement along its local normal. A straight fallback supports isolated
 * geometry tests. Time drives surges/branch growth, never travel progress. */
export function buildLightningRibbon(
  head,
  width,
  height,
  seconds = 0,
  guide = null,
) {
  const start = { x: width + 180, y: height + 160 };
  if (Math.hypot(head.x - start.x, head.y - start.y) < 1) start.x += width;
  const center = spacedGuide(
    guide?.length > 1 ? guide : [start, head],
    guide ? 62 : 105,
  );
  const last = center.length - 1;
  const normals = [];
  const points = center.map((point, index) => {
    const a = center[Math.max(0, index - 1)],
      b = center[Math.min(last, index + 1)];
    const length = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    const normal = { x: -(b.y - a.y) / length, y: (b.x - a.x) / length };
    normals.push(normal);
    if (index === 0 || index === last)
      return index === last ? { ...head } : { ...point };
    const spacing = Math.hypot(
      point.x - center[index - 1].x,
      point.y - center[index - 1].y,
    );
    const amplitude = Math.min(
      26,
      spacing * 0.3,
      Math.min(width, height) * 0.045,
    );
    const envelope = Math.sin((index / last) * Math.PI) ** 0.6;
    // The phase moves toward the tip. No random frame-to-frame jumps or
    // opacity strobes: the same pulse also feeds the growing branch channels.
    const phase = index * 7.7 - seconds * 8;
    const carrier = (2 / Math.PI) * Math.asin(Math.sin(phase));
    const offset = amplitude * envelope * carrier;
    return { x: point.x + normal.x * offset, y: point.y + normal.y * offset };
  });
  const branches = [];
  for (let index = 2; index < last - 2; index += 3) {
    const origin = points[index],
      normal = normals[index];
    const sign = index % 2 ? 1 : -1;
    const tangent = { x: normal.y, y: -normal.x };
    // A channel grows root -> kink -> fork tip, then drains in that order.
    // Spatial phase offsets make the discharge propagate down the beam rather
    // than all branches breathing simultaneously like rigid decorations.
    const cycle = (((seconds * 1.1 - index * 0.13) % 1) + 1) % 1;
    const growth = Math.min(1, cycle / 0.42);
    const drain = Math.max(0, (cycle - 0.68) / 0.32);
    const reach = 28 + 9 * Math.sin(index * 1.7);
    const channel = [
      origin,
      {
        x: origin.x + normal.x * sign * reach * 0.5 + tangent.x * 13,
        y: origin.y + normal.y * sign * reach * 0.5 + tangent.y * 13,
      },
      {
        x: origin.x + normal.x * sign * reach * 0.8 - tangent.x * 5,
        y: origin.y + normal.y * sign * reach * 0.8 - tangent.y * 5,
      },
      {
        x: origin.x + normal.x * sign * reach * 1.7 + tangent.x * 19,
        y: origin.y + normal.y * sign * reach * 1.7 + tangent.y * 19,
      },
    ];
    const sample = (t) => {
      const scaled = t * (channel.length - 1),
        i = Math.min(channel.length - 2, Math.floor(scaled)),
        f = scaled - i;
      return {
        x: channel[i].x + (channel[i + 1].x - channel[i].x) * f,
        y: channel[i].y + (channel[i + 1].y - channel[i].y) * f,
      };
    };
    if (growth > drain + 0.02) {
      const visible = [sample(drain)];
      for (let i = 1; i < channel.length - 1; i++)
        if (i / 3 > drain && i / 3 < growth) visible.push(channel[i]);
      visible.push(sample(growth));
      branches.push(visible);
    }
  }
  // If the bounded wake starts inside view, extend its incoming tangent
  // beyond the camera edge so a capped source can never appear on screen.
  if (
    guide &&
    points[0].x > -100 &&
    points[0].x < width + 100 &&
    points[0].y > -100 &&
    points[0].y < height + 100
  ) {
    const first = points[0],
      next = points[1];
    const dx = first.x - next.x,
      dy = first.y - next.y,
      length = Math.hypot(dx, dy) || 1;
    const reach = Math.max(width, height) * 4;
    points.unshift({
      x: first.x + (dx / length) * reach,
      y: first.y + (dy / length) * reach,
    });
  }
  const dx = head.x - points[0].x,
    dy = head.y - points[0].y,
    length = Math.hypot(dx, dy) || 1;
  const tip = points.at(-2);
  return {
    points,
    branches,
    axis: { x: dx / length, y: dy / length },
    angle: (Math.atan2(head.y - tip.y, head.x - tip.x) * 180) / Math.PI,
  };
}

/** Scroll-pure infection: starts at beam contact, persists after departure,
 * and restores gold along exactly the same curve when the visitor reverses. */
export function orbCharge(progress, checkpointAt) {
  const t = Math.max(
    0,
    Math.min(1, (progress - (checkpointAt - 0.065)) / 0.04),
  );
  return t * t * (3 - 2 * t);
}

/** Serialize all three beam strokes from the same geometry to prevent seams. */
export function svgPolyline(points) {
  return points
    .map(
      (point, index) =>
        `${index ? "L" : "M"}${point.x.toFixed(2)},${point.y.toFixed(2)}`,
    )
    .join(" ");
}

/** Soft cloud aperture: zero clips everything, one uses the sprite's original
 * alpha, and intermediate values feather the edges instead of slicing them. */
export function cloudApertureMask(aperture) {
  const amount = Math.max(0, Math.min(1, aperture));
  if (amount >= 0.995) return "none";
  if (amount === 0) return "linear-gradient(transparent, transparent)";
  const half = amount * 50;
  const feather = Math.min(10, half * 0.65);
  const outerLeft = Math.max(0, 50 - half - feather);
  const innerLeft = 50 - half + feather;
  return `linear-gradient(90deg, transparent ${outerLeft}%, #000 ${innerLeft}%, #000 ${100 - innerLeft}%, transparent ${100 - outerLeft}%)`;
}
