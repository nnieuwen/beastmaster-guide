// @ts-check
import { defineConfig } from 'astro/config';

// Static output: every route is prebuilt to plain HTML in dist/, so the site
// can be dropped onto any static host once a domain is chosen.
export default defineConfig({
  output: 'static',
  site: 'https://nnieuwen.github.io',
  // Temporary home on GitHub Pages; drop `base` once the site has its own domain.
  base: '/beastmaster-guide',
  trailingSlash: 'always',
});
