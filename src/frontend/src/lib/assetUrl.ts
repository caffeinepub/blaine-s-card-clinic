/**
 * Build a base-path-aware URL for static assets.
 * Uses import.meta.env.BASE_URL to ensure assets load correctly
 * regardless of whether the app is served from / or a subpath.
 */
export function assetUrl(path: string): string {
  const base = import.meta.env.BASE_URL || '/';
  // Remove leading slash from path if present to avoid double slashes
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  // Ensure base ends with slash
  const cleanBase = base.endsWith('/') ? base : `${base}/`;
  return `${cleanBase}${cleanPath}`;
}
