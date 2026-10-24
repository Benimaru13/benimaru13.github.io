import test from "node:test";
import assert from "node:assert/strict";
import { createFrameLoop } from "../src/scene/frame-loop.js";

/** Deterministic fake browser: frames advance only when the test requests one.
 * This catches duplicate scheduling without wall-clock sleeps or a real DOM.
 */
function harness(reduced = false) {
  let nextId = 1;
  const callbacks = new Map();
  const events = new Map();
  const calls = [];
  const ambientArguments = [];
  const documentState = {
    hidden: false,
    addEventListener: (name, fn) => events.set(name, fn),
    removeEventListener: (name) => events.delete(name),
  };
  const loop = createFrameLoop({
    renderScroll: () => calls.push("scroll"),
    renderAmbient: (now, deltaSeconds) => {
      calls.push("ambient");
      ambientArguments.push({ now, deltaSeconds });
    },
    reducedMotion: { matches: reduced },
    requestFrame: (fn) => {
      const id = nextId++;
      callbacks.set(id, fn);
      return id;
    },
    cancelFrame: (id) => callbacks.delete(id),
    documentState,
  });
  return {
    loop,
    calls,
    ambientArguments,
    callbacks,
    documentState,
    events,
    frame(now) {
      const [id, fn] = callbacks.entries().next().value;
      callbacks.delete(id);
      fn(now);
    },
  };
}
test("scroll bursts coalesce into one geometry paint before atmosphere", () => {
  const h = harness();
  h.loop.start();
  for (let i = 0; i < 50; i++) h.loop.invalidate();
  assert.equal(h.callbacks.size, 1);
  h.frame(0);
  assert.deepEqual(h.calls, ["scroll", "ambient"]);
  h.frame(16);
  assert.deepEqual(h.calls, ["scroll", "ambient"]);
  h.frame(34);
  assert.deepEqual(h.calls, ["scroll", "ambient", "ambient"]);
  h.loop.stop();
  assert.equal(h.callbacks.size, 0);
});
test("hidden documents cancel work and resume with fresh geometry", () => {
  const h = harness();
  h.loop.start();
  h.frame(0);
  h.calls.length = 0;
  h.documentState.hidden = true;
  h.events.get("visibilitychange")();
  assert.equal(h.callbacks.size, 0);
  h.loop.invalidate();
  assert.equal(h.callbacks.size, 0);
  h.documentState.hidden = false;
  h.events.get("visibilitychange")();
  h.frame(10000);
  assert.deepEqual(h.calls, ["scroll", "ambient"]);
  h.loop.stop();
});
test("reduced motion never starts the animated journey clock", () => {
  const h = harness(true);
  h.loop.start();
  h.loop.invalidate();
  assert.equal(h.callbacks.size, 0);
  h.loop.stop();
});

test("navigation focus callbacks run after geometry reveals the section", () => {
  const h = harness();
  h.loop.invalidate(() => h.calls.push("focus"));
  h.frame(0);
  assert.deepEqual(h.calls, ["scroll", "focus", "ambient"]);
  h.calls.length = 0;
  h.frame(40);
  assert.deepEqual(h.calls, ["ambient"]);
  h.loop.stop();
});

test("an open reader pauses scene work and closing resumes without a time jump", () => {
  const h = harness();
  h.loop.start();
  h.frame(0);
  h.calls.length = 0;
  h.loop.setPaused(true);
  h.loop.invalidate();
  assert.equal(h.callbacks.size, 0);
  h.loop.setPaused(false);
  h.frame(60000);
  assert.equal(h.ambientArguments.at(-1).deltaSeconds, 0);
  h.frame(120000);
  assert.equal(h.ambientArguments.at(-1).deltaSeconds, 0.1);
  assert.deepEqual(h.calls, ["scroll", "ambient", "ambient"]);
  h.loop.stop();
});
