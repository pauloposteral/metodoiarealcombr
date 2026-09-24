import { useEffect } from 'react';

export const Analytics = () => {
  useEffect(() => {
    const initialize = () => {
      if (window.localStorage.getItem('mir-consent') !== 'accepted') return;
      const pixelId = import.meta.env.VITE_META_PIXEL_ID;
      const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID;
      if (pixelId && !window.fbq) {
        const pixel: MetaPixel = Object.assign((...args: unknown[]) => {
          if (pixel.callMethod) pixel.callMethod(...args); else pixel.queue.push(args);
        }, { queue: [] as unknown[][], loaded: true, version: '2.0' });
        window.fbq = pixel;
        window._fbq = pixel;
        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://connect.facebook.net/en_US/fbevents.js';
        document.head.appendChild(script);
        pixel('init', pixelId);
        pixel('track', 'PageView');
      }
      if (gaId && !window.__gaLoaded) {
        window.dataLayer = window.dataLayer || [];
        window.gtag = function (...args: unknown[]) { window.dataLayer.push(args); };
        window.gtag('js', new Date());
        window.gtag('config', gaId, { anonymize_ip: true });
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`;
        document.head.appendChild(script);
        window.__gaLoaded = true;
      }
    };
    initialize();
    window.addEventListener('mir-consent-change', initialize);
    return () => window.removeEventListener('mir-consent-change', initialize);
  }, []);
  return null;
};
