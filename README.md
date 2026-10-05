# Model Home website review — October 5, 2026

Draft GitHub review: [PR #1](https://github.com/Bburnworthtv/Model-home-inc/pull/1). Review branch: `review/seo-contact-custom-wood`. Deployable website directory: `site/`. This is a local review candidate, not an approved production release.

The original archive was preserved. The recovered website is saved in the initial Git commit. `live-source/` contains public desktop, phone and tablet HTML captured on October 5, with unused mapping credential configuration removed after GitHub push protection flagged it. The user's later instruction to match the live template supersedes the handoff's black/white/yellow recovered-template direction. `site/` retains the actual live site's wrappers, imagery, fonts, colors, header, section order, cards and footer.

## Preview and evidence

Run `node tools/serve.cjs`, then open `http://127.0.0.1:4173/review/`. The server binds to this computer only, sends `X-Robots-Tag: noindex, nofollow, noarchive`, and cannot dispatch email. The website is at `/`; the review gallery contains matched before/after screenshots and launch dependencies.

Read [review/change-summary.md](review/change-summary.md), [review/launch-dependencies.md](review/launch-dependencies.md), [review/business-confirmations.md](review/business-confirmations.md), and [review/url-inventory.csv](review/url-inventory.csv). Test results are saved alongside them.

## Scope

Flooring and cabinetry installation jobs have equal priority. Material selection and sourcing support booked projects; materials-only inquiries remain a secondary option. The homepage changes support the two substantive destinations, `/custom` and `/wood`. Secondary-page copy and metadata are retained for a later evidence-based review. No city pages, proof pages, fabricated testimonials, catalog rebuild or new paid services were added.

## Local checks

- `node --test tools/contact.test.cjs` — backend tests with mocked delivery only.
- `node --check site/api/contact.js` and `node --check site/assets/site.js`.
- `python tools/validate.py` with `lxml` available — all 33 page variants, schema fields, links, canonicals, sitemap retention and deployment rules.
- `node tools/browser.test.cjs` — installed Chrome and Playwright required; full route/menu/form/event checks with no email dispatch.
- `node tools/design.test.cjs` — measured live/preview typography, color and button comparisons.
- `node tools/capture.cjs after` — desktop and real phone-user-agent screenshots.

Browser helpers use the Codex bundled Playwright path and this computer's installed Chrome. Adapt those paths for another machine. `tools/build.py` regenerates the edited pages from the captured public templates and `tools/content.json`; it requires `lxml`. Recovery tools overwrite reference captures, so do not rerun them casually after approval.

## Hosting

The existing live site and store must remain available. There are 562 URLs in the public sitemap; 563 discovered URLs were checked including `/quote`, all returning HTTP 200 at capture time. Response status alone does not prove that each product is useful or indexed. The original sitemap is retained. No catalog redirect or removal is approved.

For a future Vercel preview, use the `site/` root, preset Other, no build command, and Node.js 22. `site/vercel.json` preserves the builder's device-specific templates with conditional rewrites. Verify those rules on a protected staging deployment before any production cutover. CDN resources remain hosting dependencies. Do not cancel the current host/store or change DNS until the launch dependency sheet is resolved and the user approves publication.
