# Session handoff — October 6, 2026

Written from a cloud Claude session so a local Claude Code session can continue with the same context. Read this with `review/change-summary.md` (section "October 6 audit pass"), `review/business-confirmations.md` and `review/launch-dependencies.md`.

## Where the work is

- Branch to continue from: `review/audit-metadata-schema-links` (draft PR #2, based on `review/seo-contact-custom-wood` at `7694091`). Draft PR #1 is the earlier branch.
- Nothing is merged or deployed. Do not merge or publish without Brandon's review.
- Pages are generated. Edit `tools/content.json` and `tools/build.py`, then run `python tools/build.py` and `python tools/validate.py` (needs `lxml`). Do not hand-edit `site/**/index.html`; the build overwrites it. `tools/build.py` reproduced the committed pages byte-for-byte at `7694091`.
- Checks passing on this branch: `python tools/validate.py` (33 page variants, no errors) and `node --test tools/contact.test.cjs` (14 pass). Browser, visual and screenshot checks (`tools/browser.test.cjs`, `tools/capture.cjs`) were NOT rerun after this pass.

## Facts that differ from the original handoff document

- This branch has no `/store/*` redirects at all (the blanket redirect to `/wood` was only on the recovered baseline). The sitemap still lists all 562 live URLs, but only 11 pages exist in `site/`.
- The inventory (`review/url-inventory.csv`) has 484 product URLs and 66 category URLs, not about 166.
- The site uses the captured live Duda template and its hosted CSS, fonts and images, so it still depends on that CDN.
- Street address (Suite F vs Unit G), CSLB #927826 and the owner's name are unconfirmed. They sit in `content.json` under `business.pending_confirmation` and are not published. `validate.py` fails if they appear in schema. The CSLB lookup returned no record data in two separate sessions.

## Decisions made in this chat (Brandon)

- There is no Search Console or analytics history for the site, so do not wait for a ranking baseline. Make the highest-value SEO changes now. The secondary-page title and description changes stand.
- Store direction: keep existing store pages as a catalog without checkout or payments. Keep only products that already have real photos and data on the live site, on their current URLs, with a "Request pricing" action feeding the inquiry form (product name pre-filled). Drop placeholder, $0 and photo-less products. Route category URLs to the nearest service page or a rebuilt category listing. This is agreed in principle; the keep/drop list has not been built.
- The store is a supporting catalog, not the lead driver. Expected job drivers, in order: Google Business Profile, `/custom` + `/wood` + homepage, real project pages, Contact/Estimate and About pages, verified lead delivery and call tracking.

## Open items

1. Screaming Frog audit: Brandon ran one in a local Claude Code chat. It is not in this repo or his Google Drive. Needed exports: Internal tab (filter "All") -> Export (`internal_all.csv`), and Bulk Export -> Images -> All Image Inlinks. Optional: Bulk Export -> Links -> All Inlinks. Commit them under `review/screaming-frog/`.
2. Using that crawl, sort the 484 products and 66 categories into keep / redirect / drop, show Brandon the list, then build the "Request pricing" product template. `review/store-category-migration-draft.csv` maps only 15 of 66 categories by name; the other 51 are collection or brand names needing parent-category data.
3. Catalog data: Brandon's Drive has a Simple.biz folder "Website Assets-Model Home Inc." with `2026-09-28_dec24b30.zip` (154 MB, not yet opened; probably the site export and images) and `Collection-01.csv` (a single product row, not the catalog). Open the zip and check for product images and data before Simple.biz shuts down.
4. Nine homepage images have empty alt text; they are stock photos (Pexels filenames) and could not be viewed from the cloud session. Do not guess alt text.
5. Secondary-page H1s are still one-word hero titles (`WATERPROOF`, `RTA`, ...).
6. Not started: About, Projects, Showroom, Contact/Estimate and Service Areas pages; live lead-form and analytics testing; full desktop/mobile QA; review deployment.

## Questions waiting on Brandon or Dustin

- Suite F or Unit G, and is CSLB #927826 active? Both stay off the site until confirmed.
- Does Dustin confirm the service-area list now on the homepage and in schema (San Marcos, San Elijo Hills, Lake San Marcos, Carlsbad, Encinitas, Rancho Santa Fe, parts of Escondido)? It came from the agency's target markets.
- Should Dustin Roller be named publicly as owner?
- Real project photos (three jobs with city and scope) are still the biggest content gap.
