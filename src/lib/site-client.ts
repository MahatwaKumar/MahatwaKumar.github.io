// Site-wide behaviour that runs after every page load (including View Transition swaps).

const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function toast(message: string) {
  const el = document.querySelector<HTMLElement>('.toast');
  if (!el) return;
  el.textContent = message;
  el.classList.add('show');
  window.clearTimeout(Number(el.dataset.timer));
  el.dataset.timer = String(window.setTimeout(() => el.classList.remove('show'), 1800));
}

let cleanup: Array<() => void> = [];

export function initSite() {
  cleanup.forEach((fn) => fn());
  cleanup = [];

  // Scroll reveal
  const reveals = document.querySelectorAll<HTMLElement>('.reveal');
  if (reduceMotion() || !('IntersectionObserver' in window)) {
    reveals.forEach((el) => el.classList.add('is-visible'));
  } else {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
      }),
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
    );
    reveals.forEach((el) => io.observe(el));
    cleanup.push(() => io.disconnect());
  }

  // Count-up numbers
  const counters = document.querySelectorAll<HTMLElement>('[data-countup]');
  const run = (el: HTMLElement) => {
    const target = Number(el.dataset.countup);
    const decimals = Number(el.dataset.decimals ?? 0);
    const fmt = (v: number) => v.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    if (reduceMotion()) { el.textContent = fmt(target); return; }
    const start = performance.now();
    const dur = 1100;
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(target * eased);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if (counters.length) {
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { run(e.target as HTMLElement); io.unobserve(e.target); }
    }), { threshold: 0.4 });
    counters.forEach((el) => io.observe(el));
    cleanup.push(() => io.disconnect());
  }

  // Reading progress bar + back-to-top button
  const bar = document.querySelector<HTMLElement>('.progress span');
  const topBtn = document.querySelector<HTMLButtonElement>('.to-top');
  const showProgress = document.body.querySelector('[data-reading]') !== null;
  const onScroll = () => {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    const p = max > 0 ? h.scrollTop / max : 0;
    if (bar) bar.style.transform = `scaleX(${showProgress ? p : 0})`;
    if (topBtn) topBtn.hidden = h.scrollTop < 900;
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  cleanup.push(() => window.removeEventListener('scroll', onScroll));
  if (topBtn) {
    const go = () => { window.scrollTo({ top: 0, behavior: reduceMotion() ? 'auto' : 'smooth' }); document.getElementById('main')?.focus({ preventScroll: true }); };
    topBtn.addEventListener('click', go);
    cleanup.push(() => topBtn.removeEventListener('click', go));
  }

  // Copy-email buttons
  document.querySelectorAll<HTMLButtonElement>('[data-copy]').forEach((btn) => {
    const handler = async () => {
      const text = btn.dataset.copy ?? '';
      try {
        await navigator.clipboard.writeText(text);
        toast('Copied');
      } catch {
        toast(text);
      }
    };
    btn.addEventListener('click', handler);
    cleanup.push(() => btn.removeEventListener('click', handler));
  });
}
