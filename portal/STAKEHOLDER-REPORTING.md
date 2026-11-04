# Publicity Intelligence and stakeholder reporting

Open **Publicity Intelligence** in the workspace sidebar (`/workspace/publicity`). Choose a month and year to review quality, stakeholder activity and recommended actions. The executive dashboard also links to this workspace.

## Record an interaction

1. Click **Record Stakeholder Interaction**.
2. Choose a configured stakeholder or one of the supported stakeholder options. A supported option is added to Configuration when first used, reusing an existing normalised master record where available.
3. Search and select a saved post. Typing a title alone is insufficient; the form requires a selected record.
4. Choose an interaction type and date, optionally enter notes, and save.

Each new entry represents one verified interaction. Existing imported aggregate counts remain supported. The existing interactions collection stores `stakeholder_id`, `post_id`, `interaction_type`, `interaction_date`, and `notes`. Legacy `postId`, `type`, and `date` fields are maintained for compatibility. IDs and relationships are validated on the server; post titles are resolved from saved posts, not entered as interaction text. Existing Configuration master relationships control stakeholder names.

Post detail views show linked interactions and offer an action to record another.

## Metric definitions

- **Completeness:** populated title, platform, account, brand, content type, date and valid original URL fields divided by all seven monitored fields across selected posts.
- **Validation rate / quality score:** posts passing all automated completeness, date, master-configuration and duplicate checks divided by total checked posts. This is not manual approval.
- **Potential duplicates:** records beyond the first matching normalised original URL within the same platform/account, or matching post identity if no URL exists. Tracking parameters are ignored. Review candidates; nothing is automatically deleted.
- Quality checks include selected-month and undated posts, including drafts. Optional Location, sharing and collaboration metadata never count as missing required reporting fields and do not block imports or saves.
- Stakeholder analytics include published Facebook and Instagram posts, with interactions selected by interaction date. A stakeholder may interact this month with a post from an earlier month. Workvivo stays separate.
- **Stakeholder posts:** distinct posts with logged activity. **Interactions:** sum of recorded counts. **Engagement:** measured audience engagement on those distinct posts, counted once regardless of how many interactions were logged. It is not engagement attributable to a stakeholder.
- Format/brand/shared/collaboration comparisons are descriptive measured-post averages. They do not establish causation or statistical significance. Trends show the latest twelve recorded months.
- Missing evidence is shown as unavailable; zero logged activity does not prove absent stakeholder interest.

## Monthly reports

**Create Monthly Report** opens the existing generator with the selected month. Newly generated snapshots include publicity, quality, stakeholder, AIC, GRA, partner, insight and recommendation sections. Existing archived snapshots remain unchanged and readable; generate a new snapshot to include the new sections.

Monthly reporting completion indicates whether a monthly snapshot exists for the selected month. Stakeholder reporting completion measures inclusion of the five target sections in the latest snapshot, including clearly labelled sections with no logged evidence. Neither measure indicates review, submission or stakeholder approval.

AI analysis uses calculated evidence and the existing provider, with Observation, Why It Matters and Recommended Action. Calculated decision cards remain available when AI is unavailable. AI does not block recording an interaction.

## Deployment and verification

This module extends existing record storage and master relationships; it requires no new environment variable or database migration. Deploy the updated application to make it available on the live website.

From `portal`, run `node scripts/test-publicity-reporting.mjs` and `node scripts/test-monthly-reports.mjs` to check relationships, input validation, metric calculations, authenticated report status and report compatibility.
