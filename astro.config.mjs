// @ts-check
import { defineConfig } from 'astro/config';

// Static output: every route is prebuilt to plain HTML in dist/, so the site
// can be dropped onto any static host once a domain is chosen.
export default defineConfig({
  output: 'static',
  // Primary host is Cloudflare Pages at the domain root. Setting BASE_PATH
  // (the GitHub Pages workflow does) moves every link under a sub-path.
  site: process.env.SITE_URL ?? 'https://beastmaster-guide.pages.dev',
  base: process.env.BASE_PATH ?? '/',
  trailingSlash: 'always',
});
