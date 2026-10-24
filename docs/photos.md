# Editing photos

Website images live in `public/assets/photos/`. Browser URLs start with
`/assets/photos/`; do not include `public` in an image URL.

## Profile portrait

The current file is `profile.jpg`. Replacing that file updates both views without
code changes. If using another filename, update the preview in `index.html` and
the portrait branch in `src/ui/reader-template.js`. Update the alt text too.

The preview intentionally crops the image. Adjust `.profile-photo-slot img`’s
`object-position` in `src/styles/readers.css` to move the crop. The full reader
uses a contained image. Keep its container dimensions; large intrinsic image
sizes must not control the layout.

## Roles, albums and hackathons

- Role photos: `rolePhotos` in `src/content/pages.js` maps descriptive photo keys
  to files. The section tuple’s third field selects the key. A null field means
  no photo column (currently Falcon, Digital Storyworks and freelance design).
- Floating experience album: images and alt text are in `index.html`.
- Hackathon and hobby collections: edit `src/content/gallery.js`.
- Project media: edit `media` in `src/content/projects.js`.

For example, a gallery entry is:

```js
// Filename is relative to public/assets/photos/; caption stays visible below it.
["my-event.jpg", "Chibueze with his teammates at the event", "Event name · 2026"]
```

Use actual image conversions when changing formats; renaming an extension does
not convert the file. Around 1200 pixels on the longest side usually suffices
for these slots. Prefer compressed photographs over multi-megabyte PNGs where
transparency is unnecessary. Keep originals outside the published asset folder.

Run `npm test` after changing filenames: reader media references are checked for
missing files. Then preview both the small card and expanded reader. Confirm the
people/events match the captions before publishing.
