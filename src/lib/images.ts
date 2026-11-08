import type { ImageMetadata } from 'astro';

// All project figures, keyed as "<slug>/<file>.png" so MDX can refer to them by name.
const modules = import.meta.glob<{ default: ImageMetadata }>('/src/assets/projects/*/*.{png,jpg,jpeg,webp}', { eager: true });

export function img(key: string): ImageMetadata {
  const m = modules[`/src/assets/projects/${key}`];
  if (!m) throw new Error(`Figure not found: src/assets/projects/${key}`);
  return m.default;
}
