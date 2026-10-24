import { renderProjectGroups, installProjectMedia } from "./project-content.js";
/** Editable content scaffold. Replace only the labelled placeholders with
 * supplied biography/project details and local photos; no biography is inferred.
 * Historical flight anchor IDs remain stable while their displayed roles change.
 */
const pages = {
  experience: {
    title: "Hi, Chibueze Here!",
    label: "PERSONAL PROFILE",
    intro: "I’m glad you made it here. Feel free to look around :)",
    sections: [
      [
        "A brief blurb",
        "I’m a first-year General Science student at Kwantlen Polytechnic University with a strong interest in pursuing Computer Science. My dream is to create technology that gives others the opportunity to grow, innovate freely and achieve their dreams. I’m a curious person, and I love working on fun technical projects and building cool things. I love to code, especially in Python! In my spare time, I’m usually working on a coding project, watching basketball, binging One Piece or watching YouTube videos. I also love playing badminton and rugby, keeping up with F1 (DU DU DUDU), and going to the gym once in a while. I’m a geek at heart so I enjoy talking about trendy tech topics, especially AI or machine learning.",
        "Portrait of Chibueze",
      ],
      [
        "The things I enjoy",
        "I enjoy hiking, going to the gym, watching YouTube and playing basketball.",
        "Hobby collage",
      ],
    ],
  },
  projects: {
    title: "My experiences",
    label: "02 / EXPERIENCES",
    intro:
      "This details my work experiences, volunteer roles, and hackathon photos.",
    sections: [
      [
        "Ethos Lab · Summer Intern, Architectural Team · July - August 2026",
        "I led spatial planning for a week-long Youth Takeover, coordinating activity layouts, visitor flow, signage and logistics. I collaborated across architecture, engineering, design, trailer and marketing teams on VR, robotics and creative activities for more than 200 youth participants.",
        "Ethos Lab experience photo",
      ],
      // Ordered by my preferred narrative rather than chronology.
      [
        "Thrive-4-Blacks Community Services Society · Youth Coordinator (On-call) · December 2025 - Present",
        "I support workshops for racialized immigrant youth, drawing on my own lived experiences to help students adapt to new social and cultural environments and prepare for their future goals.\n\nI help foster an inclusive community where incoming immigrant students can build confidence, develop soft skills and feel supported through the transition.",
        "Thrive-4-Blacks experience photos",
      ],
      [
        "XD Hacks Mini Vancouver · Logistics Director · October 2025 - June 2026",
        "I coordinated logistics and facility setup for HackYourLife 2026 at BCIT’s Burnaby campus. I also supported communication with speakers, mentors and judges for an event with more than 60 participants.",
        "XD Hacks Team Photo",
      ],
      [
        "Falcon Technologies · Sofware Development Intern · April – May 2026",
        "I developed a Python and Flask application that retrieved and displayed daily data through an external API. I used SQLite to store diagnostic trend data and Git/GitHub for version control.",
        null, // No photo available: render this chapter as a full-width text section.
      ],
      [
        "Digital Storyworks · Team Coordinator Intern · August – October 2025",
        "I coordinated tasks and timelines for a five-person team, designed promotional materials and logos, and supported social media and branding work around client needs.",
        null,
      ],
      [
        "Freelance Graphic Designer · Self-employed · 2023",
        "I created logos, posters and social media assets using Photoshop and Canva, translating client ideas into visuals and managing delivery timelines.",
        null,
      ],
    ],
  },
  hobbies: {
    title: "Things I’ve built",
    label: "03 / PROJECTS",
    intro: "Team efforts, personal experiments and ideas I’m bringing to life.",
    sections: [],
  },
};

/** Full-page reading surface above an inert flight scene. Native dialog gives
 * keyboard focus containment and Escape dismissal; the reader has ordinary
 * scrolling, while the flight's exact scroll position and trigger are retained.
 */
