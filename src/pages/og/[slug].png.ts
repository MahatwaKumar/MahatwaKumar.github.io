// Generates a 1200×630 Open Graph image per page at build time: title + hero image.
import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const W = 1200, H = 630;
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function wrap(text: string, max: number) {
  const words = text.split(' ');
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > max) { lines.push(cur.trim()); cur = w; } else cur += ' ' + w;
  }
  if (cur.trim()) lines.push(cur.trim());
  return lines;
}

export const getStaticPaths: GetStaticPaths = async () => {
  const projects = await getCollection('projects');
  const heroFile = async (filePath: string | undefined) => {
    const src = await fs.readFile(filePath!, 'utf8');
    const rel = /heroImage:\s*'([^']+)'/.exec(src)![1];
    return path.resolve(path.dirname(filePath!), rel);
  };
  return [
    {
      params: { slug: 'home' },
      props: { title: 'Mahatwa Kumar', kicker: 'Mechanical Engineering · UCLA', sub: 'CFD, thermal systems and robotics', image: path.resolve('src/assets/projects/f1-car-aerodynamics-cfd/design-car.png') },
    },
    ...(await Promise.all(projects.map(async (p) => ({
      params: { slug: p.data.slug },
      props: { title: p.data.title, kicker: 'Mahatwa Kumar · Project', sub: p.data.software.slice(0, 3).join(' · '), image: await heroFile(p.filePath) },
    })))),
  ];
};

export const GET: APIRoute = async ({ props }) => {
  const { title, kicker, sub, image } = props as { title: string; kicker: string; sub: string; image: string };
  const lines = wrap(title, 22).slice(0, 4);
  const titleSvg = lines.map((l, i) => `<text x="64" y="${210 + i * 62}" font-size="52" font-weight="700" fill="#ffffff">${esc(l)}</text>`).join('');
  const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg" font-family="Inter, 'Segoe UI', Arial, Helvetica, sans-serif">
    <rect width="${W}" height="${H}" fill="#0b1020"/>
    <rect x="0" y="0" width="12" height="${H}" fill="#7ea6ff"/>
    <rect x="64" y="72" width="54" height="54" rx="10" fill="#1747c2"/>
    <text x="91" y="108" font-size="24" font-weight="700" fill="#ffffff" text-anchor="middle" font-family="Consolas, 'DejaVu Sans Mono', monospace">MK</text>
    <text x="136" y="108" font-size="22" font-weight="600" fill="#a8b3c7">${esc(kicker)}</text>
    ${titleSvg}
    <text x="64" y="${Math.min(560, 230 + lines.length * 62 + 24)}" font-size="24" fill="#7ea6ff" font-family="Consolas, 'DejaVu Sans Mono', monospace">${esc(sub)}</text>
  </svg>`;

  const panelW = 520, panelH = 470;
  const pic = await sharp(image).resize(panelW - 40, panelH - 40, { fit: 'contain', background: '#ffffff' }).toBuffer();
  const panel = await sharp({ create: { width: panelW, height: panelH, channels: 4, background: '#ffffff' } })
    .composite([{ input: pic, left: 20, top: 20 }]).png().toBuffer();
  const rounded = await sharp(panel).composite([{
    input: Buffer.from(`<svg width="${panelW}" height="${panelH}"><rect width="${panelW}" height="${panelH}" rx="18" fill="#fff"/></svg>`),
    blend: 'dest-in',
  }]).png().toBuffer();

  const png = await sharp(Buffer.from(svg))
    .composite([{ input: rounded, left: W - panelW - 56, top: (H - panelH) / 2 }])
    .png({ compressionLevel: 9 })
    .toBuffer();
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
