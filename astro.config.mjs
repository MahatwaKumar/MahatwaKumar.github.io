// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// The GitHub Actions workflow sets SITE_URL from the Pages URL, so canonical links,
// the sitemap and Open Graph tags always point at the real address.
// The deploy workflow sets SITE_URL; this is the fallback for local production builds.
const site = process.env.SITE_URL || 'https://mahatwakumar.github.io';

export default defineConfig({
  site,
  output: 'static',
  trailingSlash: 'always',
  integrations: [mdx(), sitemap({ filter: (page) => !page.includes('/og/') })],
  image: {
    responsiveStyles: false,
  },
  prefetch: { prefetchAll: false, defaultStrategy: 'hover' },
  build: { inlineStylesheets: 'auto' },
  vite: {
    build: { chunkSizeWarningLimit: 1200 },
  },
});
