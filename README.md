# QuickRide Africa

Marketing and booking website for QuickRide Africa — a corporate ground transportation and chauffeur service operating across Southern Africa.

**Live site:** [quickride.africa](https://quickride.africa)

## Overview

This is a static multi-page site (no build step, no framework) with two serverless API endpoints for form handling, deployed on Vercel.

- Plain HTML, CSS, and vanilla JavaScript — each page is a standalone `.html` file.
- Modular CSS split by concern (`tokens`, `base`, `nav`, `components`, `pages`, `footer`, `form`).
- Two backend endpoints (Vercel serverless functions) that email form submissions via [Resend](https://resend.com).
- Google Tag Manager installed site-wide for analytics and Google Ads conversion tracking.

## Structure

```
├── index.html, about.html, services.html, fleet.html, corporate.html,
│   faq.html, contact.html, book.html, privacy.html, terms.html   # pages
├── thank-you.html, contact-thank-you.html                        # form confirmation pages
├── css/                                                          # modular stylesheets
├── js/                                                            # nav, animations, booking form logic
├── api/
│   ├── book.js                                                   # booking form → email via Resend
│   └── contact.js                                                # contact form → email via Resend
├── img/, favicon_io/                                             # static assets
├── sitemap.xml, robots.txt
```

## Forms & email delivery

Both `book.html` and `contact.html` submit via `fetch()` to their respective `/api/*` endpoint, which sends the submission as an email through Resend. On success, the user is redirected to a dedicated thank-you page (`thank-you.html` / `contact-thank-you.html`) rather than an inline message — this gives each conversion a real, trackable URL.

The API functions require a `RESEND_API_KEY` environment variable, configured in the Vercel project settings (not committed to this repo).

## Booking form

The booking form (`book.html`) is a 3-step wizard (`js/form.js`):

1. **Details** — contact info + journey details
2. **Vehicle** — passenger count + vehicle preference + flight info (conditional)
3. **Notes** — special requests and submission

Each step updates the URL (`book.html?step=2`, etc.) via `history.pushState` and fires a `virtualPageview` event to `dataLayer`, so step-by-step funnel drop-off can be tracked in Google Tag Manager / Google Ads.

## Analytics

Google Tag Manager (`GTM-PHZLHV69`) is installed on every page. Conversion and funnel tracking triggers are configured directly in the GTM container — no analytics code beyond the base snippet lives in this repo.

## Deployment

Hosted on [Vercel](https://vercel.com), connected to this GitHub repository. Pushes to `main` deploy to production; other branches get preview deployments.
