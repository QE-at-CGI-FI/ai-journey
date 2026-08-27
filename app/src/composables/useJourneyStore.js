import { reactive, watch } from 'vue'
import { orgEnablerGroups } from '../data/orgEnablers.js'
import { learningCultureItemGroups } from '../data/learningCultureItems.js'
import { individualAreaGroups } from '../data/individualAreas.js'
import { valueItemGroups } from '../data/valueItems.js'
import { badgeTiers } from '../data/badgeTiers.js'
import { attentionItems } from '../data/attentionItems.js'
import { subgroups } from '../data/subgroups.js'

const STORAGE_KEY = 'cgi-ai-journey-tracker'
const STORAGE_VERSION = 5

function blankValue() {
  return { on: false, details: '' }
}

function emptyBucket() {
  return {
    values: {}, // itemId -> { on, details }
    customItems: {}, // groupId -> [{ id, label }]
  }
}

function emptyIndividual() {
  return {
    id: '',
    name: '',
    role: '',
    team: '',
    badges: [],
    // Which growth-area groups (data/individualAreas.js) apply to this
    // person — drives which items they're tracked against and the coverage
    // denominator used for their progress.
    roleFlags: { knowledgeWorker: false, developer: false },
    // Discipline classification — one of data/subgroups.js's ids, or null
    // when unclassified.
    subgroup: null,
    // Free-form list of AI tool names this person actively uses — a mix of
    // ticks from data/toolGroups.js and any custom names typed in.
    tools: [],
    // Free-form write-up of the best AI work this person has been doing.
    highlightStory: '',
    // Free-form list of client names this person has done AI work for/with.
    clients: [],
    // itemId (data/attentionItems.js) -> boolean — "needs action" flags.
    attention: {},
    ...emptyBucket(),
  }
}

function emptyState() {
  return {
    version: STORAGE_VERSION,
    organization: { name: '', useCase: '', ...emptyBucket() },
    learningCulture: { ...emptyBucket() },
    value: { ...emptyBucket() },
    individuals: [],
    actions: [],
  }
}

