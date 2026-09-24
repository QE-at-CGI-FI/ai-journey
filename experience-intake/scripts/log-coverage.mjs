#!/usr/bin/env node
// Appends one row per analyzed person to a Markdown coverage table,
// recording how much of the individualAreas catalog their mapped record
// covers — split by knowledge-worker / developer group, plus the combined
// total, each shown as on/total and a percentage. Meant to run right after
// build-person.mjs, once per person, so the table accumulates across an
// intake session (or across many sessions — it only appends rows).
//
// Coverage counts canonical catalog items only ("out of the listed
// experiences"); custom items added for a person aren't part of the fixed
// denominator and are excluded.
//
// Usage:
//   node experience-intake/scripts/log-coverage.mjs --person person.json [--log experience-intake/coverage-log.md]

import { readFile, writeFile, appendFile, access } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(here, '..', '..')
const catalogDir = path.join(root, 'experience-intake', 'catalog')
const defaultLogPath = path.join(root, 'experience-intake', 'coverage-log.md')

const SKELETON =
  '# Experience coverage log\n\n' +
  'One row per person mapped by the `experience-mapper` skill — coverage against the fixed `individualAreas.js` catalog (custom items excluded from the denominator).\n\n' +
  '| Date | Name | Knowledge worker | Developer | Total |\n' +
  '| --- | --- | --- | --- | --- |\n'

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

function mdCell(value) {
  return String(value).replace(/\|/g, '\\|').replace(/\r?\n/g, ' ').trim()
}

function pct(on, total) {
  return total ? ((on / total) * 100).toFixed(1) : '0.0'
}

async function fileExists(p) {
  try {
    await access(p)
    return true
  } catch {
    return false
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  if (!args.person) {
    console.error('Usage: node log-coverage.mjs --person <person.json> [--log <coverage-log.md>]')
    process.exit(1)
  }

  const catalog = JSON.parse(await readFile(path.join(catalogDir, 'individual-areas.json'), 'utf8'))
  const person = JSON.parse(await readFile(args.person, 'utf8'))
  const values = person.values || {}

  const counts = {}
  let totalOn = 0
  let totalAll = 0
  for (const group of catalog.groups) {
    const on = group.items.filter((item) => values[item.id]?.on === true).length
    const total = group.items.length
    counts[group.id] = { on, total }
    totalOn += on
    totalAll += total
  }

  const kw = counts['knowledge-worker'] || { on: 0, total: 0 }
  const dev = counts['developer'] || { on: 0, total: 0 }
  const kwPct = pct(kw.on, kw.total)
  const devPct = pct(dev.on, dev.total)
  const totalPct = pct(totalOn, totalAll)

  const logPath = args.log || defaultLogPath
  if (!(await fileExists(logPath))) await writeFile(logPath, SKELETON, 'utf8')

  const row = `| ${mdCell(new Date().toISOString().slice(0, 10))} | ${mdCell(person.name || '(unnamed)')} | ${kw.on}/${kw.total} (${kwPct}%) | ${dev.on}/${dev.total} (${devPct}%) | ${totalOn}/${totalAll} (${totalPct}%) |\n`

  await appendFile(logPath, row, 'utf8')
  console.error(
    `log-coverage: ${person.name || '(unnamed)'} — knowledge-worker ${kw.on}/${kw.total} (${kwPct}%), developer ${dev.on}/${dev.total} (${devPct}%), total ${totalOn}/${totalAll} (${totalPct}%). Appended to ${logPath}`,
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
