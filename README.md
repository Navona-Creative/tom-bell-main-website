# Tom Bell Cabinetry: website

Static site for [tombellcabinetry.com](https://tombellcabinetry.com), built with [Astro](https://astro.build) and deployed on Cloudflare Pages. It replaces the WordPress/Beaver Builder site. Every URL matches the old site, trailing slashes included, so SEO and backlinks carry over.

Site by [Navona Creative](https://www.navonacreative.com).

## Local

```
npm install
npm run dev        # http://localhost:4321
npm run build      # outputs to dist/
npx wrangler pages dev dist   # serves dist/ + functions/ (contact form) locally
```

## Cloudflare Pages settings

| Setting | Value |
| --- | --- |
| Framework preset | Astro |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Production branch | `main` |
| Node version | `NODE_VERSION=22` |

### Contact form email

The form posts to `functions/api/contact.js` (Cloudflare Pages Function), which sends each request through **Resend** (resend.com, free tier):

- From: `Tom Bell Cabinetry Website <website@tombellcabinetry.com>`
- To: `matt@tombellcabinetry.com` (override with Pages variable `TO_EMAIL`)
- Reply-To: the visitor's email, so Matt can reply directly
- Needs the Pages secret `RESEND_API_KEY`, and `tombellcabinetry.com` verified in Resend (DKIM `resend._domainkey`, plus SPF/MX on the `send` subdomain). Email for the domain itself stays on Google Workspace (root MX records unchanged).

Cloudflare Email Service was not used because it requires the Workers Paid plan. The unused `tom-bell-contact-mailer` Worker and the `MAILER` binding can be deleted.

Email authentication on the domain: SPF `v=spf1 include:_spf.google.com include:tombellcabinetry.com.spf.auto.dnssmarthost.net ip4:35.212.79.162 ~all` (fixed 2026-11-03; remove the SiteGround include and IP after WordPress is retired), Google DKIM `google._domainkey`, Resend DKIM, DMARC `p=quarantine`.

## Structure

- `src/site.ts`: business details, nav, social links, Google tag ID. Single source of truth.
- `src/layouts/Base.astro`: head/SEO (title, description, canonical, OG), HomeAndConstructionBusiness JSON-LD, Google tag `GT-WBKSTRVJ` (same as WordPress Site Kit, so Analytics history continues).
- `src/layouts/ServicePage.astro` + `src/data/services.ts`: the four service pages (copy carried over from WordPress).
- `src/pages/`: one folder per URL. Blog posts render from `src/pages/[slug]/` at the site root, like the WordPress permalinks.
- `src/data/posts.json`, `src/data/legal.json`: blog posts and Privacy/Terms, exported from WordPress.
- `public/wp-content/uploads/...`: blog featured images at their original WordPress paths.
- `public/img/`: site photography (WebP). `hero-kitchen.webp` (homepage hero) is licensed Adobe Stock ID 377231448.
- `public/_redirects`: old Redirection-plugin rules, Yoast sitemaps, feeds, WP system URLs.
- `functions/api/contact.js`: contact form handler (Cloudflare Pages Function), emails via Resend.
- `src/scripts/motion.ts`: GSAP ScrollTrigger + Lenis scroll animation. Respects `prefers-reduced-motion`.

## Blog

Posts were written in WordPress by the Soro "SEO Autopilot" plugin. Soro only publishes to WordPress, so once WordPress is gone new posts stop unless one of these is set up:

- **Keep WordPress as a private CMS** (e.g. on a subdomain). Soro keeps publishing there; run `npm run sync:wp` (with `WP_URL=https://<that-host>`) on a schedule or deploy hook to pull new posts into `src/data/posts.json` and rebuild.
- **Switch the autoblogger** to one that commits to GitHub or posts to a webhook.

`npm run sync:wp` is safe to re-run. It refreshes posts and Privacy/Terms and downloads any new featured images.

## Cutover checklist

1. Pages project `tom-bell-main-website` (Matt's Cloudflare account) deploys `main` automatically. Preview: https://tom-bell-main-website.pages.dev
2. Submit a test lead on the preview and confirm it arrives at matt@tombellcabinetry.com (check spam the first time).
3. Delete the `OG_HOST` environment variable (it points share cards at the pages.dev preview), then add `tombellcabinetry.com` + `www` as custom domains on the Pages project, then update DNS. **Do not touch MX/email records.**
4. Google Search Console: submit `https://tombellcabinetry.com/sitemap-index.xml`.
5. Decide the blog path (above) before turning off WordPress.
6. Keep the WordPress backup.
