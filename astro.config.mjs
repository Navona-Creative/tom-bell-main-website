import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import fs from 'node:fs';

// URLs match the old WordPress site exactly (trailing slashes included)
// so nothing in Google's index or in backlinks breaks at cutover.
const SITE = 'https://tombellcabinetry.com';
const posts = JSON.parse(fs.readFileSync(new URL('./src/data/posts.json', import.meta.url), 'utf8'));
const postModified = new Map(posts.map((p) => [`${SITE}/${p.slug}/`, p.modified]));
const newestPost = posts.reduce((a, p) => (p.modified > a ? p.modified : a), '');
const buildDate = new Date().toISOString();

export default defineConfig({
  site: SITE,
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [
    sitemap({
      // Leave out pages that shouldn't be indexed or are just paginated lists.
      filter: (page) =>
        !page.includes('/thank-you/') &&
        !/\/page\/\d+\/$/.test(page) &&
        !page.includes('/category/'),
      // lastmod: real modified date for posts; newest post for the blog index; build date for pages.
      serialize(item) {
        if (postModified.has(item.url)) item.lastmod = postModified.get(item.url);
        else if (item.url === `${SITE}/blog/`) item.lastmod = newestPost;
        else item.lastmod = buildDate;
        return item;
      },
    }),
  ],
});
