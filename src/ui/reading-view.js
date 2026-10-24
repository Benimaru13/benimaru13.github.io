import { renderReader } from "./reader-template.js";
import { installProjectMedia } from "./project-view.js";
import { pages } from "../content/pages.js";

/** Native dialog owns focus containment and Escape; closing restores the
 * exact flight coordinate and the control that opened it. */
export function installReadingViews({
  onOpen = () => {},
  onClose = () => {},
} = {}) {
  const reader = document.createElement("dialog");
  reader.className = "reading-view";
  reader.setAttribute("aria-labelledby", "reader-title");
  document.body.append(reader);
  let trigger = null,
    flightScroll = 0,
    previousOverflow = "";
  function close() {
    reader.close();
  }
  function open(button) {
    const page = pages[button.dataset.read];
    if (!page) return;
    trigger = button;
    flightScroll = window.scrollY;
    previousOverflow = document.body.style.overflow;
    reader.innerHTML = renderReader(button.dataset.read);
    installProjectMedia(reader);
    reader.querySelector(".reader-close").addEventListener("click", close);
    reader.querySelector(".reader-shrink").addEventListener("click", close);
    document.body.style.overflow = "hidden";
    reader.showModal();
    onOpen();
    reader.scrollTop = 0;
    reader.querySelector("h1").focus({ preventScroll: true });
  }
  reader.addEventListener("close", () => {
    document.body.style.overflow = previousOverflow;
    window.scrollTo({ top: flightScroll, behavior: "instant" });
    trigger?.focus({ preventScroll: true });
    reader.replaceChildren();
    onClose();
  });
  document
    .querySelectorAll("[data-read]")
    .forEach((button) => button.addEventListener("click", () => open(button)));
}
