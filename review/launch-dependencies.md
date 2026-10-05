# Launch dependencies and rollback

This branch is ready for local review after its tests pass. It is not approved for production cutover or merge-to-deploy.

| Dependency | Exact remaining work |
|---|---|
| User review | Approve page copy, matched screenshots and any permitted mobile contact visibility change. Approve publication separately. |
| Ranking evidence | Obtain client GSC/GA4 landing-page and query baselines and backlinks before any redirect, consolidation, catalog pruning or additional metadata overhaul. Current ranking strength is unknown. |
| Active store | Preserve all useful `/store` category/product paths on the same public hostname. Keep the existing host/store active. Choose a tested split-routing architecture or an approved URL-by-URL migration. Absolute links in a localhost preview do not preserve store hosting after a DNS cutover. No wildcard redirect is approved. |
| Quote URL | `/quote` currently responds 200 and represents the builder's popup. Decide how to preserve its function/URL or approve an appropriate redirect after checking search/backlink use. The eleven-page candidate does not reproduce that endpoint. |
| Vercel account | Confirm project ownership, root `site/`, Other preset, Node.js 22 and disabled production auto-publication during review. Deploy a protected preview and verify all eleven canonical routes plus mobile/tablet conditional rewrites. Current local checks are not Vercel-routing proof. |
| Hosted visual resources | The candidate retains the live platform's CSS, JavaScript, font, image and video URLs to preserve its exact template. Confirm rights and continued CDN availability, or recover/package the authorized assets and repeat visual comparisons before canceling the old host. Hosted runtime components remain a migration risk. |
| Exposed platform token | GitHub push protection flagged a mapping credential embedded in the public live HTML. It was removed from this review's source and unpublished history. Identify its owner with the current platform/provider and arrange revocation or rotation if required; no live account credential was changed. |
| Lead delivery | Configure `RESEND_API_KEY`, `CONTACT_FROM` with a verified non-test sender, and `CONTACT_TO` with the confirmed destination. Add the preview origin to `CONTACT_ALLOWED_ORIGINS` if required; set `CONTACT_TEST_MODE=true` for staging tests. An authorized real test must be accepted and confirmed in the intended inbox. No actual message was sent in this work. |
| Durable lead receipt | Select existing client-approved CRM/storage, persist an inquiry before acknowledging it as stored, add retry/delivery alerts and operational ownership. Current acceptance means email dispatch accepted by Resend; it is not durable CRM acceptance or verified inbox delivery. No new paid service was introduced. |
| Abuse protection | Configure and test platform rate limits/WAF for `/api/contact` and an approved spam control if traffic requires it. Origin checks and a honeypot are not a distributed rate limiter. |
| Analytics | The current live site exposes `G-49C93L1JWC`. Confirm ownership and the intended existing GA4/GTM installation. Retain history; enable one installation only and test real-time/debug events, exclusion of spam/tests and absence of PII. The preview intentionally does not send to that property. |
| Business claims | Resolve the owner sheet; review the eight retained secondary pages' historical manufacturer, suitability and scope claims before publishing them unchanged. Do not invent missing facts. |
| Indexing and performance | Verify preview protection/noindex and its absence on production; check canonical host, robots, sitemap, true 404 behavior, one-hop approved redirects and final 200 responses. Run deployed performance tests and actual phone checks; no rankings or field Core Web Vitals are claimed. |
| DNS/email continuity | Save current DNS records including MX, SPF, DKIM, DMARC and verification entries. Change only approved web records at cutover. Verify existing mail remains available. |

## Publication and rollback sequence

1. Keep the original archive and current live host/store. Record current DNS and hosting settings, service URLs, catalog export, analytics baselines and a rollback contact.
2. Resolve the dependencies above. Review the staging copy, form delivery, analytics, visual comparisons and full routing/store path. Preserve all existing indexable URLs unless a particular change is approved.
3. Obtain the user's final production approval. Do not treat merging this draft PR as approval for a DNS or hosting cutover.
4. Change only the approved deployment/domain settings. Check the homepage, `/custom`, `/wood`, store/category/product URLs, `/quote`, contact receipt, analytics and domain email immediately.
5. If critical contact, store, indexing or design checks fail, restore the captured web DNS/hosting settings to the existing live site. Keep its hosting/account active so rollback is possible. Recheck email DNS and public routes.

## Official references checked during implementation

- [Resend send-email API](https://resend.com/docs/api-reference/emails/send-email): explicit provider receipt and required sender/recipient fields.
- [Resend idempotency keys](https://resend.com/docs/dashboard/emails/idempotency-keys): duplicate email protection lasts 24 hours; it does not replace lead storage.
- [Vercel Node.js runtime](https://vercel.com/docs/functions/runtimes/node-js) and [project configuration](https://vercel.com/docs/project-configuration): confirm runtime, routing and hosting in staging.
- [Duda device behavior](https://support.duda.co/hc/en-us/articles/26519216195095-Screen-Sizes-and-Devices): the classic mobile template is device-dependent; viewport resizing alone is insufficient for comparison.
- [Official CSLB lookup](https://www.cslb.ca.gov/OnlineServices/CheckLicenseII/LicenseDetail.aspx?LicNum=927826): no usable license result obtained; status remains unverified.
