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

