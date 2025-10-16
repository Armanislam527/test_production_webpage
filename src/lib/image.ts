export function optimizeImage(url: string, width = 800): string {
  try {
    if (!url) return url;
    const u = new URL(url);
    // Add common params for popular CDNs or fall back to original
    if (u.hostname.includes('pexels.com')) {
      u.searchParams.set('auto', 'compress');
      u.searchParams.set('cs', 'tinysrgb');
      u.searchParams.set('w', String(width));
    }
    return u.toString();
  } catch {
    return url;
  }
}


