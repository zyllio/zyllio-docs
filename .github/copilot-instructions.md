# Copilot Instructions - Zyllio Docs Migration

## Objective
This repository contains a local documentation mirror.
When migrating a page, reproduce the source page with strict fidelity.

## Non-negotiable rules
1. Text must be exactly the same as the source page.
2. Images must be exactly the same as the source page (same semantic position and same section placement).
3. Layout must be the same as the source page (same visual structure and reading order).
4. Do not rewrite, summarize, improve, or paraphrase source content.
5. Do not "modernize" or redesign page sections unless explicitly requested.
6. Keep FR and EN versions aligned with their own source pages, not with each other.

## File and architecture constraints
1. Keep existing repository structure:
	- root pages in `/`
	- French pages in `/fr`
	- English pages in `/en`
2. Preserve shared sidebar architecture already implemented in the repo.
3. Keep script loading pattern used by the project (sidebar shell and dynamic dependencies).
4. Reuse local assets under `/assets/images` whenever they match the source content.

## Layout constraints (mandatory)
1. Use a fixed and centered content layout for the right-side page content area.
2. Keep the same centered reading column behavior across all pages (FR and EN).
3. Do not switch to full-width content unless the source page is explicitly full-width.
4. Keep image and section alignment consistent with the centered layout.
5. Do not introduce page-specific layout deviations unless the source page requires them.

## Exact fixed-size rule (must match CSS)
1. Right content column width must be constrained to: `width: min(100%, 980px)`.
2. Right content column must be centered with: `margin-left: auto; margin-right: auto;`.
3. Section containers must stay centered with: `margin: 0 auto;`.
4. Hero section must follow the same centering behavior as other sections.
5. Figures inside sections must remain within container width: `.visual { width: 100%; margin-left: 0; }`.
6. Images inside figures must not be force-upscaled. Keep intrinsic size and only shrink when needed: `.visual img { width: auto; max-width: 100%; height: auto; }`.
7. Do not use CSS rules that force image enlargement (for example `width: 100%` on all figure images) unless the source page explicitly shows stretched/full-width media.

## Info / Error callouts (must match source semantics)
1. When the source page shows an information or warning block (icon + highlighted note), do not keep it as a plain paragraph.
2. Render these notes with callout classes in HTML:
	- Information note: `<p class="callout info">...</p>`
	- Warning or danger note: `<p class="callout error">...</p>`
3. Keep the exact source wording inside the callout (no paraphrase).
4. Use the shared callout styles from `assets/css/callouts.css` via the global stylesheet import chain.
5. For warning blocks, preserve the visual danger marker used in the project (`⚠️` via `.callout.error::before`).

## Standard migration workflow (one page at a time)
1. Identify source page URL and target local file.
2. Extract source page data:
	- page title
	- meta description
	- exact headings and paragraph text
	- image references and section order
3. Open the target local file and compare section-by-section.
4. Update content with exact source wording.
5. Update image placement so sections match the source reading flow.
6. Keep links internal to local docs where applicable.
7. Validate resulting HTML for errors.
8. Run a post-check to ensure no placeholder migration text remains.

## Prohibited during migration
1. Introducing alternate copy not present in source.
2. Changing section order.
3. Omitting source sections present on the page.
4. Moving images to a different semantic section than source.
5. Using temporary placeholder text.

## Fidelity checklist before closing a page
1. Title matches source.
2. Meta description matches source.
3. Headings match source.
4. Body text matches source character-by-character as available.
5. Images are present and vertically/structurally placed like source.
6. No placeholders remain.
7. No editor errors on modified files.

## Reporting format for each migrated page
1. Source URL
2. Target file
3. Sections updated
4. Images aligned
5. Validation status (errors + placeholder check)

