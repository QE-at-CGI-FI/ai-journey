#!/usr/bin/env node
// Folds one person record (from build-person.mjs) into a tracker export
// file — one of the ai-journey-tracker-*.json files at the repo root, or a
// fresh one if none is given. Matches the shape the app's Import button
// reads (see app/src/composables/useJourneyStore.js: importData).
//
// Usage:
//   node experience-intake/scripts/merge-export.mjs --person person.json [--export existing.json] [--out out.json] [--update]
//
// By default this never overwrites --export in place: without --out it
// writes "<export>.merged.json" next to it. Pass --out explicitly (e.g.
// the same path as --export) to overwrite. If a person with the same name
// already exists in the export, the script refuses to touch it unless
// --update is given, to avoid silently clobbering existing data.

import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const STORAGE_VERSION = 5

function parseArgs(argv) {
  const args = {}
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      const key = argv[i].slice(2)
      const value = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true
      args[key] = value
    }
  }
  return args
}

function emptyExport() {
  return {
    version: STORAGE_VERSION,
    organization: { name: '', useCase: '', values: {}, customItems: {} },
    learningCulture: { values: {}, customItems: {} },
    value: { values: {}, customItems: {} },
    individuals: [],
    actions: [],
  }
}

async function readJsonIfExists(filePath) {
  if (!filePath) return null
  try {
    return JSON.parse(await readFile(filePath, 'utf8'))
  } catch (err) {
    if (err.code === 'ENOENT') return null
    throw err
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  if (!args.person) {
    console.error('Usage: node merge-export.mjs --person <person.json> [--export <existing.json>] [--out <out.json>] [--update]')
    process.exit(1)
  }

  const person = JSON.parse(await readFile(args.person, 'utf8'))
  const existing = await readJsonIfExists(args.export)
  const target = existing && Array.isArray(existing.individuals) ? existing : emptyExport()

  const nameKey = (n) => (n || '').trim().toLowerCase()
  const idx = target.individuals.findIndex((ind) => nameKey(ind.name) === nameKey(person.name) && nameKey(person.name) !== '')

  if (idx !== -1 && !args.update) {
    console.error(
      `merge-export: "${person.name}" already exists in ${args.export || '(new export)'} — pass --update to replace their record, or rename one of them.`,
    )
    process.exit(1)
  }

  if (idx !== -1) {
    person.id = target.individuals[idx].id // keep the stable id
    target.individuals[idx] = person
    console.error(`merge-export: updated existing record for "${person.name}".`)
  } else {
    target.individuals.push(person)
    console.error(`merge-export: added new record for "${person.name}".`)
  }

  const outPath = args.out || (args.export ? `${args.export}.merged.json` : path.join(path.dirname(args.person), 'export.merged.json'))
  await writeFile(outPath, JSON.stringify(target, null, 2) + '\n', 'utf8')
  console.error(`Wrote ${outPath}`)
  if (!args.out && args.export) {
    console.error(`(left ${args.export} untouched — pass --out ${args.export} to overwrite it in place)`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
