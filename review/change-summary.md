# Changes prepared for review

October 5, 2026. Production has not been changed.

## Design and scope

The supplied recovered template differs visibly from the current public site. Following the user's latest instruction, the candidate uses the captured live desktop, mobile and tablet templates. Existing page wrappers, stylesheet URLs, backgrounds, image crops, header, service cards, section order and footer are retained. The store and wholesale links continue to the current public site during local review.

GitHub push protection flagged an unused mapping credential in the public platform HTML. It was removed from the reference captures, candidate HTML and unpublished commit. No map widget is used on these pages, and push protection was not bypassed.

The two rewritten destinations are `/custom` and `/wood`. Homepage changes are bounded supporting edits to positioning, contact, headings and business description. The other eight service destinations retain their existing copy and metadata. Their existing hero titles become H1s without replacing their text, and shared business/schema/contact repairs apply to them.

## SEO and contact foundation

- Corrected the live homepage's actual Washington/DC/Embs HVAC structured-data fields. Used the owner-confirmed public phone/email and San Marcos locality, without selecting a disputed suite, adding coordinates, hours, ratings or license claims.
- Added named services, stable IDs, serviceType, provider relationships, page records and visible breadcrumb text. Each of the eleven routes has one H1 and its existing canonical path. Priority metadata describes the actual local offer.
- Retained the live sitemap's 562 URLs. Recorded 563 discovered public URL responses, including `/quote`, in the migration sheet. No consolidation, deletion or blanket store redirect is configured.
- Replaced popup inquiry links with a working path to the homepage contact section. Corrected phone/email destinations. Retained the actual hosted navigation and repaired local drawer closure/focus behavior without changing its styling.
- Replaced the hosted form submission fields with a short project inquiry using the existing form styling: name, email or phone, project type, city, description and optional timeline. Added accessible statuses, field limits, privacy copy and phone/email fallback. No newsletter enrollment is implied.
- Removed the old hosted form/captcha binding from the local inquiry form. Its challenge depended on the previous platform's submission flow. Replacement deployment abuse controls must be configured and verified before launch.
- Require explicit genuine email-dispatch acceptance before a lead event. HTTP 200 alone is insufficient. Spam, errors and test receipts do not count. Phone/email clicks are intent events. Events exclude contact details, city and message text.
- Added controlled malformed-body, method, origin, payload, validation, configuration, provider and timeout responses. Retry requests reuse a provider idempotency key; repeat clicks cannot create simultaneous submissions. Values remain entered when delivery is unconfirmed.
- Removed the recovered unversioned-asset immutable cache policy. Preserved the original analytics ID as an account-verification record only; local preview does not send to GA4. No guessed GTM ID was installed.

## Buyer information

`/custom` now describes the confirmed storefront, material supply, custom sourcing and installers. It explains layout/appliance inputs, material and finish choices, itemized scope, scheduling factors and six questions before booking. Existing semi-custom, RTA and flooring links remain useful next steps.

`/wood` now explains materials plus installation, estimates, preparation responsibility, product-specific suitability and stair-component checks. Materials-only purchases are secondary. It links the existing waterproof, laminate catalog and cabinetry destinations. No universal waterproofing, guaranteed match, technical wear-layer rule, invented price or turnaround is promised.

Imagery remains the live site's existing imagery. It is not labeled as a completed Model Home project. Project provenance and publication rights need confirmation before proof content is added.

The original “Crafting Your Dream Spaces” section heading and styled spans are restored on `/custom` and `/wood` at the user’s request; the project guidance beneath remains.

The Dream Spaces text on both priority pages uses three short, clearly labeled blocks: what Model Home does, what the customer should send, and what to confirm before booking. The existing fonts and colors are retained.

## Visible differences to review

Longer service headings and useful buying guidance increase the text sections' height. Breadcrumbs, expandable answers and contact qualification fields use the existing palette and typography. The footer adds the verified San Marcos locality. Existing mobile consultation buttons remain hidden unless the user approves revealing them; the question is pending. Exact phone-header layout has been retained.

## Verification limits

Local source/schema/route checks, mocked backend tests and browser behavior are recorded in the adjacent JSON reports. Provider acceptance, inbox receipt, durable storage, real analytics collection, deployed Vercel rewrites, real-device testing, rankings and field performance are not claimed as verified.

## October 6 audit pass (branch `review/audit-metadata-schema-links`)

Audit of `review/seo-contact-custom-wood` at `7694091`: `tools/build.py` reproduces all 33 committed page variants byte-for-byte, so the refined `/custom`, `/wood` and homepage work lives in `tools/content.json` and `tools/build.py`. Edit those, not the generated HTML.

Changed in this pass:

- Eight secondary pages: replaced the legacy `... | USA` titles (with stray whitespace) and "Explore now!" descriptions with unique San Marcos titles and factual descriptions. Body copy on those pages is unchanged.
- Every page: `og:site_name` set; Twitter title/description follow the page title/description.
- Schema: `areaServed` now lists North County San Diego and the named service areas, matching a new sentence in the homepage About text. `FAQPage` added on `/custom` and `/wood`, generated from the visible questions. Homepage gains a `WebPage` node.
- Homepage links: 12 card buttons pointed back to `/`, and two flooring cards were mislinked on the live site (Laminate to `/semi-custom`, Luxury Vinyl to `/vanity`). All now go to the matching service page or the inquiry form. The hero button is "Discuss Your Project" to the form instead of "Shop Now"; the store remains in the navigation.
- Homepage kitchen cards: "Expert Designers", "High-Quality Craft" and "Collaborative Process" became "Cabinetry & Flooring Together", "Materials & Installation" and "Semi-Custom & RTA Options". Design responsibility is still an open owner question, so the designer claim was removed.
- Secondary pages: each ends with a short related-links line to the relevant core page and the inquiry form. Previously they linked only to Home and Contact.
- `tools/validate.py` now fails on legacy titles, metadata length, missing `og:site_name`, FAQ schema that differs from visible questions, schema areas absent from visible copy, homepage self-links, and any street address, license number or owner name appearing in schema before confirmation.

Not changed, and why:

- Street address, CSLB number and owner name are held in `content.json` under `pending_confirmation` and are not published. The Suite F / Unit G question is open and the CSLB lookup again returned no record data.
- Secondary-page H1s remain the one-word hero titles (`WATERPROOF`, `RTA`, ...). Changing them alters the hero design; do it with the secondary-page content pass.
- Nine homepage images have empty alt text. The image CDN is not reachable from the build environment, so they could not be viewed and no alt text was guessed. The homepage images are stock photos (Pexels filenames).
- `review/store-category-migration-draft.csv` maps 15 of 66 store category URLs by name. The other 51 are collection or brand names that need the catalog's parent-category data. The 484 product URLs are untouched. Nothing is wired into `vercel.json`.
- Browser, visual and screenshot checks were not rerun: they need the hosted template assets and a local Chrome. Rerun `node tools/browser.test.cjs` and `node tools/capture.cjs after` before approving.
