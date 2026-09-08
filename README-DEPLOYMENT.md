# FuelPath Pro — 50-page website upgrade

This project preserves the existing FuelPath Pro calculator and expands its content hub to **50 SEO guide pages** plus About, Contact, Privacy, Terms, Disclaimer, Cookies and Sitemap pages.

## Run
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```

## Deploy to Cloudflare Pages
1. Push this folder to a GitHub repository.
2. Create a Cloudflare Pages project and connect the repository.
3. Build command: `npm run build`
4. Output directory: `dist`
5. The included `public/_redirects` supports SPA routes such as `/guide/mileage-calculator`.

## Important
The sitemap currently uses the supplied Netlify hostname. If you deploy on another hostname, update `public/sitemap.xml`, `public/robots.txt`, and the canonical URL in `index.html`.

For AdSense, add your own verified publisher/ad code only after your AdSense account and site are approved. Do not publish placeholder publisher IDs.
