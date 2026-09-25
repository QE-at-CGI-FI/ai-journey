# Experience intake

Turns someone's freeform description of how they use AI ("I ask someone to
describe their experiences...") into a structured individual record for the
AI Journey Tracker app (`../app`), matching the growth-area checklist in
`app/src/data/individualAreas.js`.

This folder is deliberately separate from `app/` — it's an offline authoring
pipeline, not part of the shipped app. The actual mapping step (splitting a
story into individual experiences and matching them to catalog items) is a
semantic task done by Claude, described in the project skill at
`.claude/skills/experience-mapper/SKILL.md`. The scripts here handle the
parts that should be deterministic: keeping the catalog in sync with the
app, validating and normalizing Claude's mapping into the app's exact JSON
shape, and merging the result into an export file.

## Pipeline

```
freeform text
     │  (Claude reads it, checks it against the catalog for full coverage)
     ▼
draft.json            — { name, roleFlags, items: [{id, on, details}], customItems: [...] }
     │  node scripts/build-person.mjs
     ▼
person.json            — a complete individual record, ready for `individuals[]`
     │  node scripts/log-coverage.mjs ────────► coverage-log.md (one appended table row per person)
     │  (Claude picks 3 missing items) ───────► recommendations/<name-slug>.md
     │  node scripts/merge-export.mjs (optional)
     ▼
tracker-export.json    — importable via the app's Import button
```

## Folder contents

- `intake-prompt.md` — the ask to send a colleague to get their freeform
  text in the first place: write about their AI use in a bragging,
  back-to-school-essay style, any format, AI-assisted drafting allowed.
- `catalog/` — generated JSON snapshots of the app's own checklists
  (`individual-areas.json`, `org-enablers.json`). Regenerate with
  `scripts/extract-catalog.mjs` whenever the source `.js` files change —
  never hand-edit these.
- `scripts/extract-catalog.mjs` — reads `app/src/data/individualAreas.js`
  and `orgEnablers.js` and writes the JSON catalog.
- `scripts/build-person.mjs` — validates a draft mapping against the
  catalog and expands it into a full individual record (all canonical items
  present, custom items assigned stable ids).
- `scripts/log-coverage.mjs` — appends one row per analyzed person to the
  Markdown table in `coverage-log.md`: knowledge-worker coverage, developer
  coverage, and the combined total, each shown as `on/total` and a
  percentage, out of the fixed catalog (custom items aren't counted; they're
  not part of the denominator). Run once per person, right after
  `build-person.mjs`. `coverage-log.md` accumulates across every intake
  session run from this checkout; `examples/coverage-log-example.md` shows
  the shape without touching the real log.
- `recommendations/` — one Markdown file per mapped person
  (`<name-slug>.md`), written by Claude (not a script — picking which three
  missing items to suggest and what gaining them could look like is a
  semantic judgment call). Not an accumulating log like `coverage-log.md`;
  re-mapping a person overwrites their file in place.
- `scripts/merge-export.mjs` — folds a person record into a tracker export
  file (one of the `ai-journey-tracker-*.json` files at the repo root), or
  starts a fresh one. Never overwrites the source export unless you pass
  `--out` pointing at it explicitly, and refuses to replace an
  already-present person unless you pass `--update`.
- `examples/` — worked examples to check the pipeline against, or to show
  the shape expected at each stage:
  - `freeform-example.txt` → `draft-example.json` → `person-example.json` —
    a light, partial mapping (a few items on, most left at their default
    off).
  - `maaret-freeform-example.txt` → `maaret-draft-example.json` →
    `maaret-person-example.json` — a fuller, high-coverage mapping built
    from Maaret Pyhäjärvi's own notes in
    `ai-journey-tracker-bcs-2026-09-24.json` (24/29 items on, spanning both
    groups, no custom items needed — everything she described already had a
    matching catalog item). Rebuilding it from the freeform text reproduces
    her real record exactly, which is what makes it a good regression check
    for `build-person.mjs`.

## Running it by hand

```sh
node experience-intake/scripts/extract-catalog.mjs

node experience-intake/scripts/build-person.mjs \
  --draft experience-intake/examples/draft-example.json \
  --out /tmp/person.json

node experience-intake/scripts/log-coverage.mjs \
  --person /tmp/person.json
  # appends one table row to experience-intake/coverage-log.md

node experience-intake/scripts/merge-export.mjs \
  --person /tmp/person.json \
  --export ai-journey-tracker-bcs-developers-2026-08-27.json
  # writes ai-journey-tracker-bcs-developers-2026-08-27.json.merged.json
  # add --out <path> to control where it lands, --update to replace
  # an existing person with the same name
```

In normal use you won't run these by hand — ask Claude (via the
`experience-mapper` skill) to map someone's story, and it drives this
pipeline for you.
