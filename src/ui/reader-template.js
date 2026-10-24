import { escapeHtml as html } from "./html.js";
import { pages, rolePhotos } from "../content/pages.js";
import { hobbyPhotos, hackathonPhotos } from "../content/gallery.js";
import { renderProjectGroups } from "./project-view.js";

function photoCollection(photos) {
  return photos
    .map(
      ([file, alt, caption]) =>
        `<figure><img src="/assets/photos/${html(file)}" alt="${html(alt)}" loading="lazy"><figcaption>${html(caption)}</figcaption></figure>`,
    )
    .join("");
}
function chapterPhoto(photo) {
  if (!photo) return "";
  if (photo === "Hobby collage")
    return `<div class="reader-hobby-collage">${photoCollection(hobbyPhotos)}</div>`;
  if (rolePhotos[photo])
    return `<figure class="reader-role-photo"><img src="${html(rolePhotos[photo])}" alt="${html(photo)}" loading="lazy"></figure>`;
  if (photo === "Portrait of Chibueze")
    return '<figure class="reader-portrait"><img src="/assets/photos/profile.jpg" alt="Chibueze smiling outdoors in a suit"></figure>';
  return `<figure class="photo-placeholder"><div aria-hidden="true">＋</div><figcaption>${html(photo)}<br><small>Photo to be supplied</small></figcaption></figure>`;
}
function chapter([title, text, photo]) {
  const label =
    text.startsWith("Your ") || text.startsWith("Add ")
      ? "CONTENT TO COME"
      : "MY STORY";
  return `<section class="reader-chapter ${photo ? "" : "reader-chapter-text-only"}"><div><p class="reader-label">${label}</p><h2>${html(title)}</h2>${text
    .split("\n\n")
    .map((paragraph) => `<p>${html(paragraph)}</p>`)
    .join("")}</div>${chapterPhoto(photo)}</section>`;
}
/** Pure markup generation: no listeners, layout measurement or scroll changes.
 * All personal wording remains in content/; missing IDs fail safely.
 */
export function renderReader(pageId) {
  const page = pages[pageId];
  if (!page) return "";
  const hackathons =
    pageId === "experiences"
      ? `<section class="reader-hackathons"><h2>Hackathons</h2><p>Building with friends, learning new software and meeting people along the way.</p><div class="reader-event-gallery">${photoCollection(hackathonPhotos)}</div></section>`
      : "";
  const invite =
    pageId === "profile"
      ? '<section class="reader-invite"><p>Have a question, a comment, or just want to say hi?</p><a href="mailto:benprichi13@gmail.com">Send me a message :)</a></section>'
      : "";
  return `<div class="reader-clouds" aria-hidden="true"><img src="/assets/cloud-volume.png" alt=""><img src="/assets/cloud-volume.png" alt=""></div>
    <article class="reader-content"><button class="reader-close" type="button">← Back to the clouds</button>
    <header><p class="reader-label">${html(page.label)}</p><h1 id="reader-title" tabindex="-1">${html(page.title)}</h1><p>${html(page.intro)}</p></header>
    ${pageId === "projects" ? renderProjectGroups() : ""}${page.sections.map(chapter).join("")}${hackathons}${invite}
    <footer><button class="reader-shrink" type="button">Click to shrink ↓</button><p>Return to clouds and keep exploring.</p></footer></article>`;
}
