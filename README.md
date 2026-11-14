# Mahatwa Kumar · Engineering Portfolio

Personal engineering portfolio built with [Astro](https://astro.build): static output, TypeScript, MDX content collections, no UI framework.

## Quick start

```bash
npm install
npm run dev        # http://localhost:4321 (search works only on a build)
npm run build      # builds to dist/ and creates the search index
npm run preview    # serves the built site
npm run check      # type check
```

## Structure

```
src/
  content/projects/     one .mdx per project (+ _template.mdx)
  content.config.ts     typed frontmatter schema (zod)
  components/           ProjectCard, KeyResults, StatusBadge, SoftwareChips, Figure, Gallery,
                        ModelViewer, Chart, CompareSlider, ProcessDiagram, DownloadCard, TOC,
                        ThemeToggle, Search, …
  layouts/Base.astro    page shell, meta tags, theme, view transitions
  lib/                  site config, resume content, chart definitions, browser code
  data/<slug>/          CSV tables behind the charts
  assets/projects/<slug>/  figures (optimised to AVIF/WebP at build time)
  styles/global.css     design tokens (colour, type, spacing) and base styles
public/
  models/<slug>.glb     3D models (+ poster stills)
  files/<slug>/         downloadable drawings
  resume.pdf
bundles/                project source bundles (git-ignored)
```

## How to add a new project

1. **Copy the template:** `src/content/projects/_template.mdx` → `src/content/projects/<slug>.mdx`, and fill in the frontmatter (title, summary, key results with qualifiers, tags, software, order).
2. **Add files:**
   - figures → `src/assets/projects/<slug>/` (reference them as `<Figure src="<slug>/file.png" … />`)
   - CSV data → `src/data/<slug>/`, then add a chart definition in `src/lib/charts.ts` and use `<Chart id="…" title="…" />`
   - PDFs → `public/files/<slug>/`, listed under `downloads` in the frontmatter
3. **3D model (optional):** put a compressed GLB and a poster still in `public/models/`, add `model3d` to the frontmatter and `<ProjectModel id="<slug>" />` where it should appear.
4. **Done:** `npm run build`, `npm run check`, commit and push. The GitHub Action deploys it.

## Writing rules used on this site

- First person, plain English, short paragraphs; describe the engineering and the software used for it.
- Every number comes from the project files, labelled **simulated**, **predicted** or **measured**. Nothing is called validated without test data.
- Each project keeps its stated limitations.
- Every project page uses the same five sections, in this order: **Problem statement**, **Approach**, **Analysis** (ending with "How I checked it"), **Conclusion** (with limitations and next steps) and **Issues I ran into**.
- Describe each step by the engineering software used ("In SolidWorks I…"); programming languages and code are not mentioned.
