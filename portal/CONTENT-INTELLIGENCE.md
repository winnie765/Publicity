# Content intelligence

## Workspace

**Content Intelligence** (`/workspace/content`) reviews stronger and weaker posts and ranks recorded themes, brands and formats independently within Facebook and Instagram. Every saved post can open **Post Performance Analysis** from its details in the analytics pages or Post Library. Native Workvivo posts use their own peers. An associated Workvivo view has no engagement until internal measurements exist; external metrics are never copied into it.

The comparison engine uses prefix sums over date-sorted peer groups. It excludes the target and later publication dates. Each metric first tries the same account and content type, then the same account, platform/type and platform, in that order. The chosen fallback and sample count are displayed. At least three measured peers are needed. A positive baseline supports a ratio; missing or zero baselines do not.

Internal review labels use engagement ratios of at least 1.5x for High Performing and less than 0.75x for Below Average. Reported views or reach below 0.75x flag lower visibility independently. These are review rules, not industry standards or significance tests. Historical default reach zeros remain unmeasured unless explicitly reported. The new content views may use recorded reach; this does not restore reach across older dashboards or monthly reports.

Themes come from recorded topic/category metadata. No theme, participant story, visual quality or call-to-action quality is inferred from a title. AI explains supplied comparisons and proposes hypotheses and tests; it does not inspect images or invent missing content characteristics. Source observations, why they matter, possible contributing factors and recommended actions are kept distinct. **Add to Content Planner** saves an idea, never publishes content.

## Industry Trends

`/workspace/industry-trends` reads dated RSS updates from an allowlisted set of publishers: World Health Organization, HelpAge International and the Social Care Institute for Excellence. Sources include their original links, dates, region and publisher categories. Available feeds refresh when checked after six hours; an entirely unavailable snapshot can be retried after five minutes. The workspace checks on opening, focus and periodic use. This is an on-demand cache, not a scheduled background crawler.

Fetches have timeouts, response-size bounds and redirect rejection. Feed links are restricted to their publisher's HTTPS host. DTD/entity declarations are rejected. Failed sources are reported and previous dated updates may be retained. No article image, stock illustration or sample trend is inserted.

Topic counts measure publisher-category mentions among retrieved updates. They do not measure social reach, engagement, format popularity or campaign success. AI may propose source-grounded future content tests; it must not use newer articles to explain historical post performance. External organisation and sector benchmarking remain disabled until comparable permissioned measurements are available. The existing organisation benchmark type retains source, period, unit, sample and consent fields for future use.

## Public automation

**Public Site Manager → Content Showcases** controls the new public section's heading, description, visibility and Number of Posts (3, 6, 9, 12 per collection). Administrators manage presentation only. Ranking and date-window settings have been retired and stored legacy values are ignored. Public visitors see content without filters or analytics explanations. Automatic selection considers all eligible public history so historical posts remain usable; recent posts sort newest first.

- Latest posts use the source Post Date (newest first); standalone stories and highlights use their publication date. Linked public excerpts are deduplicated by source post.
- Top posts default to Automatic: positive engagement descending, then remaining posts by positive views, then reach. Distinct measurement units are never added together. This system-defined ranking cannot be configured by administrators.
- Featured collections prioritise Homepage Feature and administrator selections, then measured shares and engagement. A flagged post does not need positive metrics to be featured. Manual selections precede automatic choices across eligible history and precede automatic engagement/views/reach selections. Public section order is Featured, Top Performing, Most Recent. The expandable Latest Stories & Community Highlights collection has been removed from public rendering; underlying content remains available to other collections.
- Trending Now is no longer displayed publicly. The retained internal comparison requires engagement, reported reach or reported views at least 1.5x each of the platform, brand and format baselines, with at least three measured peers for each, excluding the target. It is not a real-time velocity measure.

Published Facebook/Instagram posts enter the public feed automatically by default; Automatic Showcases is shown in the publishing selector. Explicit Not Public excludes a record. no duplicate CMS record or Public Summary is needed. Summary stays blank when omitted and never falls back to internal text. Explicit Not Public wins over stale promotion flags. Incomplete linked CMS records cannot suppress public posts; explicit CMS Hide or scheduled publication remains authoritative. Empty collections display "No posts available." Only story IDs already eligible for the approved public feed are emitted. Hidden, draft, scheduled and Workvivo content is excluded. Ranking uses private metrics server-side, but metric values, peer averages, internal notes and private post IDs are not serialized into the public showcase selection payload. Approved social records additionally expose a limited public-detail projection: content type, engagement/reach/views (null when unrecorded), classification and calculated public-peer insights. No internal notes, captions, stakeholder logs, account fields or raw private records are included. Read More opens a validated Facebook/Instagram URL in a new tab; otherwise View Details opens the existing public article route. Public insights are labelled calculated, never presented as generated AI. Changing a post's approval or visibility automatically removes it from the collections on the next public refresh.

## Storage and verification

Source snapshots use the existing generic record store (`industry_trends`). Showcase preferences extend the existing home JSON record. No new database migration or environment variable is required. Existing Gemini settings and shared cache/budget handling are reused. Post comparisons render immediately where local data is available; AI runs separately from saves and public rendering. Public visits do not call AI.

Run `npm run test:content-intelligence`, `npm run test:analytics`, `npm run test:user-guide` and the existing monthly report and public CMS checks. Tests exercise peer selection, missing/zero values, source validation/cache/outages, authenticated APIs, actual provider invocation with mocked responses, theme rankings, public visibility/privacy and CMS synchronization.

Community Highlights is retired from the public landing page, CMS tabs and publishing destination choices. Existing public content and uploaded assets are preserved for other showcases; legacy storage folder keys and historical flags remain readable.
