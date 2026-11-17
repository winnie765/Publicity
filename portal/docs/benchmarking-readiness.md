# Fair benchmarking: implementation and readiness

Reviewed 17 November 2026. No production records, environment values or historical report snapshots were changed. No migration or dependency was added.

## Operational historical comparisons

The existing shared comparison policy and period utilities remain authoritative. MoM, QoQ and YoY support full calendar periods and comparable partial windows; clipped unequal windows retain recorded values but withhold changes. Actual comparison dates remain visible. Monthly report archives are not recalculated.

This change closes several remaining inconsistencies:

- Interaction changes require matching account sets, platform, component definitions, measurement coverage and supported measurement ages. Likes-only readings cannot become complete engagement. Explicit platform-group descriptive Top Hits rankings retain their existing scope.
- Facebook Views and Instagram Reach comparisons require compatible measured coverage and account sets. Missing visibility readings cannot silently become zeros or be dropped before eligibility checking.
- Historical average eligibility uses the full source cohort, including records with missing measurements, rather than only the measured subset.
- Brand, account and dashboard change displays honour clipped-window eligibility. Raw recorded totals remain available.
- The existing verified follower-date policy was reviewed and regression-tested. Inferred dates remain historical records but are excluded from verified growth; no additional follower calculation was introduced.
- Unknown post measurement ages remain a limitation of internal comparisons; actual recorded ages must match when present. No Day 7/14/30 engagement is reconstructed.

## Conditional public account comparisons

Organisation-wide benchmarking is still **disabled**: no verified full-operator dataset or authorised automated social-data connection was supplied or verified. Individual examples cannot establish operator-wide performance.

The existing Public Post Intelligence now supports optional manual **Review Public Account-Period Coverage**, in the same Industry Trends section. It reuses `external_public_post` and immutable `external_public_observation` records. New generic record kinds `organisation_benchmark` and `organisation_benchmark_review` contain coverage metadata and review history, not a second external-post database.

Staff workflow:

1. Record source-verified public posts for both our official account and the external account. Include weak posts, not only successful examples. Facebook likes-only and all-reaction counts have distinct definitions; unknown definitions cannot support a benchmark.
2. Enumerate the entire completed account-period inventory and declare its total. Link our public account to its existing Configuration account and explicitly confirm that identity. Account master IDs preserve renames when available.
3. Choose identical public metric components and actual post-age observations. The minimum is three fully measured posts per account-period. Recorded zero counts are valid; a zero baseline never produces an invented percentage.
4. Record the inventory profile source, external account relevance and limitations, then explicitly approve the manual review.
5. Open Social Media Analytics, Performance Comparisons, **Public Account Benchmarks**. Select the exact publication dates, platform and account/brand filters matching the reviews. Choose the two accounts to inspect the one comparison table, coverage, original posts and retrieval dates.

Comparisons require identical platform, exact reporting dates, public components, reaction definition and actual measurement age. A saved Day 7 observation can remain usable after a later Day 30 update; the later count cannot replace it. New inventory posts invalidate the old completeness attestation. Missing readings or incompatible scopes withhold differences while preserving available values.

This is a descriptive **single-account, staff-attested** comparison, not independent source certification, an organisation-wide ranking, or proof of content quality. Account suitability remains a human judgement. Audience size, promotion and content mix may differ. Private engagement totals, Reach, Views, Saves and impressions are excluded from these public comparisons. The existing deterministic difference formula is reused.

## External-source investigation

No external performance figures were fabricated or seeded. Research corroborated sector relevance, with account-verification limitations:

