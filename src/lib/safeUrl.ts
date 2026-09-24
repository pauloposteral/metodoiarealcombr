/** Reject executable protocols while preserving normal internal and web links. */
export function safeContentUrl(value: string, image = false): string | undefined {
  if (!value || Array.from(value).some(char => char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127)) return undefined;
  const trimmed = value.trim();
  if (trimmed.startsWith('/') && !trimmed.startsWith('//') && !trimmed.includes('\\')) return trimmed;
  try {
    const url = new URL(trimmed);
    if (url.username || url.password) return undefined;
    if (url.protocol === 'https:' || url.protocol === 'http:' || (!image && url.protocol === 'mailto:')) return trimmed;
  } catch { /* Invalid URLs are rendered as ordinary text. */ }
  return undefined;
}
