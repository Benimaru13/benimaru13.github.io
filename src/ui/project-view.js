import { escapeHtml as html } from "./html.js";
import { projectGroups } from "../content/projects.js";

function externalLink(url, label) {
  return `<a href="${html(url)}" target="_blank" rel="noopener noreferrer">${html(label)}</a>`;
}
function projectMedia(item) {
  const media = item.media;
  if (!media) return ""; // empty text box if no media.

  // A poster keeps the large GIF out of the initial network/decode workload.
  const toggle = media.poster
    ? `
    <button 
    type="button" 
    class="project-demo-toggle" 
    data-demo-src="${html(media.src)}" 
    data-demo-poster="${html(media.poster)}" 
    aria-pressed="false">
    Play demo ▶
    </button>
    `
    : "";

  return `
  <figure 
  class="reader-role-photo">
  <a href="${html(media.src)}" 
  target="_blank" 
  rel="noopener noreferrer">
  
  <img src="${html(media.poster || media.src)}" alt="${html(media.alt)}" loading="lazy">
  
  </a>${toggle}</figure>
  `;
}
function projectEntry(item) {
  const title = item.repo
    ? externalLink(item.repo, `${item.title} ↗`)
    : html(item.title);
  const links = item.links
    .map((link) => externalLink(link.url, link.label))
    .join("");

  // Reuse the reader's full-width layout when there is no media column.
  const layoutClass = item.media ? "" : "reader-chapter-text-only";

  const duties = item.duties?.length
    ? `<ul class="project-duties">${item.duties.map((duty) => `<li>${html(duty)}</li>`).join("")}</ul>`
    : `<p>${html(item.description)}</p>`;
  const skills = item.skills?.length
    ? `<section class="project-skills"><h4>Skills</h4><ul>${item.skills.map((skill) => `<li>${html(skill)}</li>`).join("")}</ul></section>`
    : "";
  // The full-width heading and skills frame a separate two-column body.
  // Center only media against the duties; headings must not shift its alignment.
  return `<article class="reader-chapter project-entry ${layoutClass}">
    <div class="project-heading"><h3>${title}</h3>
      <p class="project-date">${item.date ? html(item.date) : "PROJECT"}</p>
    </div>
    <div class="project-body ${item.media ? "" : "project-body-text-only"}">
      <div class="project-entry-copy">${duties}<div class="project-links">${links}</div></div>
      ${projectMedia(item)}
    </div>${skills}
  </article>`;
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
