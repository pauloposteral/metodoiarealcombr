import { safeContentUrl } from './safeUrl.ts';

/** Absolute https URL without embedded credentials. */
export function isHttpsUrl(value: string): boolean {
  if (!safeContentUrl(value) || /\s/.test(value.trim())) return false;
  try {
    const url = new URL(value.trim());
    return url.protocol === 'https:' && url.hostname.includes('.') && !url.username && !url.password;
  } catch {
    return false;
  }
}

const YOUTUBE_ID = /^[\w-]{6,20}$/;

/**
 * Embeddable https URL for a lesson video. YouTube and Vimeo page links become their player
 * URLs (page links refuse to load inside an iframe); other https URLs are used as given.
 */
export function videoEmbedUrl(value: string | null | undefined): string | null {
  if (!value || !isHttpsUrl(value)) return null;
  const url = new URL(value.trim());
  const host = url.hostname.replace(/^www\.|^m\./, '');
  if (host === 'youtube.com' && url.pathname === '/watch') {
    const id = url.searchParams.get('v');
    return id && YOUTUBE_ID.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : null;
  }
  if (host === 'youtu.be') {
    const id = url.pathname.slice(1);
    return YOUTUBE_ID.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : null;
  }
  if (host === 'vimeo.com' && /^\/\d+$/.test(url.pathname)) return `https://player.vimeo.com/video${url.pathname}`;
  return url.toString();
}
