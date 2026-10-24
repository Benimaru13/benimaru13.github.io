import test from "node:test";
import assert from "node:assert/strict";
import {
  gateProgress,
  beamDistance,
  projectPoint,
  checkpointVisibility,
  CHECKPOINTS,
  extendTrailBehindViewport,
  cameraDistance,
  advancePortalMotion,
} from "../src/scene/journey-math.js";

test("the racing beam cannot appear before the doors fully open", () => {
  assert.equal(gateProgress(0), 0);
  assert.equal(gateProgress(0.19), 1);
  assert.ok(beamDistance(0.19) < 0);
  assert.ok(beamDistance(0.22) < 0);
  assert.ok(beamDistance(0.3) > 2500);
});
test("clouds grow and move outward when approached, and disappear behind camera", () => {
  const point = { x: 800, y: 400, z: 2000 };
  const far = projectPoint(point, 0, 1280, 800);
  const near = projectPoint(point, 1400, 1280, 800);
  assert.ok(near.scale > far.scale * 3);
  assert.ok(near.x > far.x);
  assert.ok(near.y > far.y);
  assert.equal(projectPoint(point, 1950, 1280, 800), null);
  assert.equal(projectPoint(point, 2500, 1280, 800), null);
});
test("each checkpoint has a full readable hold, then disappears without overlapping another", () => {
  for (const current of CHECKPOINTS) {
    assert.equal(checkpointVisibility(current.at, current.at).opacity, 1);
    assert.equal(checkpointVisibility(current.at + 0.1, current.at).opacity, 0);
    assert.equal(checkpointVisibility(current.at - 0.1, current.at).opacity, 0);
    assert.equal(
      CHECKPOINTS.filter(
        (item) => checkpointVisibility(current.at, item.at).opacity > 0.5,
      ).length,
      1,
    );
  }
});

test("the near beam endpoint is outside the viewport even at a central bend", () => {
  for (const points of [
    [
      { x: 640, y: 360 },
      { x: 700, y: 300 },
    ],
    [
      { x: 640, y: 360 },
      { x: 640, y: 360 },
    ],
  ]) {
    const extended = extendTrailBehindViewport(points, 1280, 720);
    const first = extended[0];
    assert.ok(first.x < 0 || first.x > 1280 || first.y < 0 || first.y > 720);
    assert.deepEqual(extended.slice(1), points);
  }
});

test("cloud camera travel begins before the doors finish opening", () => {
  assert.equal(cameraDistance(0), 0);
  assert.ok(cameraDistance(0.01) > 0);
  assert.ok(cameraDistance(0.05) > cameraDistance(0.01));
  assert.ok(gateProgress(0.05) < 1);
});

test("doorway cloud travel follows signed scroll and retracts over the same distance", () => {
  const start = { progress: 0.05, phase: 0.3 };
  const forward = advancePortalMotion(start, 0.08, 0.033);
  assert.ok(forward.phase > start.phase);
  const backward = advancePortalMotion(forward, 0.05, 0.033);
  assert.ok(Math.abs(backward.phase - start.phase) < 1e-12);
});
test("paused cloud drift is gentle, bounded after sleep, and resets at the closed gate", () => {
  const start = { progress: 0.05, phase: 0.3 };
  const idle = advancePortalMotion(start, 0.05, 0.1);
  assert.ok(idle.phase > start.phase && idle.phase - start.phase < 0.002);
  assert.deepEqual(advancePortalMotion(start, 0.05, 60), idle);
  assert.equal(advancePortalMotion(idle, 0, 0.033).phase, 0);
});
