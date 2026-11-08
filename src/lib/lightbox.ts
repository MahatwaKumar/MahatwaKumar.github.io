// Full-screen, zoomable figure viewer (PhotoSwipe): keyboard arrows, Esc, pinch/swipe, captions.
import PhotoSwipeLightbox from 'photoswipe/lightbox';
import 'photoswipe/style.css';

let lightbox: PhotoSwipeLightbox | null = null;

export function initLightbox() {
  lightbox?.destroy();
  lightbox = null;
  const main = document.getElementById('main');
  if (!main || !main.querySelector('a.pswp-item')) return;
  lightbox = new PhotoSwipeLightbox({
    gallery: '#main',
    children: 'a.pswp-item',
    pswpModule: () => import('photoswipe'),
    bgOpacity: 0.94,
    wheelToZoom: true,
    showHideAnimationType: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'none' : 'zoom',
    closeTitle: 'Close (Esc)',
    zoomTitle: 'Zoom',
    arrowPrevTitle: 'Previous figure',
    arrowNextTitle: 'Next figure',
  });
  lightbox.on('uiRegister', () => {
    lightbox!.pswp!.ui!.registerElement({
      name: 'caption',
      order: 9,
      isButton: false,
      appendTo: 'root',
      onInit: (el, pswp) => {
        el.className = 'pswp__custom-caption';
        el.setAttribute('aria-live', 'polite');
        pswp.on('change', () => {
          const a = pswp.currSlide?.data.element as HTMLElement | undefined;
          el.textContent = a?.dataset.caption ?? '';
        });
      },
    });
  });
  lightbox.init();
}
