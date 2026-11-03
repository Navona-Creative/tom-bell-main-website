// Pulls blog posts + legal pages from the WordPress REST API into src/data/,
// and copies each post's featured image into public/ at its original
// /wp-content/uploads/... path (so old image URLs keep working).
//
// Usage:  WP_URL=https://tombellcabinetry.com npm run sync:wp
// Safe to re-run: existing images are skipped.

import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const WP = (process.env.WP_URL || 'https://tombellcabinetry.com').replace(/\/$/, '');
const SITE = 'https://tombellcabinetry.com';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const DATA = path.join(ROOT, 'src/data');
const PUB = path.join(ROOT, 'public');

async function getAll(type, extra = '') {
  const out = [];
  for (let page = 1; ; page++) {
    const res = await fetch(`${WP}/wp-json/wp/v2/${type}?per_page=100&page=${page}&status=publish&_embed=wp:featuredmedia${extra}`);
    if (!res.ok) break;
    const batch = await res.json();
    out.push(...batch);
    if (batch.length < 100) break;
  }
  return out;
}

const decode = (s = '') =>
  s.replace(/&#8217;|&#039;/g, '’').replace(/&#8216;/g, '‘').replace(/&#8220;/g, '“').replace(/&#8221;/g, '”')
   .replace(/&#8211;/g, '–').replace(/&#8212;/g, '—').replace(/&#038;|&amp;/g, '&').replace(/&nbsp;/g, ' ')
   .replace(/&#8230;/g, '…').replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const strip = (h = '') => decode(h.replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();

// Make internal links relative so they work on any host (preview + production).
const relLinks = (html) =>
  html.replace(/href="https?:\/\/(www\.)?tombellcabinetry\.com(\/[^"]*)?"/g, (_m, _w, p) => `href="${p || '/'}"`);

async function saveImage(url) {
  if (!url) return null;
  const rel = url.replace(/^https?:\/\/[^/]+/, '');
  const dest = path.join(PUB, rel);
  try { await fs.access(dest); return rel; } catch {}
  const res = await fetch(url);
  if (!res.ok) return null;
  const buf = Buffer.from(await res.arrayBuffer());
  await fs.mkdir(path.dirname(dest), { recursive: true });
  const img = sharp(buf).rotate().resize({ width: 1600, withoutEnlargement: true });
  await (rel.endsWith('.webp') ? img.webp({ quality: 78 }) : rel.match(/\.png$/i) ? img.png() : img.jpeg({ quality: 80, mozjpeg: true })).toFile(dest);
  return rel;
}

const seo = (item) => {
  const y = item.yoast_head_json || {};
  return { seoTitle: decode(y.title || ''), seoDescription: decode(y.description || y.og_description || '') };
};

const posts = await getAll('posts');
const outPosts = [];
for (const p of posts) {
  const media = p._embedded?.['wp:featuredmedia']?.[0];
  const image = await saveImage(media?.source_url);
  outPosts.push({
    id: p.id,
    slug: p.slug,
    title: decode(p.title.rendered),
    date: p.date_gmt + 'Z',
    modified: p.modified_gmt + 'Z',
    excerpt: strip(p.excerpt.rendered),
    content: relLinks(p.content.rendered),
    image,
    imageAlt: decode(media?.alt_text || p.title.rendered),
    imageWidth: media?.media_details?.width || null,
    imageHeight: media?.media_details?.height || null,
    ...seo(p),
  });
}
outPosts.sort((a, b) => b.date.localeCompare(a.date));

const pages = await getAll('pages');
const legal = {};
for (const slug of ['privacy-policy', 'terms']) {
  const p = pages.find((x) => x.slug === slug);
  if (!p) continue;
  legal[slug] = {
    title: decode(p.title.rendered),
    modified: p.modified_gmt + 'Z',
    // drop the page's own <h1> (the layout renders it)
    content: relLinks(p.content.rendered).replace(/<h1[\s\S]*?<\/h1>/i, '').trim(),
    ...seo(p),
  };
}

await fs.mkdir(DATA, { recursive: true });
await fs.writeFile(path.join(DATA, 'posts.json'), JSON.stringify(outPosts, null, 1));
await fs.writeFile(path.join(DATA, 'legal.json'), JSON.stringify(legal, null, 1));
console.log(`Synced ${outPosts.length} posts, ${Object.keys(legal).length} legal pages from ${WP}`);
