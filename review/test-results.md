# Local verification results

October 5, 2026. No actual email was sent and production was not changed.

| Check | Result | Evidence |
|---|---|---|
| Recovered baseline | 73 files match the supplied recovered directory; ZIP retained and hashed | source-preservation.json |
| Backend | 14 test groups passed, including input, configuration, provider failures/timeouts, duplicate retry keys, tests and escaping | tools/contact.test.cjs |
| Source/SEO | 33 page variants passed; eleven unique route titles/descriptions, one H1, canonical paths, non-null named schema, valid local destinations | static-validation.json |
| Sitemap/store | Live 562-URL sitemap retained; 563 discovered URLs including quote all returned 200; no blanket store redirect | url-inventory.csv, crawl-observations.json |
| Browser/device routes | All eleven routes passed on desktop, phone and tablet; no horizontal overflow or page exceptions | browser-validation.json |
| Menu/accessibility | Phone open/close, Escape focus restoration, contact navigation and collapsed state passed; expandable answers work by keyboard | browser-validation.json |
| Form behavior | Actual local handler retains entered data on missing configuration; mocked success clears data, repeat submissions send once; rejection/errors/spam/tests create zero lead events | browser-validation.json |
| Event privacy | No visitor name, email, phone, city or message in data-layer events | browser-validation.json |
| Original design | Nine sampled route/device combinations have zero measured typography/color/button differences across five elements; original embedded styles, stylesheet/image URLs and existing store destinations retained on all eleven desktop pages | design-validation.json, semantic-changes.json |
| Screenshots | Twelve matched before/after screenshots: homepage, custom, wood at 1440px desktop and 390px phone with actual phone user agent | review gallery |

The previews use the existing live layout and hosted assets. Copy length, qualification fields, breadcrumb text, FAQs and the verified city line are visible content changes. The phone header and hidden consultation buttons remain as on the live site pending the user's optional contact-visibility decision.

Not verified: real provider acceptance, inbox receipt, durable lead storage/retry operations, analytics collection in the client account, deployed Vercel device rewrites, store continuity after cutover, current license status, physical-device behavior, rankings or field performance. These remain in launch-dependencies.md.
