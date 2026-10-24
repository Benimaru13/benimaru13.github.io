/** One scheduler owns scroll and atmosphere updates. Events only mark work;
 * geometry paints once on the next display frame, before ambient deformation.
 * Decorative pointer/character effects own separate visibility-gated lifetimes.
 * Browser functions are injected so scheduling can be tested without a DOM.
 */
export function createFrameLoop({
  renderScroll,
  renderAmbient,
  reducedMotion,
  requestFrame = requestAnimationFrame,
  cancelFrame = cancelAnimationFrame,
  documentState = document,
}) {
  let frame = 0;
  let paused = false;
  let dirty = true;
  const afterRender = [];
  let lastAmbient = -Infinity;
  function tick(now) {
    frame = 0;
    if (paused || documentState.hidden || reducedMotion.matches) return;
    if (dirty) {
      dirty = false;
      renderScroll();
      afterRender.splice(0).forEach((callback) => callback());
    }
    // Thirty ambient paints per second are enough for gentle atmosphere.
    if (now - lastAmbient >= 1000 / 30) {
      // Resume without integrating hidden/modal time into cloud transport.
      const deltaSeconds = Number.isFinite(lastAmbient)
        ? Math.min(0.1, Math.max(0, (now - lastAmbient) / 1000))
        : 0;
      renderAmbient(now, deltaSeconds);
      lastAmbient = now;
    }
    frame = requestFrame(tick);
  }
  function start() {
    if (!frame && !paused && !documentState.hidden && !reducedMotion.matches)
      frame = requestFrame(tick);
  }
  function invalidate(callback) {
    // Event listeners pass an Event; only explicit navigation callbacks queue.
    if (typeof callback === "function") afterRender.push(callback);
    dirty = true;
    start();
  }
  function onVisibility() {
    if (documentState.hidden) {
      cancelFrame(frame);
      frame = 0;
    } else {
      lastAmbient = -Infinity;
      invalidate();
    }
  }
  documentState.addEventListener("visibilitychange", onVisibility);
  return {
    start,
    invalidate,
    setPaused(value) {
      paused = value;
      if (paused) {
        cancelFrame(frame);
        frame = 0;
      } else {
        lastAmbient = -Infinity;
        invalidate();
      }
    },
    stop() {
      cancelFrame(frame);
      frame = 0;
      afterRender.length = 0;
      documentState.removeEventListener("visibilitychange", onVisibility);
    },
  };
}
