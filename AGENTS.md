# Copilot Instructions - Zyllio Docs Migration

## Objective
This repository contains a local documentation mirror.
When migrating a page, reproduce the source page with strict fidelity.

## Source documentation URLs
1. French source: `https://docs.zyllio.com/`
2. English source: `https://docs-en.zyllio.com/`

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
2. Right content column must be centered with: `margin-left: auto; margin-right: auto;`
3. Section containers must stay centered with: `margin: 0 auto;`
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
6. For information blocks, preserve the project visual marker (blue info badge from `.callout.info::before`) and blue information styling.

## Prompt example blocks (new section type)
1. When the source page shows a list of standalone example prompts as visually separated quote-like blocks, do not keep them as plain paragraphs.
2. Render each prompt with the dedicated class: `<blockquote class="prompt-block"><p>...</p></blockquote>`.
3. Keep exact source wording, punctuation, and line breaks semantics inside each prompt block (no paraphrase).
4. Preserve a visible left border for this block type through shared CSS in `assets/css/content.css`.
5. Use this section type only when the source explicitly presents this quote-like visual grouping.

## Tables (mandatory fidelity)
1. When the source page contains a table, reproduce that table in the migrated page.
2. Keep the exact table structure: same headers, same row order, same column order, and same wording.
3. Do not replace source tables with plain paragraphs, bullet lists, or generic summary text.
4. Keep the table at the same semantic position in the section flow (for example right after "Les paramètres suivants sont requis.").
5. If the source table text cannot be extracted reliably from available tools, do not invent values.
6. In that case, keep the source visual/table image in the same position and report the table as "needs manual extraction" in the migration report.

### How to process tables (required workflow)
1. Locate each source table in reading order and note the exact section where it appears.
2. Extract all table headers first, then all rows in the same order.
3. Build the HTML table with semantic tags (`table`, `thead`, `tbody`, `th`, `td`) and keep wording exactly as source.
4. Insert the table exactly where it appears in source flow (usually after the lead sentence introducing parameters).
5. Keep the corresponding source image/screenshot if it exists; the table does not replace unrelated visuals.
6. Validate parity after insertion: header count, row count, column order, and wording must match source.

### Table HTML template
```html
<table class="doc-table">
	<thead>
		<tr>
			<th>Header 1</th>
			<th>Header 2</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>Row 1 Col 1</td>
			<td>Row 1 Col 2</td>
		</tr>
	</tbody>
</table>
```

### Extraction fallback rule
1. If OCR/web extraction is ambiguous for one or more cells, do not guess.
2. Keep the source table image in place.
3. Mark the page report with: `Table needs manual extraction` and specify the section title.

### Segmented PNG capture workflow (required for visual audit)
1. Before migrating a page, capture the source page in vertical PNG segments from top to bottom.
2. Use a consistent overlap between consecutive segments (recommended 15% to 25%) to avoid missing content between cuts.
3. Name captures in reading order, for example: `segment-01.png`, `segment-02.png`, `segment-03.png`.
4. Include full width of the source content column in each capture.
5. Review all segments in order and list every table, callout, heading block, and image position before editing the local page.
6. If a table is visible in segments but text cannot be extracted reliably, apply the fallback rule and report the section as `Table needs manual extraction`.
7. Repeat the same segmented capture process independently for FR source pages and EN source pages.

## Standard migration workflow (one page at a time)
1. Identify source page URL and target local file.
2. Extract source page data:
	- page title
	- meta description
	- exact headings and paragraph text
	- exact tables (headers + rows + order)
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
5. Tables match source structure and wording.
6. Images are present and vertically/structurally placed like source.
7. No placeholders remain.
8. No editor errors on modified files.

## Reporting format for each migrated page
1. Source URL
2. Target file
3. Sections updated
4. Images aligned
5. Validation status (errors + placeholder check)
