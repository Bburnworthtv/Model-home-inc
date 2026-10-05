# modelhomeinc.com

Static site (no build step), rebuilt from the Duda export. Deploy on Vercel: import the repo, framework preset "Other", no build command, output directory is the repo root.

- `api/contact.js` is the contact form handler. Set `RESEND_API_KEY`, `CONTACT_TO`, `CONTACT_FROM` in Vercel.
- The JSON-LD (name, phone, San Marcos, San Diego County, services) matches the visible copy. Change both together.
- Still needed: street address for the schema, and review, Instagram and project-photo content.

## Analytics (Google Tag Manager only)
Add the **client-owned** GTM container snippet to each page's head and body. Configure GA4 inside GTM; do not also add gtag.js. The site pushes these `dataLayer` events: `generate_lead` (only after the server confirms the send), `phone_click`, `email_click`, `form_start`, `estimate_cta_click`, `instagram_click`, `outbound_click`. Add `data-track="directions_click"`, `showroom_cta_click` or `project_view` to any element to fire those.

## Store migration
`/store` and `/store/*` (old Ecwid) 301 to `/wood`, the closest live flooring page. Export the indexed URLs from Search Console and map individual URLs precisely (cabinet items to `/custom`, truly dead pages to 410) before DNS cutover.
