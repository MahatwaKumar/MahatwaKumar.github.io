// Renders chart specs with Chart.js. Loaded lazily; re-themes on light/dark change.
import type { ChartSpec } from './charts';

type ChartLib = typeof import('chart.js/auto');
let lib: Promise<ChartLib> | null = null;
const getLib = () => (lib ??= import('chart.js/auto'));

const instances = new Map<HTMLCanvasElement, { destroy: () => void }>();

function css(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function fmt(v: number, d = 2) {
  if (Math.abs(v) > 0 && Math.abs(v) < 0.001) return v.toExponential(2);
  return v.toLocaleString('en-US', { maximumFractionDigits: d });
}

async function render(fig: HTMLElement) {
  const canvas = fig.querySelector('canvas')!;
  const spec = JSON.parse(fig.querySelector('script[type="application/json"]')!.textContent!) as ChartSpec;
  const { default: Chart } = await getLib();
  instances.get(canvas)?.destroy();

  const text = css('--text-muted');
  const grid = css('--border');
  const font = { family: css('--font-sans') || 'Inter, sans-serif', size: 12 };
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isBar = spec.kind === 'bar';
  const hz = !!spec.horizontal;
  const valAxis = hz ? 'x' : 'y';

  const datasets = spec.datasets.map((d) => {
    const color = css(`--${d.color}`);
    return {
      label: d.label,
      data: d.data as never,
      ...(d.type ? { type: d.type } : {}),
      ...(isBar ? { indexAxis: hz ? 'y' : 'x' } : {}),
      borderColor: color,
      backgroundColor: isBar ? color + 'd9' : color,
      borderWidth: isBar ? 0 : 2,
      borderRadius: isBar ? 4 : 0,
      borderDash: d.dashed ? [6, 5] : [],
      pointRadius: d.pointRadius ?? (spec.kind === 'line' ? 3 : 4),
      pointHoverRadius: 6,
      showLine: d.showLine ?? spec.kind === 'line',
      tension: 0,
      maxBarThickness: 34,
      order: d.order ?? 0,
    };
  });

  // Optional reference line (pass mark, limit, rating) drawn as a plugin.
  const refPlugin = {
    id: 'ref',
    afterDatasetsDraw(chart: { ctx: CanvasRenderingContext2D; chartArea: { left: number; right: number; top: number; bottom: number }; scales: Record<string, { getPixelForValue: (v: number) => number }> }) {
      if (!spec.refLine) return;
      const { ctx, chartArea: a, scales } = chart;
      const s = scales[spec.refLine.axis];
      const p = s.getPixelForValue(spec.refLine.value);
      ctx.save();
      ctx.strokeStyle = css('--text-faint');
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      if (spec.refLine.axis === 'x') { ctx.moveTo(p, a.top); ctx.lineTo(p, a.bottom); }
      else { ctx.moveTo(a.left, p); ctx.lineTo(a.right, p); }
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = css('--text-muted');
      ctx.font = `600 11px ${font.family}`;
      if (spec.refLine.axis === 'x') {
        const fitsRight = p + 6 + ctx.measureText(spec.refLine.label).width < a.right;
        ctx.textAlign = fitsRight ? 'left' : 'right';
        ctx.fillText(spec.refLine.label, fitsRight ? p + 6 : p - 6, a.bottom - 8);
      }
      else { ctx.textAlign = 'right'; ctx.fillText(spec.refLine.label, a.right - 4, p - 6); }
      ctx.restore();
    },
  };

  const axis = (title: string, log: boolean | undefined, extra: Record<string, unknown> = {}) => ({
    ...(log ? { type: 'logarithmic' } : {}),
    title: { display: !!title, text: title, color: text, font: { ...font, weight: 600 } },
    ticks: { color: text, font } as Record<string, unknown>,
    grid: { color: grid, drawTicks: false },
    border: { color: grid },
    ...extra,
  });

  const xIsNumeric = spec.kind !== 'bar' && !spec.labels;
  const scales: Record<string, unknown> = {
    x: axis(spec.xLabel, spec.logX, {
      ...(xIsNumeric ? { type: spec.logX ? 'logarithmic' : 'linear' } : {}),
      ...(spec.xMin !== undefined ? { min: spec.xMin } : {}),
    }),
    y: axis(spec.yLabel, spec.logY, {
      ...(spec.yMin !== undefined ? { min: spec.yMin } : {}),
      ...(spec.yMax !== undefined ? { max: spec.yMax } : {}),
    }),
  };
  if (hz) (scales.y as { ticks: Record<string, unknown> }).ticks.autoSkip = false;

  const unitFor = (axisName: string) => (axisName === valAxis ? spec.unit : spec.xUnit ?? '');

  const chart = new Chart(canvas, {
    type: (spec.kind === 'scatter' ? 'scatter' : spec.kind) as never,
    data: { labels: spec.labels, datasets: datasets as never },
    plugins: [refPlugin as never],
    options: {
      indexAxis: hz ? 'y' : 'x',
      responsive: true,
      maintainAspectRatio: false,
      animation: reduce ? false : { duration: 700 },
      interaction: { mode: spec.kind === 'bar' ? 'index' : 'nearest', intersect: false, axis: hz ? 'y' : 'x' },
      scales: scales as never,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: text, font, usePointStyle: true, pointStyle: 'rectRounded', boxWidth: 10, boxHeight: 10, padding: 14 },
        },
        tooltip: {
          backgroundColor: css('--text'),
          titleColor: css('--bg'),
          bodyColor: css('--bg'),
          titleFont: { ...font, weight: 600 },
          bodyFont: { family: css('--font-mono') || 'monospace', size: 12 },
          padding: 10,
          cornerRadius: 8,
          callbacks: {
            title: (items: { label?: string; parsed: { x: number } }[]) => {
              const it = items[0];
              if (!it) return '';
              if (xIsNumeric) return `${spec.xLabel.replace(/\s*\(.*\)$/, '')}: ${fmt(it.parsed.x, 4)} ${spec.xUnit ?? ''}`.trim();
              return it.label ?? '';
            },
            label: (it: { dataset: { label?: string }; parsed: { x: number; y: number } }) => {
              const v = hz ? it.parsed.x : it.parsed.y;
              if (v === null || v === undefined || Number.isNaN(v)) return '';
              return ` ${it.dataset.label}: ${fmt(v, spec.decimals ?? 2)} ${unitFor(valAxis)}`.trimEnd();
            },
          },
        },
      },
    } as never,
  });
  instances.set(canvas, chart);
}

let io: IntersectionObserver | null = null;

export function initCharts() {
  io?.disconnect();
  instances.forEach((c) => c.destroy());
  instances.clear();
  const figs = [...document.querySelectorAll<HTMLElement>('[data-chart]')];
  if (!figs.length) return;

  figs.forEach((fig) => {
    const btn = fig.querySelector<HTMLButtonElement>('.toggle')!;
    const tbl = fig.querySelector<HTMLElement>('.tbl')!;
    btn.onclick = () => {
      const open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', String(open));
      tbl.hidden = !open;
      btn.querySelector('span')!.textContent = open ? 'Hide data' : 'View data';
    };
  });

  io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { io!.unobserve(e.target); render(e.target as HTMLElement); }
    });
  }, { rootMargin: '250px' });
  figs.forEach((f) => io!.observe(f));
}

// Re-colour visible charts when the theme changes.
const rerender = () => document.querySelectorAll<HTMLElement>('[data-chart]').forEach((f) => {
  if (instances.has(f.querySelector('canvas')!)) render(f);
});
document.addEventListener('themechange', () => requestAnimationFrame(rerender));
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', rerender);
