// Lazy loader for <model-viewer>: the library is fetched only when a viewer is near the viewport.
type MV = HTMLElement & {
  src: string | null; cameraOrbit: string; autoRotate: boolean; resetTurntableRotation?: () => void;
  jumpCameraToGoal?: () => void; updateFraming?: () => Promise<void>;
};

let libPromise: Promise<unknown> | null = null;
function loadLib() {
  if (!libPromise) {
    libPromise = import('@google/model-viewer').then((mod) => {
      const El = (mod as { ModelViewerElement?: { meshoptDecoderLocation: string } }).ModelViewerElement
        ?? (customElements.get('model-viewer') as unknown as { meshoptDecoderLocation: string });
      if (El) El.meshoptDecoderLocation = '/vendor/meshopt_decoder.js';
    });
  }
  return libPromise;
}

const reduce = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function wire(fig: HTMLElement) {
  if (fig.dataset.bound) return;
  fig.dataset.bound = '1';
  const mv = fig.querySelector('model-viewer') as MV;
  const frame = fig.querySelector<HTMLElement>('.frame')!;
  const initialOrbit = mv.getAttribute('camera-orbit') ?? 'auto auto auto';
  if (reduce()) mv.removeAttribute('auto-rotate');

  mv.addEventListener('progress', (e) => {
    const p = (e as unknown as CustomEvent<{ totalProgress: number }>).detail.totalProgress;
    fig.querySelector<HTMLElement>('.loadbar span')?.style.setProperty('--p', String(p));
  });
  mv.addEventListener('load', () => fig.setAttribute('data-loaded', ''));
  // Stop spinning as soon as the visitor takes over.
  mv.addEventListener('camera-change', (e) => {
    if ((e as CustomEvent<{ source: string }>).detail.source === 'user-interaction') mv.removeAttribute('auto-rotate');
  });

  fig.querySelector('[data-reset]')?.addEventListener('click', () => {
    mv.setAttribute('camera-orbit', initialOrbit);
    mv.cameraOrbit = initialOrbit;
    mv.resetTurntableRotation?.();
    mv.setAttribute('camera-target', 'auto auto auto');
    mv.setAttribute('field-of-view', 'auto');
  });
  fig.querySelector('[data-fullscreen]')?.addEventListener('click', () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else frame.requestFullscreen?.().catch(() => {});
  });
  fig.querySelectorAll<HTMLButtonElement>('.toggle button').forEach((btn) => {
    btn.addEventListener('click', () => {
      fig.querySelectorAll('.toggle button').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      fig.removeAttribute('data-loaded');
      mv.setAttribute('src', btn.dataset.model!);
    });
  });

  let started = false;
  const start = () => {
    if (started) return;
    started = true;
    loadLib().then(() => mv.setAttribute('src', mv.dataset.src!));
  };

  if (fig.dataset.loadOn === 'interaction') {
    // Keep the first paint light: show the poster and fetch the 3D model on the first sign of a real visitor.
    const events = ['pointerdown', 'pointermove', 'touchstart', 'keydown', 'wheel', 'scroll'] as const;
    const go = () => { events.forEach((ev) => window.removeEventListener(ev, go)); start(); };
    events.forEach((ev) => window.addEventListener(ev, go, { once: true, passive: true }));
    fig.addEventListener('focusin', go, { once: true });
    return;
  }

  if (!('IntersectionObserver' in window)) { start(); return; }
  const io = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) { io.disconnect(); start(); }
  }, { rootMargin: '200px' });
  io.observe(fig);
}

export function initModelViewers() {
  document.querySelectorAll<HTMLElement>('[data-mv]').forEach(wire);
}
