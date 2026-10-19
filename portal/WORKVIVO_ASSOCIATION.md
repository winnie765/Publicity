# Optional Workvivo association

Facebook and Instagram records support is_workvivo_associated (unchecked unless explicitly selected), workvivo_category, workvivo_url and workvivo_caption. Shared create/edit forms preserve these fields; metric-only imports retain existing choices. Existing records remain unassociated.

Workvivo views project associated source records without duplicating storage or changing the source platform, account or external metrics. Internal metrics and stakeholder attribution are unavailable for associated records; external counts never become Workvivo counts. Native Workvivo records retain their metrics. Reports include an associated-content register. Private captions and URLs never enter public projections.

Generate Workvivo Content uses the existing authenticated Gemini writing route and shared 40/day limit. Caption, internal summary and partner messaging are reviewable drafts; only choosing Use Workvivo Caption updates the editable caption. Saving is explicit. No social networks are published to automatically.

Verify: node scripts/test-workvivo-association.mjs and node scripts/test-original-post-links.mjs.
