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

/** Resume tiles use explicit rows: identity, metadata, duties/photo, skills.
 * Keeping skills outside the duties column makes them span the whole tile. */
function experienceChapter(entry) {
  const photo = entry.photo && rolePhotos[entry.photo];
  const crop = entry.photoPosition ?? "50% 50%";
  const skills = entry.skills ?? [];
  return `<section class="reader-chapter experience-entry">
    <div class="experience-heading">
      <h2>${html(entry.organization)}</h2>
      <p class="experience-role">${html(entry.role)}</p>
    </div>
    <div class="experience-metadata">
      <p class="experience-location">${html(entry.location ?? "")}</p>
      <p class="experience-dates">${html(entry.dates)}</p>
    </div>
    <div class="experience-body ${photo ? "" : "experience-body-text-only"}">
      <ul class="experience-duties">${entry.duties.map((duty) => `<li>${html(duty)}</li>`).join("")}</ul>
      ${photo ? `<figure class="experience-photo"><a href="${html(photo)}" target="_blank" rel="noopener noreferrer" title="View full photo"><img src="${html(photo)}" alt="${html(entry.photo)}" loading="lazy" style="object-position: ${html(crop)}"></a></figure>` : ""}
    </div>
    ${skills.length ? `<div class="experience-skills"><h3>Skills</h3><ul>${skills.map((skill) => `<li>${html(skill)}</li>`).join("")}</ul></div>` : ""}
  </section>`;
}

function chapter(entry) {
  // Profile sections remain prose. Experience objects have a separate layout.
  if (!Array.isArray(entry)) return experienceChapter(entry);
  const [title, text, photo] = entry;
  const label =
    text.startsWith("Your ") || text.startsWith("Add ")
      ? "CONTENT TO COME"
      : "MY STORY";
  return `<section class="reader-chapter ${photo ? "" : "reader-chapter-text-only"}">
    <div><p class="reader-label">${label}</p><h2>${html(title)}</h2>
      ${text
        .split("\n\n")
        .map((paragraph) => `<p>${html(paragraph)}</p>`)
        .join("")}
    </div>${chapterPhoto(photo)}
  </section>`;
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
      ? ` 
      '<section class="reader-invite">
      <p>Have a question, a comment, or just want to say hi?
      </p>
      <a class="reader-email" href="mailto:benprichi13@gmail.com">
          benprichi13@gmail.com
        </a>

        <button 
          class="copy-email" 
          type="button"
          aria-label="Copy email address"
          title="Copy email address"
          >

          <img src="/assets/copy-icon.png" alt="" width="20" height="20">
        </button>

        <!-- Announce the result without moving keyboard focus. -->
        <p class="copy-email-status" role="status"></p>
      </section>
      `
      : "";

  return `<div class="reader-clouds" aria-hidden="true">
    <img src="/assets/cloud-volume.png" alt="">
    <img src="/assets/cloud-volume.png" alt=""></div>
    <article class="reader-content"><button class="reader-close" type="button">← Back to the clouds</button>
    <header><p class="reader-label">${html(page.label)}</p><h1 id="reader-title" tabindex="-1">${html(page.title)}</h1><p>${html(page.intro)}</p></header>
    ${pageId === "projects" ? renderProjectGroups() : ""}${page.sections.map(chapter).join("")}${hackathons}${invite}
    <footer><button class="reader-shrink" type="button">Click to shrink ↓</button><p>Return to clouds and keep exploring.</p></footer></article>`;
}
