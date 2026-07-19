import { useEffect } from 'react';

/**
 * Injeta Meta Pixel e GA4 SOMENTE quando:
 * 1) O visitante deu consentimento (localStorage 'mir-consent' === 'accepted');
 * 2) Os IDs estão configurados em VITE_META_PIXEL_ID e VITE_GA_MEASUREMENT_ID.
 *
 * Sem ID, nada é injetado — evita snippet placeholder em produção.
 */
export const Analytics = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const consent = window.localStorage.getItem('mir-consent');
    if (consent !== 'accepted') return;

    const pixelId = import.meta.env.VITE_META_PIXEL_ID as string | undefined;
    const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;

    // ---------- Meta Pixel ----------
    if (pixelId && !(window as any).fbq) {
      /* eslint-disable */
      (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
        if (f.fbq) return;
        n = f.fbq = function () {
          n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
        };
        if (!f._fbq) f._fbq = n;
        n.push = n;
        n.loaded = !0;
        n.version = '2.0';
        n.queue = [];
        t = b.createElement(e);
        t.async = !0;
        t.src = v;
        s = b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t, s);
      })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
      /* eslint-enable */
      (window as any).fbq('init', pixelId);
      (window as any).fbq('track', 'PageView');
    }

    // ---------- GA4 ----------
    if (gaId && !(window as any).__gaLoaded) {
      const s = document.createElement('script');
      s.async = true;
      s.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
      document.head.appendChild(s);
      (window as any).dataLayer = (window as any).dataLayer || [];
      const gtag = (...args: any[]) => (window as any).dataLayer.push(args);
      (window as any).gtag = gtag;
      gtag('js', new Date());
      gtag('config', gaId, { anonymize_ip: true });
      (window as any).__gaLoaded = true;
    }
  }, []);

  return null;
};
