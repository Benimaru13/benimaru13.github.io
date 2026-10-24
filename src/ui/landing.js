import anime from "animejs/lib/anime.es.js";
import { greetings } from "../content/greetings.js";
import { greetingAt } from "./typing.js";

/** Landing interactions never advance the scroll-driven journey. */
export function installLanding(reducedMotion) {
  const scene = document.querySelector(".scene");
  const gate = document.querySelector(".gate-camera");
  /** Clicks reveal latent paint ON each moving door, rather than opening it.
   * The scene listener also catches clicks over decorative fog layers. Native
   * scrolling remains the only way to advance the gate timeline. */
  const doorHints = document.querySelectorAll(".door-hint");
  scene.addEventListener("click", (event) => {
    if (
      reducedMotion.matches ||
      gate.style.visibility === "hidden" ||
      event.target.closest("a")
    )
      return;
    anime.remove(doorHints);
    anime({
      targets: doorHints,
      opacity: [0, 1],
      duration: 160,
      easing: "easeOutQuad",
      complete: () => {
        anime({
          targets: doorHints,
          opacity: 0,
          delay: 850,
          duration: 450,
          easing: "easeInQuad",
        });
      },
    });
  });

  /** Three-second language slots: type for ~0.9s, hold, then erase briefly.
   * A stable accessible heading avoids screen readers announcing every letter.
   * Hidden tabs/closed intro do no typing work; reduced motion keeps English.
   */
  const typedGreeting = document.querySelector(".typed-greeting");
  const greetingStart = performance.now();
  function renderGreeting(now) {
    if (
      reducedMotion.matches ||
      document.hidden ||
      gate.style.visibility === "hidden"
    )
      return;
    const elapsed = now - greetingStart;
    const { language, text } = greetingAt(elapsed, greetings);
    typedGreeting.lang = language;
    typedGreeting.textContent = text;
  }
  return { renderGreeting };
}
