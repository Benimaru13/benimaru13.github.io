import test from "node:test";
import assert from "node:assert/strict";
import { flightRoutePoint } from "../src/scene/lightning-geometry.js";

/** Test the incoming silhouette, not merely a leg's midpoint. A large skew
 * can make a seemingly low bank curl overhead again just before contact.
 * Positive world y projects below the eye line, so these signs distinguish
 * the intended dive, rising arrival and low banking arrival. */
test("checkpoint approaches alternate overhead and below-eye arrivals", () => {
  const knots = [
    { x: 750, y: 800, z: -500 },
    { x: 1050, y: 120, z: 9000 },
    { x: -1130, y: -230, z: 15000 },
    { x: 1210, y: 120, z: 21500 },
  ];
  const expectedSigns = [-1, 1, 1];
  for (let leg = 1; leg < knots.length; leg++) {
    const a = knots[leg - 1],
      b = knots[leg];
    for (const fraction of [0.9, 0.96, 0.99]) {
      const incoming = flightRoutePoint(knots, a.z + (b.z - a.z) * fraction);
      assert.ok(
        (incoming.y - b.y) * expectedSigns[leg - 1] > 0,
        `leg ${leg} approaches from the wrong vertical side at ${fraction}`,
      );
    }
    assert.deepEqual(flightRoutePoint(knots, b.z), b, "route missed its orb");
  }
  // The final checkpoint should bank in obliquely, not repeat a vertical
  // climb with a different midpoint. These are world units; perspective
  // applies the same scale to x/y, preserving this incoming-angle distinction.
  const from = knots[2],
    destination = knots[3];
  const bank = flightRoutePoint(
    knots,
    from.z + (destination.z - from.z) * 0.96,
  );
  const horizontal = Math.abs(bank.x - destination.x);
  const vertical = Math.abs(bank.y - destination.y);
  assert.ok(horizontal > 25, "third arrival lost its visible lateral bank");
  assert.ok(
    horizontal > vertical * 0.8,
    "third arrival became nearly vertical",
  );
});
