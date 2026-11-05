# Product documentation maintenance

The User Guide is part of the product. For every feature addition, removal, rename, relocation, redesign, or behaviour change:

- Review `portal/lib/user-guide.ts` and update all affected page entries, action explanations, locations, and workflows in the same change.
- Each page must explain its Purpose, Key Features, Buttons & Actions, and Common Workflow. Use the actual labels and routes in the application.
- Remove instructions for retired functionality. Document optional fields, visibility rules, master-data dependencies, and destructive-action behaviour when affected.
- Set `guideLastUpdated` to the date of the actual content review. Never calculate this date from the current date at runtime or automatically stamp it without reviewing the content.
- Run `npm run test:user-guide` from `portal` and the relevant feature checks. Check search, guide links, and the changed instructions.
- If a change has no user-facing effect, still review the guide and explain why no content update was needed in the change description.

Keep company branding, environment secrets, and unrelated user changes intact. Do not create a separate Help Centre, FAQ, or ticketing workflow.

Use the shared `FieldLabel` component for form labels. Required fields show a red asterisk, never the visible suffix `(required)`. Set the indicator from the actual validation rule, including conditional publishing rules; optional fields must remain unmarked.
