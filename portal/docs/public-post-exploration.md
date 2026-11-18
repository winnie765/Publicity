# Public Post Intelligence refinement

Reviewed 18 November 2026. One existing Industry Trends section; no second dashboard, post database, Planner or social collector. No production records, secrets or migrations were changed.

## Operational

- Manual entry uses original Facebook/Instagram URLs, an official organisation identity reference, publication and retrieval dates, available public counts and explicit staff confirmation. Optional title/topic is displayed locally. Missing counts stay null; recorded zero remains zero. Instagram private shares, Reach, Views, Saves and impressions are not collected or estimated.
- Common Facebook post/video/watch links and Instagram post/reel identities support duplicate prevention. Canonical www/mobile account URLs identify the same peer account. Explicit Facebook post-owner mismatches are rejected. Existing records cannot be reassigned to another account during measurement updates.
- **Update Measurements** reopens the saved record. Staff recheck visible counts and confirm the source. Earlier observations remain immutable; older readings cannot replace a newer observation. Date validation follows Singapore calendar time.
- Singapore is the default. Existing organisation/platform/topic/format/date/measurement filters remain; search and **Strong matched examples only** are added. Cards show source links, title/topic, format, public component readings, collection date, staff verification date and limitations.
- Strong relative performance means at least 1.5 times a positive mean from three or more other posts matching account, platform, format, publication month, public component definition and actual measurement age. Likes-only and all-reaction Facebook definitions stay distinct. This is descriptive evidence from selected examples, not complete account coverage, a cross-organisation league table, verified trending popularity or proof of content quality. No posting-frequency conclusions are drawn from an incomplete inventory.
- AI lessons reuse the existing Gemini provider, evidence cache/allowance and Analyst's conservative qualitative screen. Fresh and cached lessons must cite valid evidence, cannot supply numerical prose/private metric claims/unsupported viral claims, and cannot repeat the same action. Displayed public figures and summary are rebuilt from stored readings. Configured brand/format suggestions remain proposed experiments, not proven results. Local saved titles and unreviewed descriptions/techniques are not substituted for the staff-approved anonymised AI observation.
- Staff inspect the source, review the proposed idea/format/angle/success measure and explicitly approve saving to the existing Content Planner. Editing resets approval. Submission also checks approval, rather than relying only on a disabled button. Nothing is published automatically.
- Fixed a visual bug: public cards used the muted **text** colour as their background. They now use existing neutral analytics-card, border and text tokens, including dark theme colours.

## Official-source investigation

The source directory contains discovery references, not seeded posts, fabricated metrics or automatic account certification. Staff must reconfirm the current official profile before recording a post.

| Organisation | Primary evidence | Result |
| --- | --- | --- |
| AIC | [Official Body Mechanics guide](https://www.aic.sg/wp-content/uploads/2023/06/Body-Mechanics-EN.pdf), [2025 GP playbook](https://www.primarycarepages.sg/healthier-sg/Documents/Healthier%20SG%20Playbook%20for%20GPs_%20version%201.0%20May%202025.pdf) | Corroborates Facebook AICSingapore and Instagram aic_singapore. These are published references, not a live inventory. Older materials contain differing aliases; aliases are not silently merged. |
| NTUC Health | [Official eldercare release](https://assets.ntuchealth.sg/nh/Documents/Meeting-Future-Needs-of-Eldercare-NTUC-Health-Introduces-New-Initiatives-to-Further-Support-Families-and-Caregivers.pdf), [official website](https://ntuchealth.sg/) | Release identifies NTUCHealth on Facebook and Instagram; website confirms active-ageing/senior-care relevance. Current post counts were not collected. |
| Fei Yue | [Official site](https://fycs.org/) | Confirms Active Ageing Centre services. Exact current Facebook/Instagram URLs were not established by the accessible official pages; no guessed handles were added. |
| Tsao Foundation | [Official site](https://tsaofoundation.org/) | Confirms ageing and community-care work. Exact current social account links were not established; no guessed handles were added. |

Other operators can be entered using the same source-verification workflow; the directory is not an approval list or exhaustive operator dataset.

## Automatic collection is not operational

[Meta Business Discovery](https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-facebook-login/business-discovery) documents an authorised route for other Instagram professional accounts with app/token requirements. This portal has no validated permitted social-data connection. Facebook public-content access documentation was not accessible in the research tool; unrestricted Page collection was not assumed. No approved provider, unrestricted public social RSS feed or connected collection credentials were established.

Consequently no social scheduler was activated, no restricted scraping was added, and no manual record is labelled a live feed. Existing Industry Trends article refresh remains separate and unchanged. Automatic social collection requires permitted access, validated accounts, inventory/metric coverage, rate-limit/error handling and verified observation timestamps before a scheduled job can be enabled. No additional key is required for the manual workflow.

## Modified files

- `lib/public-post-intelligence.ts`: title, identity/duplicate/update checks, Singapore dates, canonical peer accounts, descriptive labels and common Facebook URL support.
- New `lib/public-post-lessons.ts`: shared Analyst screening of fresh/cached public lessons and deterministic public summary.
- New `lib/public-post-sources.ts`: dated primary-source discovery references; no post data.
- `app/api/public-post-intelligence/route.ts`: screen returned lessons and exclude local titles from the model payload.
- `app/public-post-intelligence.tsx`: existing-section filters, source references, update entry, screening status and Planner review guard.
- `app/industry-trends.css`: existing neutral design tokens, readable cards and checkbox sizing.
- `lib/user-guide.ts`: reviewed current Industry Trends workflow; review date 18 November 2026.
- New `scripts/test-public-post-exploration.mjs`: isolated fixtures for the new behaviour.

The previous uncommitted AI Analyst refinement is preserved separately.

## Verification scope

Tests use isolated fixtures and mocked Gemini, never fake production posts. Manual source validation, duplicates, null/zero metrics, matched-peer eligibility, observation history, cached lesson screening, authentication/CSRF, Planner payloads and approval guards are checked. Live external collection cannot be tested because no authorised collector is connected. Live Gemini output and interactive browser/mobile acceptance still require deployment UAT; passing mocked tests does not certify external counts or qualitative lessons. Final lint, TypeScript and build outcomes are reported with completion.

Passed on completion: `test-public-post-exploration.mjs`, `test-public-post-intelligence.mjs`, `test-public-post-api.mjs`, `test-organisation-benchmarks.mjs`, `test-industry-trends.mjs`, `test-user-guide.mjs`, targeted ESLint and Next.js production build including TypeScript checks. The Industry Trends scheduler tests concern the existing article feeds, not an automatic social-post integration. No deployment was performed.
