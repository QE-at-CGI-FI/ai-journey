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
  for every item in the person's target set (see step 2 — all 29 for a
  developer, only the 12 knowledge-worker items for a knowledge worker), ask
  "does anything in this story provide real evidence for or against this?"
  A story that never mentions MCPs
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
   name, ask.

   The person's **profile** (`roleFlags`) sets their *target set* — which
   catalog items you're even trying to find evidence for — so if the user
   hasn't already told you which one this person is, ask before you start
   mapping:
   - **Developer**: all 29 items across both groups are valid targets.
     `roleFlags: { knowledgeWorker: true, developer: true }`.
   - **Knowledge worker**: only the 12 `knowledge-worker` group items are
     valid targets — don't sweep the 17 `developer` items looking for
     evidence, they're out of scope for this profile.
     `roleFlags: { knowledgeWorker: true, developer: false }`.

   Don't infer the profile from the text and don't default to "both" —
   guessing wrong changes what "full coverage" means for this person and
   silently miscounts them in the coverage log. Everything else (role,
   team, tools, clients, subgroup) is optional and defaults empty/`"other"`;
   fill in what the text actually supports.

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

6. **Write a recommendations file.** From the items in the person's target
   set that are still `off`, pick **three** — not mechanically the first
   three, use judgment about what's a natural next step from what they
   already do (e.g. don't recommend `dark-factory` before anything
   `reactive-agentic`-adjacent is on; prefer items adjacent to their
   existing tools/habits over a random gap across the catalog). For each of
   the three, write:
   - the item's label and its catalog explanation (from
     `experience-intake/catalog/individual-areas.json`), and
   - a concrete example of what gaining that experience could look like
     *for this person* — grounded in their actual tools, role, team, and
     story from the freeform text, not a generic restatement of the
     explanation. This is a forward-looking suggestion, so phrase it as a
     possibility ("could look like...", "one way to try this..."), never as
     something they've already done.

   Save it as `experience-intake/recommendations/<name-slug>.md` (kebab-case
   the person's name, e.g. `jane-doe.md`), with one `##` section per
   recommended item. This is a per-person deliverable, not an accumulating
   log like `coverage-log.md` — regenerate it in place if you re-map the
   same person later.

7. **Show the user what got mapped** before writing anything else into the
   repo: a short summary of which items landed on, which custom items you
   added and why, the coverage line just logged, the three recommendations,
   and anything you were unsure about. This is the point to catch a bad
   mapping cheaply.

8. **Merge or hand off**, per the user's intent:
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
