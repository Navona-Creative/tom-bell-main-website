# Tom Bell Cabinetry — Main Website

Source for the redesigned [tombellcabinetry.com](https://tombellcabinetry.com).

Maintained by Navona Creative.

## Deployment

This site will deploy on **Cloudflare Pages**. It will replace the current WordPress site at launch.

- Production branch: `main`
- Every push to `main` deploys to production
- Other branches get preview URLs

## Launch checklist

- [ ] Finish the redesign and commit the site files
- [ ] Connect this repo in Cloudflare Pages (Workers & Pages > Create > Pages > Connect to Git)
- [ ] Set the build command and output directory
- [ ] Check the `*.pages.dev` preview
- [ ] Add the custom domains `tombellcabinetry.com` and `www.tombellcabinetry.com`
- [ ] Set up 301 redirects from the old WordPress URLs (`_redirects` file)
- [ ] Resubmit the sitemap in Google Search Console
