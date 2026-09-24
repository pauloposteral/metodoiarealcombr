interface MetaPixel {
  (...args: unknown[]): void;
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[][];
  loaded: boolean;
  version: string;
}
interface Window {
  fbq?: MetaPixel;
  _fbq?: MetaPixel;
  gtag?: (...args: unknown[]) => void;
  dataLayer: unknown[][];
  __gaLoaded?: boolean;
}
