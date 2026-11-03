import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// URLs match the old WordPress site exactly (trailing slashes included)
// so nothing in Google's index or in backlinks breaks at cutover.
export default defineConfig({
  site: 'https://tombellcabinetry.com',
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/thank-you/') && !/\/page\/\d+\/$/.test(page),
    }),
  ],
});
