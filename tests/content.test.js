import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { renderReader } from "../src/ui/reader-template.js";
import { projectGroups } from "../src/content/projects.js";
import { pages } from "../src/content/pages.js";
import { CHECKPOINTS } from "../src/scene/journey-math.js";
import { greetingAt } from "../src/ui/typing.js";
import { greetings } from "../src/content/greetings.js";
import { escapeHtml } from "../src/ui/html.js";

test("every checkpoint opens an authored reader with existing local media", () => {
  assert.deepEqual(
    CHECKPOINTS.map((c) => c.id),
    Object.keys(pages),
  );
  for (const { id } of CHECKPOINTS) {
    const markup = renderReader(id);
    assert.match(markup, /id="reader-title"/);
    assert.match(markup, /class="reader-shrink"/);
    for (const [, src] of markup.matchAll(
      /(?:src|data-demo-src|data-demo-poster)="([^"]+)"/g,
    )) {
      assert.ok(src.startsWith("/assets/"), src);
      assert.ok(
        existsSync(new URL("../public" + src, import.meta.url)),
        `Missing reader asset: ${src}`,
      );
    }
  }
  assert.equal(renderReader("missing"), "");
});
test("roles without photos stay text-only and projects keep repository links", () => {
  const experience = renderReader("experiences");
  assert.match(experience, /experience-body-text-only/);
  for (const group of projectGroups)
    for (const project of group.items) {
      assert.ok(URL.canParse(project.repo));
      assert.ok(renderReader("projects").includes(project.repo));
    }
});
test("greeting cycles accept additional languages and preserve Unicode", () => {
  const extra = [...greetings, ["test", "Hello 🌤"]];
  assert.deepEqual(greetingAt(greetings.length * 3000 + 1000, extra), {
    language: "test",
    text: "Hello 🌤",
  });
  assert.deepEqual(greetingAt(extra.length * 3000 + 1000, extra), {
    language: extra[0][0],
    text: extra[0][1],
  });
  assert.equal(greetingAt(0, []).text, "");
});
test("authored text is escaped at the HTML boundary", () => {
  assert.equal(
    escapeHtml('<img title="x"> &'),
    "&lt;img title=&quot;x&quot;&gt; &amp;",
  );
});

test("resume experience records render duty lists and skills without changing profile prose", () => {
  const entries = pages.experiences.sections;
  assert.ok(
    entries.every((entry) => entry.organization && entry.role && entry.dates),
  );
  assert.ok(
    entries.every((entry) => entry.duties.length && entry.skills.length),
  );
  const markup = renderReader("experiences");
  assert.equal(
    (markup.match(/class="experience-duties"/g) || []).length,
    entries.length,
  );
  assert.equal(
    (markup.match(/class="experience-skills"/g) || []).length,
    entries.length,
  );
  assert.equal(
    entries.find((entry) =>
      entry.organization.startsWith("Falcon Technologies"),
    ).dates,
    "April – May 2026",
  );
  assert.ok(!renderReader("profile").includes('class="experience-duties"'));
});

// The sketch uses full-width heading/skills rows and a dedicated square photo.
// Keep the repeated label out of individual cards without affecting page labels.
test("experience tiles separate metadata and square-photo content from full-width skills", () => {
  const markup = renderReader("experiences");
  const entries = pages.experiences.sections;
  assert.equal(
    (markup.match(/class="experience-metadata"/g) || []).length,
    entries.length,
  );
  assert.equal(
    (markup.match(/class="experience-photo"/g) || []).length,
    entries.filter((entry) => entry.photo).length,
  );
  assert.ok(!markup.includes('<p class="reader-label">EXPERIENCE</p>'));
  assert.match(markup, /class="experience-location">Surrey, BC/);
});

test("project entries expose contribution lists and skills while handwriting stays text-only", () => {
  const items = projectGroups.flatMap((group) => group.items);
  const markup = renderReader("projects");
  assert.ok(items.every((item) => item.duties.length && item.skills.length));
  assert.equal(
    (markup.match(/class="project-duties"/g) || []).length,
    items.length,
  );
  assert.equal(
    (markup.match(/class="project-skills"/g) || []).length,
    items.length,
  );
  assert.equal(items.at(-1).title, "Handwriting Classifier");
  assert.equal(items.at(-1).media, null);
});
