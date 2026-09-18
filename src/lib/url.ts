// Every internal link and icon path in the source is written root-relative
// (`/bestiary/`, `/icons/…`). This prefixes Astro's configured `base` so the
// same build works at a domain root and under a sub-path such as GitHub Pages.

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

export const withBase = (path: string): string => (path.startsWith('/') ? BASE + path : path);

/** Deep-walks a JSON blob and rebases every string that points into /icons/. */
export function rebaseIcons<T>(value: T): T {
  if (typeof value === 'string') return (value.startsWith('/icons/') ? withBase(value) : value) as T;
  if (Array.isArray(value)) return value.map(rebaseIcons) as T;
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, rebaseIcons(v)])) as T;
  }
  return value;
}