// Explicit role mapping prevents unrelated event photos appearing under a job.
const rolePhotos = {
  "Ethos Lab experience photo": "/assets/photos/ethos-team.jpg",
  "Thrive-4-Blacks experience photos": "/assets/photos/youth-coordinator.jpg",
  "XD Hacks Team Photo": "/assets/photos/xd-hacks.png",
  "YEEP Group Photo": "/assets/photos/yeep-team.png",
  "Daydream Vancouver": "/assets/photos/daydream.png",
};
export function installReadingViews() {
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
    reader.innerHTML = `<div class="reader-clouds" aria-hidden="true"><img src="/assets/cloud-volume.png" alt=""><img src="/assets/cloud-volume.png" alt=""></div>
      <article class="reader-content"><button class="reader-close" type="button">← Back to the clouds</button>
      <header><p class="reader-label">${page.label}</p><h1 id="reader-title" tabindex="-1">${page.title}</h1><p>${page.intro}</p></header>

      ${button.dataset.read === "hobbies" ? renderProjectGroups() : ""}
      ${page.sections
        .map(
          ([title, text, photo]) =>
            `<section class="reader-chapter ${photo ? "" : "reader-chapter-text-only"}"><div><p class="reader-label">${text.startsWith("Your ") || text.startsWith("Add ") ? "CONTENT TO COME" : "MY STORY"}</p><h2>${title}</h2>${text
              .split("\n\n")
              .map((paragraph) => `<p>${paragraph}</p>`)
              .join(
                "",
              )}</div>${photo === "Hobby collage" ? `<div class="reader-hobby-collage"><figure><img src="/assets/photos/hiking.png" alt="Chibueze hiking" loading="lazy" /><figcaption>Hiking</figcaption></figure><figure><img src="/assets/photos/gym.png" alt="Chibueze at the gym" loading="lazy" /><figcaption>Going to the gym</figcaption></figure><figure><img src="/assets/photos/youtube.png" alt="Chibueze watching YouTube" loading="lazy" /><figcaption>Watching YouTube</figcaption></figure><figure><img src="/assets/photos/basketball.png" alt="Chibueze playing basketball" loading="lazy" /><figcaption>Basketball</figcaption></figure></div>` : rolePhotos[photo] ? `<figure class="reader-role-photo"><img src="${rolePhotos[photo]}" alt="${photo}" loading="lazy" /></figure>` : photo === "Portrait of Chibueze" ? `<figure class="reader-portrait"><img src="/assets/photos/profile.jpg" alt="Chibueze smiling outdoors in a suit" /></figure>` : photo ? `<figure class="photo-placeholder"><div aria-hidden="true">＋</div><figcaption>${photo}<br><small>Photo to be supplied</small></figcaption></figure>` : ""}</section>`,
        )
        .join("")}
      ${button.dataset.read === "projects" ? `<section class="reader-hackathons"><h2>Hackathons</h2><p>Building with friends, learning new software and meeting people along the way.</p><div class="reader-event-gallery"><figure><img src="/assets/photos/event-1.jpg" alt="Chibueze and his teammates at StormHacks" loading="lazy"><figcaption>SFU StormHacks 2026</figcaption></figure><figure><img src="/assets/photos/yeep-team.png" alt="Chibueze and the YEEP team" loading="lazy"><figcaption>YEEP Hackathon 2026</figcaption></figure><figure><img src="/assets/photos/daydream.png" alt="Chibueze at Daydream Vancouver" loading="lazy"><figcaption>Daydream Vancouver 2026 </figcaption></figure></div></section>` : ""}
      ${button.dataset.read === "experience" ? '<section class="reader-invite"><p>Have a question, a comment, or just want to say hi?</p><a href="mailto:benprichi13@gmail.com">Send me a message :)</a></section>' : ""}
      <footer><button class="reader-shrink" type="button">Click to shrink ↓</button><p>Return to clouds and keep exploring.</p></footer></article>`;
    installProjectMedia(reader);
    reader.querySelector(".reader-close").addEventListener("click", close);
    reader.querySelector(".reader-shrink").addEventListener("click", close);
    document.body.style.overflow = "hidden";
    reader.showModal();
    reader.scrollTop = 0;
    reader.querySelector("h1").focus({ preventScroll: true });
  }
  reader.addEventListener("close", () => {
    document.body.style.overflow = previousOverflow;
    window.scrollTo({ top: flightScroll, behavior: "instant" });
    trigger?.focus({ preventScroll: true });
    reader.replaceChildren();
  });
  document
    .querySelectorAll("[data-read]")
    .forEach((button) => button.addEventListener("click", () => open(button)));
}
