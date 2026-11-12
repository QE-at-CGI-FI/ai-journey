#!/usr/bin/env node
// Combines the individuals[] of several tracker export files into one
// export, so everyone can be viewed together in the app. Matches the shape
// the app's Import button reads (see app/src/composables/useJourneyStore.js:
// importData).
//
// Usage:
//   node experience-intake/scripts/combine-exports.mjs --out combined.json [--intake-log coverage-log.md] a.json b.json ...
//
// People are matched by name (case-insensitive). When the same person
// appears in more than one export, the later file on the command line wins,
// but keeps the id from the first so it stays stable. Anyone named in the
// coverage log (default: experience-intake/coverage-log.md) is marked
// intakeAssessed, so records mapped before that flag existed still get their
// star. Organization-level buckets are left empty: they describe one
// organization each and don't combine meaningfully.

import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const STORAGE_VERSION = 6

const here = path.dirname(fileURLToPath(import.meta.url))
const defaultIntakeLog = path.resolve(here, '..', 'coverage-log.md')

function parseArgs(argv) {
  const args = { files: [] }
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      const key = argv[i].slice(2)
      const value = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true
      args[key] = value
    } else {
      args.files.push(argv[i])
    }
  }
  return args
}

const nameKey = (n) => (n || '').trim().toLowerCase()

// Names from the "| Date | Name | ..." table rows log-coverage.mjs appends.
async function intakeNames(logPath) {
  let text
  try {
    text = await readFile(logPath, 'utf8')
  } catch (err) {
    if (err.code === 'ENOENT') return new Set()
    throw err
  }
  const names = new Set()
  for (const line of text.split('\n')) {
    const cells = line.split('|').map((c) => c.trim())
    if (/^\d{4}-\d{2}-\d{2}$/.test(cells[1] || '')) names.add(nameKey(cells[2]))
  }
  return names
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  if (!args.out || args.files.length === 0) {
    console.error('Usage: node combine-exports.mjs --out <combined.json> [--intake-log <coverage-log.md>] <export.json>...')
    process.exit(1)
  }

  const assessed = await intakeNames(args['intake-log'] || defaultIntakeLog)
  const byName = new Map()
  for (const file of args.files) {
    const data = JSON.parse(await readFile(file, 'utf8'))
    for (const ind of data.individuals || []) {
      const key = nameKey(ind.name)
      const prev = byName.get(key)
      byName.set(key, prev ? { ...ind, id: prev.id } : ind)
      console.error(`combine-exports: ${prev ? 'replaced' : 'added'} "${ind.name}" from ${path.basename(file)}`)
    }
  }

  const individuals = [...byName.values()].map((ind) => ({
    ...ind,
    intakeAssessed: !!ind.intakeAssessed || assessed.has(nameKey(ind.name)),
  }))

  const combined = {
    version: STORAGE_VERSION,
    organization: { name: 'Combined', useCase: '', values: {}, customItems: {} },
    learningCulture: { values: {}, customItems: {} },
    value: { values: {}, customItems: {} },
    individuals,
    actions: [],
  }

  await writeFile(args.out, JSON.stringify(combined, null, 2) + '\n', 'utf8')
  const starred = individuals.filter((i) => i.intakeAssessed).length
  console.error(`Wrote ${args.out} — ${individuals.length} people, ${starred} with an intake assessment.`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
