# Deploying to GitHub Pages

The site deploys automatically from the `main` branch with the workflow in `.github/workflows/deploy.yml`.
The workflow reads the Pages URL itself, so canonical links, the sitemap, `robots.txt` and the link-preview images point at the right address without any edits.

## One-time setup

1. Your GitHub username (`MahatwaKumar`) is already set in `src/lib/site.ts`. Change it there if it ever changes.
2. **Create the repository** on GitHub named exactly `MahatwaKumar.github.io` (public, no README).
3. **Push this folder** from a terminal in the project folder:

   ```bash
   git branch -M main
   git add .
   git commit -m "Portfolio site"
   git remote add origin https://github.com/MahatwaKumar/MahatwaKumar.github.io.git
   git push -u origin main
   ```

   `bundles/` and the original resume file are git-ignored; everything the site needs is already copied into `src/` and `public/`.
4. **Turn on Pages:** on GitHub open the repository → **Settings → Pages → Build and deployment → Source: GitHub Actions**.
5. Open the **Actions** tab and wait for "Deploy to GitHub Pages" to finish (about 2 minutes). The site is then live at `https://mahatwakumar.github.io/`.

## Updating the site

Edit, then:

```bash
npm run build
npm run check
git add . && git commit -m "Update" && git push
```

Every push to `main` rebuilds and redeploys.

## Notes

- Node.js 22.23 or newer is needed locally (`node --version`).
- To build locally with the real URL (for example to check social previews), set it first: `SITE_URL=https://mahatwakumar.github.io npm run build` (PowerShell: `$env:SITE_URL="https://mahatwakumar.github.io"; npm run build`).
- To check how a project link will look on LinkedIn after deploying, paste the URL into the [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/).
