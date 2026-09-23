export function sanitizeTextInput(value: string | null | undefined, maxLength = 200): string {
  if (value == null) return '';
  const normalized = String(value)
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);

  return normalized.replace(/[<>]/g, '');
}

export function getSafeUrl(value: string | null | undefined, fallback = ''): string {
  if (!value) return fallback;

  try {
    const parsed = new URL(value, window.location.origin);
    const safeProtocols = ['http:', 'https:'];

    if (!safeProtocols.includes(parsed.protocol)) {
      return fallback;
    }

    const dangerous = /^(javascript:|data:|vbscript:)/i.test(parsed.href);
    return dangerous ? fallback : parsed.href;
  } catch {
    return fallback;
  }
}

export function getSafeImageUrl(value: string | null | undefined, fallback = ''): string {
  return getSafeUrl(value, fallback);
}

export function openSafeExternalUrl(url: string | null | undefined): boolean {
  const safeUrl = getSafeUrl(url);
  if (!safeUrl) return false;

  window.open(safeUrl, '_blank', 'noopener,noreferrer');
  return true;
}
