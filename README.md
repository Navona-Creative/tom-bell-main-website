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

### Environment variables (Settings > Variables and Secrets, Production and Preview)

| Name | Required | What it does |
| --- | --- | --- |
| `GHL_WEBHOOK_URL` | **Yes** | GoHighLevel Inbound Webhook URL. Every estimate request is POSTed here as JSON. |
| `RESEND_API_KEY` | Optional | Backup email copy of each lead via Resend. |
| `LEAD_EMAIL_TO` | With Resend | Comma-separated recipients, e.g. `sales@tombellcabinetry.com`. |
| `LEAD_EMAIL_FROM` | With Resend | Verified sender, e.g. `Tom Bell Website <website@tombellcabinetry.com>`. |

If neither GoHighLevel nor Resend is configured, the form shows an error asking visitors to call. **Set `GHL_WEBHOOK_URL` before launch.**

### GoHighLevel setup (replaces Gravity Forms + the GHL add-on)

1. GHL > Automation > Create Workflow > trigger **Inbound Webhook**. Copy the URL into `GHL_WEBHOOK_URL`.
2. Submit one test lead from the preview site so GHL sees the payload.
3. Add a **Create/Update Contact** action. Map `first_name`, `last_name`, `email`, `phone`. Put `message` in a note or custom field.
4. Map `sms_marketing_consent` / `sms_transactional_consent` (true/false) to your SMS consent fields or tags. These are the same two A2P consent checkboxes as the old form.
5. Re-create whatever notifications/follow-ups the old Gravity Forms feed triggered.

Payload fields: `first_name, last_name, email, phone, message, sms_marketing_consent, sms_transactional_consent, source, page, submitted_at, ip`.

## Structure

- `src/site.ts`: business details, nav, social links, Google tag ID, booking widget URL. Single source of truth.
- `src/layouts/Base.astro`: head/SEO (title, description, canonical, OG), HomeAndConstructionBusiness JSON-LD, Google tag `GT-WBKSTRVJ` (same as WordPress Site Kit, so Analytics history continues).
- `src/layouts/ServicePage.astro` + `src/data/services.ts`: the four service pages (copy carried over from WordPress).
- `src/pages/`: one folder per URL. Blog posts render from `src/pages/[slug]/` at the site root, like the WordPress permalinks.
- `src/data/posts.json`, `src/data/legal.json`: blog posts and Privacy/Terms, exported from WordPress.
- `public/wp-content/uploads/...`: blog featured images at their original WordPress paths.
- `public/img/`: site photography (WebP). `hero-kitchen.webp` (homepage hero) is licensed Adobe Stock ID 377231448.
- `public/_redirects`: old Redirection-plugin rules, Yoast sitemaps, feeds, WP system URLs.
- `functions/api/contact.js`: contact form handler (Cloudflare Pages Function).
- `src/scripts/motion.ts`: GSAP ScrollTrigger + Lenis scroll animation. Respects `prefers-reduced-motion`.

## Blog

Posts were written in WordPress by the Soro "SEO Autopilot" plugin. Soro only publishes to WordPress, so once WordPress is gone new posts stop unless one of these is set up:

- **Keep WordPress as a private CMS** (e.g. on a subdomain). Soro keeps publishing there; run `npm run sync:wp` (with `WP_URL=https://<that-host>`) on a schedule or deploy hook to pull new posts into `src/data/posts.json` and rebuild.
- **Switch the autoblogger** to one that commits to GitHub or posts to a webhook.

`npm run sync:wp` is safe to re-run. It refreshes posts and Privacy/Terms and downloads any new featured images.

## Cutover checklist

1. Connect this repo in Cloudflare Pages, set the env vars, test the form on the `*.pages.dev` preview (Pages adds `noindex` on preview domains automatically).
2. Set up the GHL Inbound Webhook workflow (above) and confirm a test lead arrives.
3. Add `tombellcabinetry.com` + `www` as custom domains on the Pages project, then update DNS. **Do not touch MX/email records.**
4. Google Search Console: submit `https://tombellcabinetry.com/sitemap-index.xml`.
5. Decide the blog path (above) before turning off WordPress.
6. Keep the WordPress backup.
