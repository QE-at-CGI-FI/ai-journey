---
name: experience-mapper
description: Map a person's freeform description of how they use AI onto the AI Journey Tracker's individual growth-area checklist (app/src/data/individualAreas.js), producing a ready-to-import individual record. Use when the user pastes or provides freeform text describing someone's (possibly their own) experiences using AI and wants it turned into tracker data — e.g. "map this person's AI experiences", "turn this into tracker data", "add this person to the journey tracker from this description", or when they hand over a written self-assessment / interview transcript about AI use.
---

# Experience mapper

Takes one person's freeform story about how they use AI and maps it onto the
AI Journey Tracker's fixed checklist of growth-area items
(`app/src/data/individualAreas.js`), producing a complete individual record
that can be imported into the app. The tooling lives in `experience-intake/`
at the repo root, kept separate from `app/`. Read `experience-intake/README.md`
once if you haven't used this skill in the current session — it explains the
draft → person → export pipeline the scripts implement.

## The core judgment call

The scripts handle shape and bookkeeping; the mapping itself is yours to do
carefully. Two failure modes to avoid:

- **Under-coverage**: skimming the text once and only catching the two or
  three most obvious matches. Go through the *catalog*, not just the text —
  for every one of the ~29 items, ask "does anything in this story provide
  real evidence for or against this?" A story that never mentions MCPs
  doesn't mean "off, unknown" and "off, they explicitly said they haven't"
  are the same thing to the data, but noticing the difference is how you
  catch near-misses (e.g. "he assigns tickets to Copilot's coding agent
  overnight" is `dark-factory`, not just `reactive-agentic`, even though it
  wasn't phrased as a checklist item).
- **Fabrication**: inventing detail language or marking `on: true` on a
  charitable reading of something the person didn't actually describe. Only
  mark an item `on` when the text gives concrete evidence — a described
  action or habit, not a vague adjacent mention. When genuinely unsure,
  leave it `off` and consider adding a short note in the item's `details`
  field only if you did mark it on; don't editorialize on items you left
  off.

Every experience that's real and clearly described but doesn't fit any
catalog item becomes a **custom item** instead of being stretched onto the
nearest catalog id or silently dropped.

## Steps

1. **Make sure the catalog is current.** Run once per session (cheap, keeps
   the catalog from drifting if `individualAreas.js` was edited):
   ```
   node experience-intake/scripts/extract-catalog.mjs
   ```
   Read `experience-intake/catalog/individual-areas.json` for the full list
   of group ids, item ids, labels, and explanations to map against.

2. **Get the freeform text and basic identity.** If the user hasn't given a
   name, or it's ambiguous whether this is a developer, a knowledge worker,
   or both (drives `roleFlags`, which drives which half of the checklist
   applies), ask — don't guess a role flag that changes what "full coverage"
   means. Everything else (role, team, tools, clients, subgroup) is optional
   and defaults empty/`"other"`; fill in what the text actually supports.

3. **Draft the mapping** as JSON matching
   `experience-intake/examples/draft-example.json`:
   ```json
   {
     "name": "...", "role": "", "team": "", "subgroup": "dev",
     "roleFlags": { "knowledgeWorker": true, "developer": true },
     "tools": [], "clients": [], "highlightStory": "",
     "items": [
       { "id": "code-autocomplete", "on": true, "details": "grounded in the text, first person about them, not a quote of the checklist label" }
     ],
     "customItems": [
       { "group": "developer", "label": "...", "on": true, "details": "..." }
     ]
   }
   ```
   Only include items you have a definite `on: true` or an explicit `off`
   worth noting in `items` — items left out entirely default to `off` with
   empty details, which is correct for anything the text is simply silent
   on. Write this draft to a file in your scratchpad directory (not into
   the repo).

4. **Build the full record:**
   ```
   node experience-intake/scripts/build-person.mjs --draft <draft.json> --out <person.json>
   ```
   This validates every id against the catalog (it will error on typos or
   invented ids — fix the draft and rerun) and expands it to the app's full
   individual shape. Check the stderr coverage line
   (`N/29 catalog items on, M custom item(s)`) against your own sense of how
   much the story actually covered.

5. **Log coverage:**
   ```
   node experience-intake/scripts/log-coverage.mjs --person <person.json>
   ```
   Appends one row to the Markdown table in `experience-intake/coverage-log.md`
   recording this person's knowledge-worker, developer, and combined
   coverage, each as `on/total` and a percentage against the fixed catalog
   (custom items don't count toward the denominator). Run this once per
   person, every time — it's the running record of who's been analyzed and
   how complete their mapping is.

6. **Show the user what got mapped** before writing anything else into the
   repo: a short summary of which items landed on, which custom items you
   added and why, the coverage line just logged, and anything you were
   unsure about. This is the point to catch a bad mapping cheaply.

7. **Merge or hand off**, per the user's intent:
   - If they want it added to one of the `ai-journey-tracker-*.json` export
     files at the repo root, confirm which file and whether an existing
     same-name person should be replaced, then:
     ```
     node experience-intake/scripts/merge-export.mjs --person <person.json> --export <file.json> --out <file.json> [--update]
     ```
     Only pass `--out <file.json>` (overwriting in place) once the user has
     confirmed — without `--out` the script writes `<file.json>.merged.json`
     alongside it, which is the safer default to show them first.
   - If they just want the standalone record (e.g. to paste into a new
     export or hand to someone else), give them `<person.json>` as-is — it's
     already valid to drop into an `individuals[]` array.

## Scope

This skill maps **individual** growth-area experiences only (the Individual
tab / `individualAreas.js`). `experience-intake/catalog/org-enablers.json`
also exists (organization-level foundational enablers), generated by the
same `extract-catalog.mjs`, but mapping a freeform description onto that
catalog is a different, not-yet-built workflow — don't repurpose this one
for organization-level claims without checking with the user first.
