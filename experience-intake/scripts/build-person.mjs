#!/usr/bin/env node
// Turns a small "draft" JSON (Claude's semantic mapping of someone's
// freeform AI-usage story onto the tracker's individualAreas catalog) into
// a complete individual record in the exact shape the AI Journey Tracker
// app expects (see app/src/composables/useJourneyStore.js: emptyIndividual
// / mergeIntoState). The result can be dropped straight into an
// individuals[] array, or piped into merge-export.mjs.
//
// Usage:
//   node experience-intake/scripts/build-person.mjs --draft draft.json [--out person.json]
//
// Draft shape (see experience-intake/examples/draft-example.json):
// {
//   "name": "Jane Doe",
//   "role": "", "team": "", "subgroup": "dev",
//   "roleFlags": { "knowledgeWorker": true, "developer": true },
//   "tools": [], "clients": [], "highlightStory": "",
//   "items": [ { "id": "code-autocomplete", "on": true, "details": "..." } ],
//   "customItems": [ { "group": "developer", "label": "...", "on": true, "details": "..." } ]
// }

import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(here, '..', '..')
const catalogDir = path.join(root, 'experience-intake', 'catalog')

// Mirrors app/src/data/subgroups.js. Small and stable enough to inline;
// re-check against that file if this script starts rejecting valid input.
const SUBGROUP_IDS = ['test', 'dev', 'other']

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

function slugify(label) {
  return (
    'custom-' +
    label
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60)
  )
}

function makeId(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`
}

async function loadCatalog() {
  const [individualRaw] = await Promise.all([readFile(path.join(catalogDir, 'individual-areas.json'), 'utf8')])
  const individual = JSON.parse(individualRaw)
  const itemsById = new Map()
  const groupIds = new Set()
  for (const group of individual.groups) {
    groupIds.add(group.id)
    for (const item of group.items) {
      itemsById.set(item.id, { ...item, groupId: group.id })
    }
  }
  return { individual, itemsById, groupIds }
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  if (!args.draft) {
    console.error('Usage: node build-person.mjs --draft <draft.json> [--out <person.json>]')
    process.exit(1)
  }

  const { itemsById, groupIds } = await loadCatalog()
  const draft = JSON.parse(await readFile(args.draft, 'utf8'))

  const errors = []
  const items = Array.isArray(draft.items) ? draft.items : []
  for (const it of items) {
    if (!itemsById.has(it.id)) {
      errors.push(`Unknown catalog item id "${it.id}" — not in individual-areas.json. Move it to customItems instead.`)
    }
  }
  const customItems = Array.isArray(draft.customItems) ? draft.customItems : []
  for (const ci of customItems) {
    if (!groupIds.has(ci.group)) {
      errors.push(`Unknown group "${ci.group}" for custom item "${ci.label}" — expected one of: ${[...groupIds].join(', ')}`)
    }
  }
  if (draft.subgroup && !SUBGROUP_IDS.includes(draft.subgroup)) {
    errors.push(`Unknown subgroup "${draft.subgroup}" — expected one of: ${SUBGROUP_IDS.join(', ')}`)
  }
  if (errors.length) {
    console.error('build-person: draft failed validation:\n' + errors.map((e) => `  - ${e}`).join('\n'))
    process.exit(1)
  }

  // Start every canonical item at { on: false, details: '' }, matching a
  // freshly-added person in the app, then overlay what the draft reported.
  const values = {}
  for (const id of itemsById.keys()) {
    values[id] = { on: false, details: '' }
  }
  for (const it of items) {
    values[it.id] = { on: !!it.on, details: it.details || '' }
  }

  const customItemsByGroup = {}
  const usedCustomIds = new Set()
  for (const ci of customItems) {
    let id = slugify(ci.label)
    let suffix = 2
    while (usedCustomIds.has(id)) {
      id = `${slugify(ci.label)}-${suffix++}`
    }
    usedCustomIds.add(id)
    if (!customItemsByGroup[ci.group]) customItemsByGroup[ci.group] = []
    customItemsByGroup[ci.group].push({ id, label: ci.label })
    values[id] = { on: ci.on !== false, details: ci.details || '' }
  }

  const person = {
    id: makeId('ind'),
    name: draft.name || '',
    role: draft.role || '',
    team: draft.team || '',
    badges: [],
    roleFlags: {
      knowledgeWorker: !!draft.roleFlags?.knowledgeWorker,
      developer: !!draft.roleFlags?.developer,
    },
    subgroup: draft.subgroup && SUBGROUP_IDS.includes(draft.subgroup) ? draft.subgroup : 'other',
    tools: Array.isArray(draft.tools) ? draft.tools : [],
    highlightStory: draft.highlightStory || '',
    clients: Array.isArray(draft.clients) ? draft.clients : [],
    attention: {},
    values,
    customItems: customItemsByGroup,
  }

  const onCount = items.filter((it) => it.on).length
  const totalCatalog = itemsById.size
  console.error(
    `build-person: ${person.name || '(unnamed)'} — ${onCount}/${totalCatalog} catalog items on, ${customItems.length} custom item(s).`,
  )

  const json = JSON.stringify(person, null, 2) + '\n'
  if (args.out) {
    await writeFile(args.out, json, 'utf8')
    console.error(`Wrote ${args.out}`)
  } else {
    process.stdout.write(json)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
