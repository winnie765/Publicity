# Public Site Manager

Open /workspace/site-manager inside the password-protected Workspace.

## Publishing workflow

1. Choose a section or select a recorded post in Community Highlights.
2. Edit approved public copy, upload or reuse images, and choose page visibility.
3. Save Draft to keep changes private. Incomplete drafts are allowed; publishing validates required content.
4. Use Save Draft & Preview to review the real public layouts, including mobile width. Preview navigation stays inside the protected Workspace.
5. Publish Changes to update the public site. Publishing a draft removes its pending copy. Stale edits are rejected when the live record has changed.

The same database and original post references are used throughout. Standalone stories do not create analytics posts. Gallery files stay in cloud storage; the database stores paths and metadata.

## Sections

- Homepage: hero, image, buttons, section headings/descriptions, public page introductions, invitation and footer copy.
- Community Highlights: review recorded Facebook, Instagram and Workvivo posts; feature, pin or remove approved content.
- Stories: independent or post-linked articles with author, publish date, formatted text, featured image and ordered galleries.
- Programme Pages: configured brands, overview, cover, galleries and drag-and-drop featured activity/story ordering.
- Upcoming Activities: date, location, description, registration link and page visibility.
- Community Impact: verified figures and an internal source note. The latest published as-of date supplies public figures; unknown counts stay unavailable.
- Partners: names, descriptions, uploaded logos and HTTPS website links.
- Media Library: search names, filter categories, upload, reuse, replace or delete unused files.
- Preview: protected views of saved drafts before publication.
- AI Content Assistant: public summaries, story excerpts, homepage/event descriptions; English, Simplified Chinese or bilingual; rewrite, improve, shorten, expand or translate.

Workvivo originals, metrics and images remain internal. A separately approved public excerpt can reference a Workvivo post, using images approved for public use from other library folders. No internal captions or metrics are copied automatically.

## Visibility and recovery

Homepage, Community Highlights, Stories and Programme Page visibility are independent. Feature Content increases priority; Pin to Top takes precedence. Hide from Public Site preserves the record. Stories with future publish dates remain hidden until their date; protected previews include scheduled stories.

Deleting content moves saved public records to the existing Trash system. Restored records remain hidden until approved again. Deleting a public story preserves its original social post and analytics. Discarding an unpublished draft is permanent.

Image replacement updates active editable content and drafts referencing the asset, including thumbnails. Historical report snapshots and Trash recovery copies are preserved. Deletion is blocked while any saved record still references a file.

Public pages request current published content without caching, refresh when focused and every thirty seconds while visible. Publishing signals other tabs in the same browser immediately. Gemini uses the existing hosting secret and shared allowance of forty generations per UTC day. No content is published by AI.

## Validation

Run node scripts/test-public-site-manager.mjs for isolated SQLite, image storage, access control, publishing, preview, recovery, safe rich text, rendering and mocked AI checks. Tests do not use live records, cloud objects or Gemini allowance.
