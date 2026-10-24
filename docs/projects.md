# Editing projects

Edit `src/content/projects.js`. `projectGroups` contains Group Projects and
Personal Projects; array order is the display order. The refactor preserves the
user’s current order and wording rather than silently sorting or rewriting it.

Each project has `title`, `date`, `repo`, STAR-style `duties`, `skills`, an array
of supplementary `links`, and optional `media`. `description` is a prose fallback
when no duties are supplied. The title links to `repo`; supplementary links
appear below the description. Review HTTPS destinations before publishing.

```js
// Add an item inside a group's items array. Use your real project details.
{
  title: "My project",
  date: "October 2026",
  repo: "https://github.com/username/repository",
  // Keep contributions and outcomes in your own words and backed by evidence.
  duties: ["The problem I addressed, what I did and the result."],
  skills: ["Python"],
  links: [{ label: "Demo ↗", url: "https://example.com" }],
  media: {
    src: "/assets/photos/my-project.jpg",
    alt: "Description of the project screenshot",
  },
}
```

Set `media: null` for an intentional full-width text-only entry. Screenshots are contained,
not cropped, so their diagrams remain readable. Clicking an image opens the
original local asset in another tab.

For a GIF, supply both a GIF `src` and a still-image `poster`. This creates an
explicit Play/Pause control and prevents loading the heavy GIF until requested.
SignWave currently uses this pattern. Closing the reader removes its media DOM.
Do not auto-play all demonstrations or infer project dates from upload timestamps.

Run `npm test` and `npm run build`, then open the Projects reader to inspect
links, captions and media. Data tests check local media existence and URL syntax,
not whether a third-party site is still online or the underlying claims are true.
