#!/usr/bin/env node
// Regenerates experience-intake/catalog/*.json from the app's own data
// files, so the catalog Claude maps freeform text against can never drift
// from what the tracker actually renders. Re-run this whenever
// app/src/data/individualAreas.js or orgEnablers.js changes.
//
// Usage: node experience-intake/scripts/extract-catalog.mjs

import { writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(here, '..', '..')
const catalogDir = path.join(root, 'experience-intake', 'catalog')

async function extract(sourceRelPath, exportName, outFile) {
  const sourceAbsPath = path.join(root, sourceRelPath)
  const mod = await import(`file://${sourceAbsPath}`)
  const groups = mod[exportName]
  if (!Array.isArray(groups)) {
    throw new Error(`Expected "${exportName}" to be exported as an array from ${sourceRelPath}`)
  }

  const payload = {
    source: sourceRelPath,
    generatedAt: new Date().toISOString(),
    groups: groups.map((g) => ({
      id: g.id,
      title: g.title,
      items: g.items.map((item) => ({
        id: item.id,
        label: item.label,
        explanation: item.explanation || null,
      })),
    })),
  }

  const outPath = path.join(catalogDir, outFile)
  await writeFile(outPath, JSON.stringify(payload, null, 2) + '\n', 'utf8')
  const itemCount = payload.groups.reduce((n, g) => n + g.items.length, 0)
  console.log(`Wrote ${outPath} (${payload.groups.length} groups, ${itemCount} items)`)
}

await extract('app/src/data/individualAreas.js', 'individualAreaGroups', 'individual-areas.json')
await extract('app/src/data/orgEnablers.js', 'orgEnablerGroups', 'org-enablers.json')
