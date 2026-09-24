import { HttpError } from './http.ts';

export function isPublicAddress(address: string): boolean {
  const host = address.toLowerCase().replace(/^\[|\]$/g, '');
  if (host.includes(':')) {
    // Only native global-unicast IPv6; no loopback, link-local, ULA, mapped IPv4 or transition ranges.
    return /^[23][0-9a-f]{3}:/.test(host) && !/^200[12]:/.test(host) && !host.startsWith('2001:db8:');
  }
  const parts = host.split('.').map(Number);
  if (parts.length !== 4 || parts.some(n => !Number.isInteger(n) || n < 0 || n > 255)) return false;
  const [a,b,c] = parts;
  return !(a === 0 || a === 10 || a === 127 || a >= 224 || (a === 100 && b >= 64 && b <= 127)
    || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168)
    || (a === 192 && b === 0) || (a === 192 && b === 88 && c === 99)
    || (a === 198 && (b === 18 || b === 19 || b === 51)) || (a === 203 && b === 0 && c === 113));
}

export function parsePublicUrl(input: unknown): URL {
  if (typeof input !== 'string' || input.length > 2048) throw new HttpError(400, 'URL inválida.');
  let url: URL;
  try { url = new URL(/^https?:\/\//i.test(input.trim()) ? input.trim() : `https://${input.trim()}`); }
  catch { throw new HttpError(400, 'URL inválida.'); }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || (url.port && !['80', '443'].includes(url.port))) throw new HttpError(400, 'URL não permitida.');
  const host = url.hostname.toLowerCase().replace(/\.$/, '');
  if (!host.includes('.') || /(?:^|\.)(localhost|local|internal|lan|home|test|invalid)$/.test(host)) throw new HttpError(400, 'Endereço privado não permitido.');
  if (/^[\d.]+$/.test(host) || host.includes(':')) throw new HttpError(400, 'Use um domínio público.');
  return url;
}

export async function safeFetchHtml(input: unknown): Promise<string> {
  let url = parsePublicUrl(input);
  const allowed = (Deno.env.get('SCRAPE_ALLOWED_HOSTS') || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
  for (let redirect = 0; redirect < 4; redirect++) {
    if (allowed.length && !allowed.includes(url.hostname.toLowerCase())) throw new HttpError(400, 'Domínio não permitido.');
    const resolutions = await Promise.allSettled([Deno.resolveDns(url.hostname, 'A'), Deno.resolveDns(url.hostname, 'AAAA')]);
    const addresses = resolutions.flatMap(r => r.status === 'fulfilled' ? r.value : []);
    if (!addresses.length || addresses.some(ip => !isPublicAddress(ip))) throw new HttpError(400, 'Endereço não permitido.');
    const response = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(10_000), headers: {
      'User-Agent': 'CarouselBot/1.0', Accept: 'text/html,application/xhtml+xml',
    } });
    if ([301,302,303,307,308].includes(response.status)) {
      await response.body?.cancel();
      const location = response.headers.get('location');
      if (!location) throw new HttpError(400, 'Redirecionamento inválido.');
      url = parsePublicUrl(new URL(location, url).href);
      continue;
    }
    if (!response.ok) { await response.body?.cancel(); throw new HttpError(400, 'Não foi possível ler a página.'); }
    if (!/text\/html|application\/xhtml\+xml/i.test(response.headers.get('content-type') || '')) {
      await response.body?.cancel(); throw new HttpError(400, 'A URL deve apontar para uma página HTML.');
    }
    const reader = response.body?.getReader();
    if (!reader) return '';
    let bytes = 0; let html = ''; const decoder = new TextDecoder();
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        bytes += value.byteLength;
        if (bytes > 1_048_576) { await reader.cancel(); throw new HttpError(413, 'Página muito grande.'); }
        html += decoder.decode(value, { stream: true });
      }
      return html + decoder.decode();
    } finally { reader.releaseLock(); }
  }
  throw new HttpError(400, 'Muitos redirecionamentos.');
}