function makeId(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`
}

function load() {
  const state = emptyState()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return state
    const parsed = JSON.parse(raw)
    return mergeIntoState(state, parsed)
  } catch (err) {
    console.warn('Could not read saved AI journey data, starting fresh.', err)
    return state
  }
}

function mergeBucket(base, incoming) {
  if (!incoming) return base
  base.values = { ...base.values, ...(incoming.values || {}) }
  base.customItems = incoming.customItems || {}
  return base
}

// Merge a (possibly partial / older-version) saved payload into a fresh
// default state, so new default enablers introduced later still show up.
function mergeIntoState(base, incoming) {
  if (!incoming || typeof incoming !== 'object') return base

  if (incoming.organization) {
    base.organization.name = incoming.organization.name || ''
    base.organization.useCase = incoming.organization.useCase || ''
    mergeBucket(base.organization, incoming.organization)
  }

  mergeBucket(base.learningCulture, incoming.learningCulture)
  mergeBucket(base.value, incoming.value)

  if (Array.isArray(incoming.individuals)) {
    base.individuals = incoming.individuals.map((ind) => {
      const fresh = emptyIndividual()
      fresh.id = ind.id || makeId('ind')
      fresh.name = ind.name || ''
      fresh.role = ind.role || ''
      fresh.team = ind.team || ''
      fresh.badges = Array.isArray(ind.badges) ? [...ind.badges] : []
      fresh.roleFlags = {
        knowledgeWorker: !!ind.roleFlags?.knowledgeWorker,
        developer: !!ind.roleFlags?.developer,
      }
      fresh.subgroup = subgroups.some((sg) => sg.id === ind.subgroup) ? ind.subgroup : null
      fresh.tools = Array.isArray(ind.tools) ? [...ind.tools] : []
      fresh.highlightStory = ind.highlightStory || ''
      fresh.clients = Array.isArray(ind.clients) ? [...ind.clients] : []
      fresh.attention = ind.attention && typeof ind.attention === 'object' ? { ...ind.attention } : {}
      mergeBucket(fresh, ind)
      return fresh
    })
  } else if (incoming.individual && (incoming.individual.profile?.name || Object.keys(incoming.individual.values || {}).length)) {
    // Migrate the old single-individual (v1) shape into the roster.
    const fresh = emptyIndividual()
    fresh.id = makeId('ind')
    fresh.name = incoming.individual.profile?.name || ''
    fresh.role = incoming.individual.profile?.role || ''
    fresh.team = incoming.individual.profile?.team || ''
    mergeBucket(fresh, incoming.individual)
    base.individuals = [fresh]
  }

  if (Array.isArray(incoming.actions)) {
    base.actions = incoming.actions.map((a) => ({
      id: a.id || makeId('action'),
      title: a.title || '',
      description: a.description || '',
      timeline: a.timeline || '',
    }))
  }

  return base
}

export function useJourneyStore() {
  const state = reactive(load())

  // Display-only UI state — never persisted, never affects saved data or the
  // printed report. Defaults to anonymized so a fresh load is safe to share.
  const ui = reactive({ anonymized: true })

  function displayIndividualName(individual) {
    if (!ui.anonymized) return individual.name || 'Unnamed'
    const idx = state.individuals.findIndex((i) => i.id === individual.id)
    return `Person ${idx + 1}`
  }

  watch(
    state,
    () => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
      } catch (err) {
        console.error('Failed to save AI journey data to local storage.', err)
      }
    },
    { deep: true },
  )

  function valueFor(bucket, itemId) {
    if (!bucket.values[itemId]) {
      bucket.values[itemId] = blankValue()
    }
    return bucket.values[itemId]
  }

  function toggleItem(bucket, itemId) {
    const v = valueFor(bucket, itemId)
    v.on = !v.on
  }

  function setDetails(bucket, itemId, text) {
    valueFor(bucket, itemId).details = text
  }

  function addCustomItem(bucket, groupId, label) {
    const trimmed = label.trim()
    if (!trimmed) return
    if (!bucket.customItems[groupId]) {
      bucket.customItems[groupId] = []
    }
    const id = makeId(`custom-${groupId}`)
    bucket.customItems[groupId].push({ id, label: trimmed })
  }

  function removeCustomItem(bucket, groupId, itemId) {
    const list = bucket.customItems[groupId]
    if (!list) return
    const idx = list.findIndex((i) => i.id === itemId)
    if (idx !== -1) list.splice(idx, 1)
    delete bucket.values[itemId]
  }

  function customItemsFor(bucket, groupId) {
    return bucket.customItems[groupId] || []
  }

  function groupProgress(bucket, group) {
    const items = [...group.items, ...customItemsFor(bucket, group.id)]
    if (items.length === 0) return { on: 0, total: 0 }
    const on = items.filter((i) => bucket.values[i.id]?.on).length
    return { on, total: items.length }
  }

  function overallProgress(bucket, groups) {
    let on = 0
    let total = 0
    for (const group of groups) {
      const p = groupProgress(bucket, group)
      on += p.on
      total += p.total
    }
    return { on, total }
  }

  // Which growth-area groups apply to a person: whatever role(s) they're
  // ticked as. Nobody ticked yet -> track everything, so a fresh person
  // still gets a full checklist instead of a 0/0 target.
  function groupsForIndividual(individual) {
    const flags = individual?.roleFlags || {}
    if (!flags.knowledgeWorker && !flags.developer) return individualAreaGroups
    return individualAreaGroups.filter(
      (g) =>
        (g.id === 'knowledge-worker' && flags.knowledgeWorker) ||
        (g.id === 'developer' && flags.developer),
    )
  }

  function individualExperiencePct(individual) {
    const progress = overallProgress(individual, groupsForIndividual(individual))
    return progress.total ? Math.round((progress.on / progress.total) * 100) : 0
  }

  function addIndividual(name) {
    const trimmed = name.trim()
    if (!trimmed) return null
    const individual = emptyIndividual()
    individual.id = makeId('ind')
    individual.name = trimmed
    state.individuals.push(individual)
    return individual.id
  }

  function removeIndividual(id) {
    const idx = state.individuals.findIndex((i) => i.id === id)
    if (idx !== -1) state.individuals.splice(idx, 1)
  }

  function reorderIndividual(fromIndex, toIndex) {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return
    if (fromIndex >= state.individuals.length || toIndex >= state.individuals.length) return
    const [moved] = state.individuals.splice(fromIndex, 1)
    state.individuals.splice(toIndex, 0, moved)
  }

  function awardBadge(individualId, badgeId) {
    const individual = state.individuals.find((i) => i.id === individualId)
    if (!individual) return
    if (!individual.badges.includes(badgeId)) individual.badges.push(badgeId)
  }

  function revokeBadge(individualId, badgeId) {
    const individual = state.individuals.find((i) => i.id === individualId)
    if (!individual) return
    const idx = individual.badges.indexOf(badgeId)
    if (idx !== -1) individual.badges.splice(idx, 1)
  }

  function setSubgroup(individual, subgroupId) {
    individual.subgroup = subgroupId || null
  }

  function subgroupLabel(individual) {
    return subgroups.find((sg) => sg.id === individual.subgroup)?.label || 'Unclassified'
  }

  function hasTool(individual, tool) {
    return individual.tools.includes(tool)
  }

  function toggleTool(individual, tool) {
    const idx = individual.tools.indexOf(tool)
    if (idx === -1) individual.tools.push(tool)
    else individual.tools.splice(idx, 1)
  }

  function addCustomTool(individual, name) {
    const trimmed = name.trim()
    if (!trimmed) return
    if (!individual.tools.includes(trimmed)) individual.tools.push(trimmed)
  }

  function setHighlightStory(individual, text) {
    individual.highlightStory = text
  }

  function addClient(individual, name) {
    const trimmed = name.trim()
    if (!trimmed) return
    if (!individual.clients.includes(trimmed)) individual.clients.push(trimmed)
  }

  function removeClient(individual, name) {
    const idx = individual.clients.indexOf(name)
    if (idx !== -1) individual.clients.splice(idx, 1)
  }

  function hasAttentionFlag(individual, itemId) {
    return !!individual.attention[itemId]
  }

  function toggleAttentionFlag(individual, itemId) {
    individual.attention[itemId] = !individual.attention[itemId]
  }

  function attentionCount(individual) {
    return attentionItems.filter((item) => individual.attention[item.id]).length
  }

  function addAction(title, description, timeline) {
    const trimmedTitle = title.trim()
    if (!trimmedTitle) return
    state.actions.push({
      id: makeId('action'),
      title: trimmedTitle,
      description: description.trim(),
      timeline: timeline.trim(),
    })
  }

  function removeAction(id) {
    const idx = state.actions.findIndex((a) => a.id === id)
    if (idx !== -1) state.actions.splice(idx, 1)
  }

  function reorderAction(fromIndex, toIndex) {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return
    if (fromIndex >= state.actions.length || toIndex >= state.actions.length) return
    const [moved] = state.actions.splice(fromIndex, 1)
    state.actions.splice(toIndex, 0, moved)
  }

  // How many of the tracked individuals have a given experience switched on.
  function itemCoverage(itemId) {
    const total = state.individuals.length
    const on = state.individuals.filter((ind) => ind.values[itemId]?.on).length
    return { on, total }
  }

  // "Someone" percentage: share of tracked items that are true for at least
  // one person/place in the org — an org-wide bucket (organization, learning
  // culture, value) counts an item once it's switched on; the individuals
  // roster counts an item once any one person has it.
  function someonePctBucket(bucket, groups) {
    const items = groups.flatMap((g) => [...g.items, ...customItemsFor(bucket, g.id)])
    if (!items.length) return 0
    const on = items.filter((i) => bucket.values[i.id]?.on).length
    return Math.round((on / items.length) * 100)
  }

  function someonePctIndividuals() {
    const items = individualAreaGroups.flatMap((g) => g.items)
    if (!items.length) return 0
    const on = items.filter((i) => itemCoverage(i.id).on > 0).length
    return Math.round((on / items.length) * 100)
  }

  function someonePctBadges() {
    if (!badgeTiers.length) return 0
    const on = badgeTiers.filter((t) => state.individuals.some((ind) => ind.badges.includes(t.id))).length
    return Math.round((on / badgeTiers.length) * 100)
  }

  function exportData() {
    const payload = JSON.stringify(
      { ...state, viewer: 'https://qe-at-cgi-fi.github.io/ai-journey/' },
      null,
      2,
    )
    const blob = new Blob([payload], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const stamp = new Date().toISOString().slice(0, 10)
    const orgSlug = state.organization.name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
    a.href = url
    a.download = orgSlug
      ? `ai-journey-tracker-${orgSlug}-${stamp}.json`
      : `ai-journey-tracker-${stamp}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  function importData(jsonText) {
    const parsed = JSON.parse(jsonText)
    const fresh = mergeIntoState(emptyState(), parsed)
    state.organization.name = fresh.organization.name
    state.organization.useCase = fresh.organization.useCase
    state.organization.values = fresh.organization.values
    state.organization.customItems = fresh.organization.customItems
    state.learningCulture.values = fresh.learningCulture.values
    state.learningCulture.customItems = fresh.learningCulture.customItems
    state.value.values = fresh.value.values
    state.value.customItems = fresh.value.customItems
    state.individuals = fresh.individuals
    state.actions = fresh.actions
  }

  function resetAll() {
    if (!confirm('Clear all locally saved AI-native journey data? This cannot be undone.')) return
    const fresh = emptyState()
    state.organization.name = fresh.organization.name
    state.organization.useCase = fresh.organization.useCase
    state.organization.values = fresh.organization.values
    state.organization.customItems = fresh.organization.customItems
    state.learningCulture.values = fresh.learningCulture.values
    state.learningCulture.customItems = fresh.learningCulture.customItems
    state.value.values = fresh.value.values
    state.value.customItems = fresh.value.customItems
    state.individuals = fresh.individuals
    state.actions = fresh.actions
  }

  return {
    state,
    ui,
    displayIndividualName,
    orgEnablerGroups,
    learningCultureItemGroups,
    individualAreaGroups,
    valueItemGroups,
    valueFor,
    toggleItem,
    setDetails,
    addCustomItem,
    removeCustomItem,
    customItemsFor,
    groupProgress,
    overallProgress,
    groupsForIndividual,
    individualExperiencePct,
    someonePctBucket,
    someonePctIndividuals,
    someonePctBadges,
    addIndividual,
    removeIndividual,
    reorderIndividual,
    awardBadge,
    revokeBadge,
    subgroups,
    setSubgroup,
    subgroupLabel,
    hasTool,
    toggleTool,
    addCustomTool,
    setHighlightStory,
    addClient,
    removeClient,
    attentionItems,
    hasAttentionFlag,
    toggleAttentionFlag,
    attentionCount,
    addAction,
    removeAction,
    reorderAction,
    itemCoverage,
    exportData,
    importData,
    resetAll,
  }
}
