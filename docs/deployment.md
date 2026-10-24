# Publish on GitHub Pages

Target repository: https://github.com/Benimaru13/benimaru13.github.io
Target website: https://benimaru13.github.io/

This static Vite site needs no Vercel account or backend. github.io is GitHub's
hosting address, not a domain you can delegate to Vercel. Vite's default base `/`
is correct for this account-level Pages repository.

1. Review the production build locally: `npm ci`, `npm test`, `npm run build`,
   then `npm run preview`. Test the URL Vite prints, including phone sizes,
   cloud navigation, expand/shrink, media playback and reduced motion.
2. Put these site files at the ROOT of the target GitHub repository:
   index.html, package.json, package-lock.json, src/, public/, tests/ and
   .github/workflows/pages.yml. Preserve the repository's existing README if
   desired. Do not upload node_modules/, dist/, .git/, work/, art-history/,
   raw resumes, downloaded source folders or private research notes.
3. In the repository, open Settings -> Pages -> Build and deployment.
   Set Source to GitHub Actions. No custom domain/CNAME is needed.
4. Commit and push the site files and workflow to main. In Actions choose
   “Deploy website to GitHub Pages”, then “Run workflow” on main.
5. Wait for the green deployment result. Open its environment URL and verify
   photos, project links, GIF play/pause, keyboard access and scroll reversal.
6. Share the website URL with family. Ask them to try desktop and phone,
   discover scrolling without instructions, expand/shrink every section,
   and report device/browser, screenshot and reproduction steps for bugs.

The prepared workflow is manual: future pushes do not silently republish. Run
it again after a reviewed change. A failed build/test prevents publication.

## Before public release

- The supplied construction image bears a Shutterstock watermark. Replace it
  with original or appropriately licensed artwork before publishing.
- Confirm permission to publicly share identifiable group photos. Keep source
  research/resumes out of the public repository. The site and public assets are
  accessible to anyone; family-review hosting is not private access control.
- Check character/artwork licensing; supplied Luffy artwork is not owned by us.
- Current motion needs real-device/mobile performance review. Build/test success
  alone does not establish smooth scrolling or visual correctness.

References: https://vite.dev/guide/static-deploy.html#github-pages
and https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages
