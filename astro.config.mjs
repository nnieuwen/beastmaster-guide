// @ts-check
import { defineConfig } from 'astro/config';

// Static output: every route is prebuilt to plain HTML in dist/, so the site
// can be dropped onto any static host once a domain is chosen.
export default defineConfig({
  output: 'static',
  site: 'https://example.com', // TODO: set once the domain is picked
  trailingSlash: 'always',
});
