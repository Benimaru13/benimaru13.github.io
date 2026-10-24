import test from "node:test";
import assert from "node:assert/strict";
import { buildLightningRibbon, cloudApertureMask } from "../src/lightning.js";

/** Regression coverage for the screenshot bug: near-head depth samples used
 * to bunch together and cross. Sweep positions, aspect ratios and animation
 * phases, including tiny viewports and a head temporarily outside the frame. */
test("every visible lightning segment advances without folding back or bundling", () => {
  for (const [width, height] of [
    [1280, 720],
    [390, 844],
    [1920, 1080],
  ]) {
    for (const fraction of [0.1, 0.3, 0.5, 0.8, 1.3]) {
      for (const seconds of [0, 0.4, 1.2, 4, 12, 35]) {
        const target = {
          x: width * fraction,
          y: height * (1 - fraction * 0.5),
        };
        const ribbon = buildLightningRibbon(target, width, height, seconds);
        const { points, axis } = ribbon;
        assert.ok(
          points[0].x > width || points[0].y > height,
          "the source must stay behind camera",
        );
        assert.deepEqual(
          points.at(-1),
          target,
          "the head must meet its destination",
        );
        let previous = -Infinity;
        const forwardDistances = [];
        for (const point of points) {
          const forward = point.x * axis.x + point.y * axis.y;
          assert.ok(
            forward > previous,
            "a segment folded back toward another segment",
          );
          if (Number.isFinite(previous))
            forwardDistances.push(forward - previous);
          previous = forward;
        }
        assert.ok(
          Math.max(...forwardDistances) - Math.min(...forwardDistances) < 1e-8,
          "wavelength compressed at the tip",
        );
      }
    }
  }
});
test("discharge animates without changing the endpoint or the number of bends", () => {
  const target = { x: 420, y: 280 };
  const first = buildLightningRibbon(target, 1280, 720, 0);
  const later = buildLightningRibbon(target, 1280, 720, 0.6);
  assert.equal(first.points.length, later.points.length);
  assert.notDeepEqual(first.points.slice(1, -1), later.points.slice(1, -1));
  assert.deepEqual(first.points.at(-1), later.points.at(-1));
});
test("cloud reveal has feathered, ordered alpha stops instead of a hard rectangle", () => {
  assert.equal(cloudApertureMask(1), "none");
  assert.match(cloudApertureMask(0), /transparent/);
  for (const amount of [0.01, 0.1, 0.5, 0.9]) {
    const stops = cloudApertureMask(amount)
      .match(/[\d.]+%/g)
      .map((value) => parseFloat(value));
    assert.equal(stops.length, 4);
    assert.ok(
      stops[0] < stops[1] && stops[1] <= stops[2] && stops[2] < stops[3],
    );
  }
});

/** Route endpoints are shared with checkpoint projection: the optical wake
 * may bend, but its traveller must still physically meet each destination. */
test("world route banks in depth and lands exactly on checkpoint knots", async () => {
  const { flightRoutePoint } = await import("../src/lightning.js");
  const knots = [
    { x: 200, y: 300, z: 0 },
    { x: 1000, y: 120, z: 5000 },
    { x: -1100, y: -230, z: 11000 },
  ];
  for (let i = 1; i < knots.length; i++) {
    assert.deepEqual(flightRoutePoint(knots, knots[i].z), knots[i]);
    const a = knots[i - 1],
      b = knots[i];
    const middle = flightRoutePoint(knots, (a.z + b.z) / 2);
    const displacement = middle.y - (a.y + b.y) / 2;
    assert.ok(
      i === 1 ? displacement < -500 : displacement > 700,
      "orb approaches must use different sides of the eye line",
    );
  }
});

test("orb red wash persists after contact and reverses without stored visited state", async () => {
  const { orbCharge } = await import("../src/lightning.js");
  for (const at of [0.46, 0.67, 0.88]) {
    assert.equal(orbCharge(at - 0.07, at), 0);
    assert.ok(
      orbCharge(at - 0.045, at) > 0.4 && orbCharge(at - 0.045, at) < 0.6,
    );
    assert.equal(orbCharge(at, at), 1);
    assert.equal(orbCharge(at + 0.1, at), 1);
    assert.equal(orbCharge(at - 0.07, at), 0);
  }
});

test("branch channels propagate in length rather than merely moving rigid forks", () => {
  const target = { x: 200, y: 200 };
  const length = (branch) =>
    branch
      .slice(1)
      .reduce(
        (sum, p, i) => sum + Math.hypot(p.x - branch[i].x, p.y - branch[i].y),
        0,
      );
  const early = buildLightningRibbon(target, 1280, 720, 0.1).branches.map(
    length,
  );
  const late = buildLightningRibbon(target, 1280, 720, 0.3).branches.map(
    length,
  );
  assert.notDeepEqual(early, late);
});

/** Exercise the real depth-projected route, not just the straight fixture.
 * Bound vertex count and spacing around camera movement and orb holds so
 * distant samples cannot collapse into the original dense bundle. */
test("projected banking wake stays finite and sparsely sampled through the journey", async () => {
  const { flightRoutePoint } = await import("../src/lightning.js");
  const {
    cameraDistance,
    beamDistance,
    checkpointVisibility,
    projectPoint,
    CHECKPOINTS,
  } = await import("../src/journey.js");
  const targets = CHECKPOINTS.map((c, i) => ({
    ...c,
    x: (i % 2 ? -1 : 1) * (1050 + i * 80),
    y: i % 2 ? -230 : 120,
    z: cameraDistance(c.at - 0.065) + 3000,
  }));
  const knots = [
    { x: 750, y: 800, z: -500 },
    ...targets,
    { x: 0, y: 0, z: cameraDistance(0.945) + 3000 },
  ];
  for (const [width, height] of [
    [1280, 720],
    [390, 844],
  ])
    for (let step = 31; step < 94; step++) {
      const progress = step / 100,
        cameraZ = cameraDistance(progress);
      let headZ = cameraZ + beamDistance(progress);
      for (const target of targets)
        if (progress >= target.at - 0.065 && progress <= target.at + 0.08)
          headZ =
            target.z +
            (headZ - target.z) *
              checkpointVisibility(progress, target.at).departure;
      const guide = Array.from({ length: 101 }, (_, i) => {
        const z = cameraZ + 95 + ((headZ - cameraZ - 95) * i) / 100;
        return projectPoint(flightRoutePoint(knots, z), cameraZ, width, height);
      });
      const ribbon = buildLightningRibbon(
        guide.at(-1),
        width,
        height,
        step * 0.3,
        guide,
      );
      assert.ok(ribbon.points.length <= 38, "unbounded wake sample count");
      assert.deepEqual(ribbon.points.at(-1), guide.at(-1));
      for (let i = 1; i < ribbon.points.length; i++) {
        const a = ribbon.points[i - 1],
          b = ribbon.points[i];
        assert.ok(Number.isFinite(b.x) && Number.isFinite(b.y));
        assert.ok(
          Math.hypot(b.x - a.x, b.y - a.y) > 8,
          "collapsed projected bend",
        );
      }
    }
});
