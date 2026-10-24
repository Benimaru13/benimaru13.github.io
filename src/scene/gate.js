import anime from "animejs/lib/anime.es.js";

/** Paused timeline: callers seek with absolute scroll progress, never autoplay. */
export function createGateTimeline() {
  // A small paused Anime.js timeline handles the doors' weight and their
  // concurrent camera push. No elapsed clock can open the doors on page load.
  const opening = anime
    .timeline({ autoplay: false, easing: "easeInOutCubic" })
    .add(
      { targets: ".door-left", translateX: ["0%", "-108%"], duration: 1000 },
      0,
    )
    .add(
      { targets: ".door-right", translateX: ["0%", "108%"], duration: 1000 },
      0,
    )
    .add(
      {
        targets: ".gate-camera",
        scale: [1, 2.35],
        duration: 1000,
        easing: "easeInQuad",
      },
      0,
    )
    .add(
      {
        targets: ".intro-copy",
        opacity: [1, 0],
        duration: 270,
        easing: "linear",
      },
      0,
    );

  return opening;
}
