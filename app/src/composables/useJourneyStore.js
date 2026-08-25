import { reactive, watch } from 'vue'
import { orgEnablerGroups } from '../data/orgEnablers.js'
import { individualAreaGroups } from '../data/individualAreas.js'

const STORAGE_KEY = 'cgi-ai-journey-tracker'
const STORAGE_VERSION = 1

function blankValue() {
  return { on: false, details: '' }
}

function emptyState() {
  return {
    version: STORAGE_VERSION,
    organization: {
      name: '',
      useCase: '',
      values: {}, // itemId -> { on, details }
      customItems: {}, // groupId -> [{ id, label }]
    },
    individual: {
      profile: { name: '', role: '', team: '' },
      values: {},
      customItems: {},
    },
  }
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

// Merge a (possibly partial / older-version) saved payload into a fresh
// default state, so new default enablers introduced later still show up.
function mergeIntoState(base, incoming) {
  if (!incoming || typeof incoming !== 'object') return base
  if (incoming.organization) {
    base.organization.name = incoming.organization.name || ''
    base.organization.useCase = incoming.organization.useCase || ''
    base.organization.values = { ...base.organization.values, ...(incoming.organization.values || {}) }
    base.organization.customItems = incoming.organization.customItems || {}
  }
  if (incoming.individual) {
    base.individual.profile = { ...base.individual.profile, ...(incoming.individual.profile || {}) }
    base.individual.values = { ...base.individual.values, ...(incoming.individual.values || {}) }
    base.individual.customItems = incoming.individual.customItems || {}
  }
  return base
}

export function useJourneyStore() {
  const state = reactive(load())

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

  function valueFor(section, itemId) {
    if (!state[section].values[itemId]) {
      state[section].values[itemId] = blankValue()
    }
    return state[section].values[itemId]
  }

  function toggleItem(section, itemId) {
    const v = valueFor(section, itemId)
    v.on = !v.on
  }

  function setDetails(section, itemId, text) {
    valueFor(section, itemId).details = text
  }

  function addCustomItem(section, groupId, label) {
    const trimmed = label.trim()
    if (!trimmed) return
    if (!state[section].customItems[groupId]) {
      state[section].customItems[groupId] = []
    }
    const id = `custom-${groupId}-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    state[section].customItems[groupId].push({ id, label: trimmed })
  }

  function removeCustomItem(section, groupId, itemId) {
    const list = state[section].customItems[groupId]
    if (!list) return
    const idx = list.findIndex((i) => i.id === itemId)
    if (idx !== -1) list.splice(idx, 1)
    delete state[section].values[itemId]
  }

  function customItemsFor(section, groupId) {
    return state[section].customItems[groupId] || []
  }

  function groupProgress(section, group) {
    const items = [...group.items, ...customItemsFor(section, group.id)]
    if (items.length === 0) return { on: 0, total: 0 }
    const on = items.filter((i) => state[section].values[i.id]?.on).length
    return { on, total: items.length }
  }

  function overallProgress(section, groups) {
    let on = 0
    let total = 0
    for (const group of groups) {
      const p = groupProgress(section, group)
      on += p.on
      total += p.total
    }
    return { on, total }
  }

  function exportData() {
    const payload = JSON.stringify(state, null, 2)
    const blob = new Blob([payload], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const stamp = new Date().toISOString().slice(0, 10)
    a.href = url
    a.download = `ai-journey-tracker-${stamp}.json`
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
    state.individual.profile = fresh.individual.profile
    state.individual.values = fresh.individual.values
    state.individual.customItems = fresh.individual.customItems
  }

  function resetAll() {
    if (!confirm('Clear all locally saved AI-native journey data? This cannot be undone.')) return
    const fresh = emptyState()
    state.organization.name = fresh.organization.name
    state.organization.useCase = fresh.organization.useCase
    state.organization.values = fresh.organization.values
    state.organization.customItems = fresh.organization.customItems
    state.individual.profile = fresh.individual.profile
    state.individual.values = fresh.individual.values
    state.individual.customItems = fresh.individual.customItems
  }

  return {
    state,
    orgEnablerGroups,
    individualAreaGroups,
    valueFor,
    toggleItem,
    setDetails,
    addCustomItem,
    removeCustomItem,
    customItemsFor,
    groupProgress,
    overallProgress,
    exportData,
    importData,
    resetAll,
  }
}
