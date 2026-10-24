import { escapeHtml as html } from "./html.js";
import { projectGroups } from "../content/projects.js";

function externalLink(url, label) {
  return `<a href="${html(url)}" target="_blank" rel="noopener noreferrer">${html(label)}</a>`;
}
function projectMedia(item) {
  const media = item.media;
  if (!media)
    return `<figure class="photo-placeholder"><div aria-hidden="true">＋</div><figcaption>${html(item.title)}<br><small>Project media to be added</small></figcaption></figure>`;
  // A poster keeps the large GIF out of the initial network/decode workload.
  const toggle = media.poster
    ? `<button type="button" class="project-demo-toggle" data-demo-src="${html(media.src)}" data-demo-poster="${html(media.poster)}" aria-pressed="false">Play demo ▶</button>`
    : "";
  return `<figure class="reader-role-photo"><a href="${html(media.src)}" target="_blank" rel="noopener noreferrer"><img src="${html(media.poster || media.src)}" alt="${html(media.alt)}" loading="lazy"></a>${toggle}</figure>`;
}
function projectEntry(item) {
  const title = item.repo
    ? externalLink(item.repo, `${item.title} ↗`)
    : html(item.title);
  const links = item.links
    .map((link) => externalLink(link.url, link.label))
    .join("");
  return `<article class="reader-chapter project-entry"><div><p class="reader-label">${item.date ? html(item.date) : "PROJECT"}</p><h3>${title}</h3><p>${html(item.description)}</p><div class="project-links">${links}</div></div>${projectMedia(item)}</article>`;
}
/** Render trusted local project data without changing its authored ordering.
 * Navigation and event listeners belong to the reader, not content modules.
 */
export function renderProjectGroups() {
  return projectGroups
    .map(
      (group) =>
        `<section class="project-group"><h2>${html(group.title)}</h2>${group.items.map(projectEntry).join("")}</section>`,
    )
    .join("");
}

/** Heavy GIFs start as static posters. Only an explicit play loads the GIF;
 * pausing replaces it with the poster, stopping animation and decode work. */
export function installProjectMedia(reader) {
  reader.querySelectorAll(".project-demo-toggle").forEach((button) =>
    button.addEventListener("click", () => {
      const playing = button.getAttribute("aria-pressed") === "true";
      const image = button.closest("figure").querySelector("img");
      image.src = playing ? button.dataset.demoPoster : button.dataset.demoSrc;
      button.setAttribute("aria-pressed", String(!playing));
      button.textContent = playing ? "Play demo ▶" : "Pause demo ⏸";
    }),
  );
}