| Organisation | Primary source reviewed | What it establishes / limitation |
| --- | --- | --- |
| AIC | [Official caregiver guide](https://www.aic.sg/wp-content/uploads/2023/06/Caregiver-Burnout-Guide-EN.pdf), [2025 GP playbook](https://www.primarycarepages.sg/healthier-sg/Documents/Healthier%20SG%20Playbook%20for%20GPs_%20version%201.0%20May%202025.pdf) | Published references to Facebook AICSingapore and Instagram aic_singapore. Dated corroboration, not a current live inventory or performance dataset. Older AIC material has differing handles; aliases were not assumed equivalent. |
| NTUC Health | [Official website](https://ntuchealth.sg/), [official 2016 report](https://assets.ntuchealth.sg/nh/Documents/NTUC-Health-Financial-Report-2016.pdf) | Current care relevance; historical Facebook NTUCHealth reference. Current social ownership and a full period of counts still need verification. |
| Tsao Foundation | [Official website](https://tsaofoundation.org/) | Relevant ageing/community-care organisation. Current social account identity and public count inventory were not independently established. |
| Fei Yue | Official site attempted: https://www.fycs.org/ | Retrieval was unavailable in the research environment. No account or performance data was imported as verified. |

[Meta Instagram Business Discovery](https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-facebook-login/business-discovery) and its [official reference](https://developers.facebook.com/documentation/instagram-platform/instagram-graph-api/reference/ig-user/business_discovery) describe supported professional-account retrieval, including accessible likes/comments fields under required app/token permissions. This does not grant this portal access. No configured, approved connection was validated. Facebook public-content access documentation could not be fully retrieved in the research environment; unrestricted Page access was not assumed.

No approved provider was connected and no social collector or social refresh cron was activated. Existing article RSS scheduling is unchanged and separate. Manual records are clearly labelled manual. Automating social measurements requires a permitted source, appropriate app access/credentials, validated account identities, complete inventory retrieval and historical age-aligned measurements; any future integration must verify these before activation. The manual workflow requires no new API key.

## AI boundaries

The existing AI Analyst and public-post lessons remain the sole interpretation workflows. This change does not create another analyst or feed unverified operator benchmarks to AI. Public account comparison results are deterministic and expose their supporting sources. Organisation-wide AI benchmark conclusions remain unsupported without a suitable dataset. Internal/public partial totals must never be treated as equivalent private engagement totals.

## Files changed for this benchmarking work

- `lib/comparison-policy.ts`, `lib/brand-comparison.ts`, `lib/analytics-decision.ts`, `lib/analytical-dashboards.ts`: eligibility consistency and shared formula export.
- `app/dashboard-intelligence.ts`, `app/top-hits.ts`, `app/analytics-decision-support.tsx`: consistent changes, explicit descriptive ranking scope and retained-location navigation.
- `lib/public-post-intelligence.ts`, `app/public-post-intelligence.tsx`, `app/api/public-post-intelligence/route.ts`: reaction definitions, source identity, existing API integration.
- New `lib/organisation-benchmarks.ts`, `app/public-benchmark-coverage.tsx`, `app/organisation-benchmark-evidence.tsx`: metadata reviews, deterministic comparisons and one detailed display.
- `app/analytical-dashboards.tsx`: embeds that display in existing Performance Comparisons.
- `lib/user-guide.ts`: reviewed Analytics and Industry Trends instructions; static review date remains 17 November 2026.
- New `scripts/test-organisation-benchmarks.mjs`; updated `scripts/test-public-post-intelligence.mjs`, `scripts/test-analytics-decisions.mjs`: regression coverage.

Other pre-existing uncommitted AI Analyst changes were preserved and are outside this benchmarking change.

## Verification and deployment

Automated checks use isolated memory/SQLite fixtures, never production test records. See the completion report for final command outcomes and browser results. The new regression test covers inventory approval, account identity, complete/partial metrics, definitions, zero baselines, exact periods/platforms/ages, minimum samples, master-account renames, observation history and invalidation.

Deploy through the normal existing application deployment after reviewing these changes. No new database migration, secret or scheduled endpoint is required for the manual workflow. Production source connectivity, real complete inventories and real-world data accuracy still require staff acceptance review; a passing mocked test does not establish external-data access.
