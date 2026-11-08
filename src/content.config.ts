import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const projects = defineCollection({
  // Files starting with "_" (the template) are ignored.
  loader: glob({ pattern: '[^_]*.mdx', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      shortTitle: z.string().optional(),
      slug: z.string(),
      date: z.coerce.date(),
      status: z.enum(['complete', 'build-in-progress', 'in-progress']),
      summary: z.string(),
      cardSummary: z.string(),
      heroImage: image(),
      heroAlt: z.string(),
      keyResults: z
        .array(
          z.object({
            value: z.string(),
            unit: z.string().default(''),
            label: z.string(),
            qualifier: z.string().default(''),
          }),
        )
        .min(2)
        .max(4),
      tags: z.array(z.enum(['cfd', 'thermal', 'cad', 'embedded', 'robotics', 'data-analysis'])),
      software: z.array(z.string()),
      featured: z.boolean().default(false),
      order: z.number(),
      model3d: z
        .object({
          src: z.string(),
          alt: z.string(),
          poster: z.string().optional(),
          compareSrc: z.string().optional(),
          compareLabel: z.string().optional(),
          label: z.string().optional(),
          cameraOrbit: z.string().optional(),
          hotspots: z
            .array(z.object({ position: z.string(), normal: z.string().optional(), label: z.string() }))
            .default([]),
        })
        .optional(),
      downloads: z
        .array(z.object({ label: z.string(), file: z.string(), description: z.string().optional() }))
        .default([]),
    }),
});

export const collections = { projects };
