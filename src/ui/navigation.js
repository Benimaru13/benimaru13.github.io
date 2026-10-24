import { CHECKPOINTS } from "../scene/journey-math.js";

/** Native anchors stay native in reduced motion; animated anchors map to a
 * world checkpoint and focus without scrolling the sticky scene internally. */
export function installNavigation(reducedMotion, requestRender) {
  const journey = document.querySelector(".journey");
  const scene = document.querySelector(".scene");
  // Checkpoint links jump to their scroll coordinate, then focus the semantic
  // section. Reduced-motion mode retains standard anchor/reading behavior.
  function navigateTo(id) {
    const checkpoint = CHECKPOINTS.find((item) => item.id === id);
    if (!checkpoint || reducedMotion.matches) return false;
    window.scrollTo({
      top: checkpoint.at * (journey.offsetHeight - scene.clientHeight),
      behavior: "instant",
    });
    // Visibility must be painted before focus; hidden sections cannot receive it.
    requestRender(() =>
      document.getElementById(id).focus({ preventScroll: true }),
    );
    return true;
  }
  document.querySelectorAll('a[href^="#"]').forEach((link) =>
    link.addEventListener("click", (event) => {
      const id = link.getAttribute("href").slice(1);
      if (navigateTo(id)) {
        event.preventDefault();
        history.replaceState(null, "", `#${id}`);
      }
      if (id === "top" && !reducedMotion.matches) {
        event.preventDefault();
        window.scrollTo({ top: 0, behavior: "instant" });
        history.replaceState(null, "", location.pathname);
      }
    }),
  );
  // A checkpoint lives in the sticky scene, so the browser's ordinary anchor
  // restoration can compete with its virtual scroll coordinate after a reload.
  // Reapply it after pageshow/layout; normal contact and reduced-motion anchors
  // retain browser behavior. Manual restoration is scoped to checkpoint URLs.
  if (
    !reducedMotion.matches &&
    CHECKPOINTS.some((item) => `#${item.id}` === location.hash)
  ) {
    history.scrollRestoration = "manual";
  }
  function placeInitialAnchor() {
    requestAnimationFrame(() => {
      if (!navigateTo(location.hash.slice(1))) requestRender();
    });
  }
  placeInitialAnchor();
  window.addEventListener("pageshow", placeInitialAnchor);
}
