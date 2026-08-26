<script setup>
import { computed, ref, watch } from 'vue'
import EnablerGroup from './EnablerGroup.vue'
import { toolGroups } from '../data/toolGroups.js'

const props = defineProps({
  store: { type: Object, required: true },
})

const {
  state,
  individualAreaGroups,
  valueFor,
  toggleItem,
  setDetails,
  addCustomItem,
  removeCustomItem,
  customItemsFor,
  groupProgress,
  overallProgress,
  groupsForIndividual,
  addIndividual,
  removeIndividual,
  displayIndividualName,
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
} = props.store

const knownTools = toolGroups.flatMap((g) => g.tools)
const toolsOverlayFor = ref(null)
const customToolInput = ref('')
const toolsOverlayIndividual = computed(
  () => state.individuals.find((i) => i.id === toolsOverlayFor.value) || null,
)
const customTools = computed(() =>
  toolsOverlayIndividual.value ? toolsOverlayIndividual.value.tools.filter((t) => !knownTools.includes(t)) : [],
)

function openToolsOverlay(individual) {
  toolsOverlayFor.value = individual.id
  customToolInput.value = ''
}

function closeToolsOverlay() {
  toolsOverlayFor.value = null
}

function submitCustomTool() {
  if (!toolsOverlayIndividual.value) return
  addCustomTool(toolsOverlayIndividual.value, customToolInput.value)
  customToolInput.value = ''
}

const highlightOverlayFor = ref(null)
const highlightDraft = ref('')
const highlightOverlayIndividual = computed(
  () => state.individuals.find((i) => i.id === highlightOverlayFor.value) || null,
)

function openHighlightOverlay(individual) {
  highlightOverlayFor.value = individual.id
  highlightDraft.value = individual.highlightStory || ''
}

function closeHighlightOverlay() {
  highlightOverlayFor.value = null
}

function saveHighlightStory() {
  if (!highlightOverlayIndividual.value) return
  setHighlightStory(highlightOverlayIndividual.value, highlightDraft.value.trim())
  closeHighlightOverlay()
}

const clientsOverlayFor = ref(null)
const clientInput = ref('')
const clientsOverlayIndividual = computed(
  () => state.individuals.find((i) => i.id === clientsOverlayFor.value) || null,
)

function openClientsOverlay(individual) {
  clientsOverlayFor.value = individual.id
  clientInput.value = ''
}

function closeClientsOverlay() {
  clientsOverlayFor.value = null
}

function submitClient() {
  if (!clientsOverlayIndividual.value) return
  addClient(clientsOverlayIndividual.value, clientInput.value)
  clientInput.value = ''
}

const attentionOverlayFor = ref(null)
const attentionOverlayIndividual = computed(
  () => state.individuals.find((i) => i.id === attentionOverlayFor.value) || null,
)

function openAttentionOverlay(individual) {
  attentionOverlayFor.value = individual.id
}

function closeAttentionOverlay() {
  attentionOverlayFor.value = null
}

const newName = ref('')
const selectedId = ref(state.individuals[0]?.id ?? null)

// Keep the selection valid as individuals are added/removed.
watch(
  () => state.individuals.map((i) => i.id),
  (ids) => {
    if (selectedId.value && ids.includes(selectedId.value)) return
    selectedId.value = ids[0] ?? null
  },
)

const selected = computed(() => state.individuals.find((i) => i.id === selectedId.value) || null)

const selectedGroups = computed(() => (selected.value ? groupsForIndividual(selected.value) : []))
const selectedProgress = computed(() =>
  selected.value ? overallProgress(selected.value, selectedGroups.value) : { on: 0, total: 0 },
)

function coverageFor(individual) {
  return overallProgress(individual, groupsForIndividual(individual))
}

function toggleRole(individual, key) {
  individual.roleFlags[key] = !individual.roleFlags[key]
}

function handleAdd() {
  const id = addIndividual(newName.value)
  if (id) selectedId.value = id
  newName.value = ''
}

function handleRemove(id) {
  const individual = state.individuals.find((i) => i.id === id)
  if (!individual) return
  if (!confirm(`Remove ${displayIndividualName(individual)}? This cannot be undone.`)) return
  removeIndividual(id)
}

function pctOf(progress) {
  return progress.total ? (progress.on / progress.total) * 100 : 0
}

// Only people tracked against a group (ticked for its role, or untargeted —
// see groupsForIndividual) count toward that group's coverage denominator,
// so an e.g. developer-only roster doesn't dilute the knowledge-worker numbers.
function individualsForGroup(groupId) {
  return state.individuals.filter((ind) => groupsForIndividual(ind).some((g) => g.id === groupId))
}

function coverageAmong(itemId, people) {
  const total = people.length
  const on = people.filter((p) => p.values[itemId]?.on).length
  return { on, total }
}

function coveragePct(items, people) {
  const total = items.length
  let someoneCount = 0
  let everyoneSum = 0
  for (const item of items) {
    const cov = coverageAmong(item.id, people)
    if (cov.on > 0) someoneCount += 1
    if (cov.total > 0) everyoneSum += cov.on / cov.total
  }
  return {
    someone: total ? (someoneCount / total) * 100 : 0,
    everyone: total ? (everyoneSum / total) * 100 : 0,
  }
}

const groupCoverages = computed(() =>
  individualAreaGroups.map((group) => ({
    id: group.id,
    title: group.title,
    ...coveragePct(group.items, individualsForGroup(group.id)),
  })),
)

const allCoverage = computed(() => {
  let totalItems = 0
  let someoneCount = 0
  let everyoneSum = 0
  individualAreaGroups.forEach((group) => {
    const people = individualsForGroup(group.id)
    group.items.forEach((item) => {
      totalItems += 1
      const cov = coverageAmong(item.id, people)
      if (cov.on > 0) someoneCount += 1
      if (cov.total > 0) everyoneSum += cov.on / cov.total
    })
  })
  return {
    someone: totalItems ? (someoneCount / totalItems) * 100 : 0,
    everyone: totalItems ? (everyoneSum / totalItems) * 100 : 0,
  }
})
</script>

<template>
  <div class="tab-panel">
    <div class="tab-header">
      <div class="tab-intro">
        <h2>Individual growth journey</h2>
        <p>
          Track the people in the organization growing into AI-native ways of working — built on
          top of the enablers the organization provides. Add each person, toggle their experiences
          on as they become true, and see coverage across the whole roster.
        </p>
      </div>

      <div v-if="state.individuals.length" class="coverage-summary">
        <div class="coverage-summary__group">
          <span class="coverage-summary__title">All</span>
          <div class="coverage__tiles">
            <div class="coverage-tile">
              <span class="coverage-tile__pct">{{ Math.round(allCoverage.someone) }}%</span>
              <div class="coverage-tile__bar">
                <div class="coverage-tile__fill" :style="{ width: allCoverage.someone + '%' }" />
              </div>
              <span class="coverage-tile__label">Someone</span>
            </div>
            <div class="coverage-tile">
              <span class="coverage-tile__pct">{{ Math.round(allCoverage.everyone) }}%</span>
              <div class="coverage-tile__bar">
                <div class="coverage-tile__fill" :style="{ width: allCoverage.everyone + '%' }" />
              </div>
              <span class="coverage-tile__label">Everyone</span>
            </div>
          </div>
        </div>

        <div class="coverage-summary__roles">
          <div v-for="group in groupCoverages" :key="group.id" class="coverage-summary__group">
            <span class="coverage-summary__title">{{ group.title }}</span>
            <div class="coverage__tiles">
              <div class="coverage-tile">
                <span class="coverage-tile__pct">{{ Math.round(group.someone) }}%</span>
                <div class="coverage-tile__bar">
                  <div class="coverage-tile__fill" :style="{ width: group.someone + '%' }" />
                </div>
                <span class="coverage-tile__label">Someone</span>
              </div>
              <div class="coverage-tile">
                <span class="coverage-tile__pct">{{ Math.round(group.everyone) }}%</span>
                <div class="coverage-tile__bar">
                  <div class="coverage-tile__fill" :style="{ width: group.everyone + '%' }" />
                </div>
                <span class="coverage-tile__label">Everyone</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <section class="roster">
      <h3>People tracked</h3>
      <form class="roster__add" @submit.prevent="handleAdd">
        <input v-model="newName" type="text" placeholder="Add a person by name…" />
        <button type="submit" class="btn-outline">+ Add</button>
      </form>

      <ul v-if="state.individuals.length" class="roster__list">
        <li
          v-for="ind in state.individuals"
          :key="ind.id"
          class="roster__item"
          :class="{ 'roster__item--active': ind.id === selectedId }"
        >
          <button type="button" class="roster__select" @click="selectedId = ind.id">
            <span class="roster__name">{{ displayIndividualName(ind) }}</span>
            <span class="roster__meta">{{ [ind.role, ind.team].filter(Boolean).join(' · ') }}</span>
          </button>
          <div class="role-chips">
            <button
              type="button"
              class="role-chip"
              :class="{ 'role-chip--active': ind.roleFlags.knowledgeWorker }"
              title="Track knowledge-worker growth areas"
              @click="toggleRole(ind, 'knowledgeWorker')"
            >
              KW
            </button>
            <button
              type="button"
              class="role-chip"
              :class="{ 'role-chip--active': ind.roleFlags.developer }"
              title="Track developer growth areas"
              @click="toggleRole(ind, 'developer')"
            >
              Dev
            </button>
          </div>
          <button
            type="button"
            class="tools-star"
            :class="{ 'tools-star--active': ind.tools.length > 0 }"
            :title="ind.tools.length ? `${ind.tools.length} tool(s) in use` : 'Choose tools in use'"
            @click="openToolsOverlay(ind)"
          >
            ⚙️<span v-if="ind.tools.length">{{ ind.tools.length }}</span>
          </button>
          <button
            type="button"
            class="highlight-star"
            :class="{ 'highlight-star--active': !!ind.highlightStory }"
            :title="ind.highlightStory ? 'Edit highlight story' : 'Add a highlight story'"
            :aria-label="ind.highlightStory ? 'Edit highlight story' : 'Add a highlight story'"
            @click="openHighlightOverlay(ind)"
          >
            📖
          </button>
          <button
            type="button"
            class="clients-star"
            :class="{ 'clients-star--active': ind.clients.length > 0 }"
            :title="ind.clients.length ? `${ind.clients.length} client(s) linked` : 'Link clients'"
            :aria-label="ind.clients.length ? `${ind.clients.length} client(s) linked` : 'Link clients'"
            @click="openClientsOverlay(ind)"
          >
            🏠<span v-if="ind.clients.length">{{ ind.clients.length }}</span>
          </button>
          <button
            type="button"
            class="attention-star"
            :class="{ 'attention-star--active': attentionCount(ind) > 0 }"
            :title="attentionCount(ind) ? `${attentionCount(ind)} item(s) need action` : 'No items need action'"
            :aria-label="attentionCount(ind) ? `${attentionCount(ind)} item(s) need action` : 'No items need action'"
            @click="openAttentionOverlay(ind)"
          >
            ❗<span v-if="attentionCount(ind)">{{ attentionCount(ind) }}</span>
          </button>
          <span class="roster__badge">{{ coverageFor(ind).on }} / {{ coverageFor(ind).total }}</span>
          <button
            type="button"
            class="roster__remove"
            title="Remove person"
            aria-label="Remove person"
            @click="handleRemove(ind.id)"
          >
            ×
          </button>
        </li>
      </ul>
      <p v-else class="roster__empty">No one tracked yet — add a name above to get started.</p>
    </section>

    <section v-if="selected" class="individual-detail">
      <div class="overall-progress">
        <div class="overall-progress__bar">
          <div class="overall-progress__fill" :style="{ width: pctOf(selectedProgress) + '%' }" />
        </div>
        <span>{{ selectedProgress.on }} / {{ selectedProgress.total }} areas growing for {{ displayIndividualName(selected) }}</span>
      </div>

      <p v-if="!selected.roleFlags.knowledgeWorker && !selected.roleFlags.developer" class="role-hint">
        No role ticked yet — showing every growth area. Tick Knowledge worker and/or Developer in
        the list above to narrow the checklist and target to their role(s).
      </p>

      <EnablerGroup
        v-for="group in selectedGroups"
        :key="group.id"
        :group="group"
        :custom-items="customItemsFor(selected, group.id)"
        :value-for="(id) => valueFor(selected, id)"
        :progress="groupProgress(selected, group)"
        @toggle="(id) => toggleItem(selected, id)"
        @update:details="(id, text) => setDetails(selected, id, text)"
        @add-custom="(label) => addCustomItem(selected, group.id, label)"
        @remove-custom="(id) => removeCustomItem(selected, group.id, id)"
      />
    </section>

    <Teleport to="body">
      <div
        v-if="toolsOverlayIndividual"
        class="tools-overlay"
        role="dialog"
        aria-modal="true"
        :aria-label="`Tools — ${displayIndividualName(toolsOverlayIndividual)}`"
        tabindex="-1"
        @click.self="closeToolsOverlay"
        @keydown.esc="closeToolsOverlay"
      >
        <div class="tools-overlay__panel">
          <div class="tools-overlay__header">
            <span>Tools — {{ displayIndividualName(toolsOverlayIndividual) }}</span>
            <button type="button" class="tools-overlay__close" aria-label="Close" title="Close" @click="closeToolsOverlay">
              ×
            </button>
          </div>

          <div v-for="group in toolGroups" :key="group.label" class="tools-overlay__group">
            <div class="tools-overlay__group-label">{{ group.label }}</div>
            <label v-for="tool in group.tools" :key="tool" class="tools-overlay__item">
              <input
                type="checkbox"
                :checked="hasTool(toolsOverlayIndividual, tool)"
                @change="toggleTool(toolsOverlayIndividual, tool)"
              />
              {{ tool }}
            </label>
          </div>

          <div v-if="customTools.length" class="tools-overlay__group">
            <div class="tools-overlay__group-label">Other</div>
            <label v-for="tool in customTools" :key="tool" class="tools-overlay__item">
              <input
                type="checkbox"
                checked
                @change="toggleTool(toolsOverlayIndividual, tool)"
              />
              {{ tool }}
            </label>
          </div>

          <form class="tools-overlay__add" @submit.prevent="submitCustomTool">
            <input v-model="customToolInput" type="text" placeholder="Add another tool…" />
            <button type="submit" class="btn-outline">+ Add</button>
          </form>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div
        v-if="highlightOverlayIndividual"
        class="highlight-overlay"
        role="dialog"
        aria-modal="true"
        :aria-label="`Highlight Story — ${displayIndividualName(highlightOverlayIndividual)}`"
        tabindex="-1"
        @click.self="closeHighlightOverlay"
        @keydown.esc="closeHighlightOverlay"
      >
        <div class="highlight-overlay__panel">
          <h3 class="highlight-overlay__title">
            Highlight Story: {{ displayIndividualName(highlightOverlayIndividual) }}
          </h3>
          <p class="highlight-overlay__subtitle">Best of AI work this person has been doing</p>
          <textarea
            v-model="highlightDraft"
            class="highlight-overlay__textarea"
            placeholder="Describe the highlight story of best AI work…"
            rows="6"
          />
          <div class="highlight-overlay__actions">
            <button type="button" class="btn-outline" @click="closeHighlightOverlay">Cancel</button>
            <button type="button" class="btn-primary" @click="saveHighlightStory">Save</button>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div
        v-if="clientsOverlayIndividual"
        class="clients-overlay"
        role="dialog"
        aria-modal="true"
        :aria-label="`Clients — ${displayIndividualName(clientsOverlayIndividual)}`"
        tabindex="-1"
        @click.self="closeClientsOverlay"
        @keydown.esc="closeClientsOverlay"
      >
        <div class="clients-overlay__panel">
          <h3 class="clients-overlay__title">
            Clients: {{ displayIndividualName(clientsOverlayIndividual) }}
          </h3>
          <p v-if="!clientsOverlayIndividual.clients.length" class="clients-overlay__subtitle">
            No clients linked yet.
          </p>
          <ul v-else class="clients-overlay__list">
            <li v-for="client in clientsOverlayIndividual.clients" :key="client" class="clients-overlay__item">
              <span>{{ client }}</span>
              <button
                type="button"
                class="clients-overlay__remove"
                title="Remove client"
                aria-label="Remove client"
                @click="removeClient(clientsOverlayIndividual, client)"
              >
                ×
              </button>
            </li>
          </ul>
          <form class="clients-overlay__add" @submit.prevent="submitClient">
            <input v-model="clientInput" type="text" placeholder="Client name…" />
            <button type="submit" class="btn-primary">Add</button>
          </form>
          <div class="clients-overlay__actions">
            <button type="button" class="btn-outline" @click="closeClientsOverlay">Close</button>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div
        v-if="attentionOverlayIndividual"
        class="attention-overlay"
        role="dialog"
        aria-modal="true"
        :aria-label="`Attention — ${displayIndividualName(attentionOverlayIndividual)}`"
        tabindex="-1"
        @click.self="closeAttentionOverlay"
        @keydown.esc="closeAttentionOverlay"
      >
        <div class="attention-overlay__panel">
          <h3 class="attention-overlay__title">
            Attention: {{ displayIndividualName(attentionOverlayIndividual) }}
          </h3>
          <p class="attention-overlay__subtitle">Items that need action</p>

          <label v-for="item in attentionItems" :key="item.id" class="attention-overlay__item">
            <input
              type="checkbox"
              :checked="hasAttentionFlag(attentionOverlayIndividual, item.id)"
              @change="toggleAttentionFlag(attentionOverlayIndividual, item.id)"
            />
            {{ item.label }}
          </label>

          <div class="attention-overlay__actions">
            <button type="button" class="btn-outline" @click="closeAttentionOverlay">Close</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.tab-panel {
  max-width: 860px;
}

.tab-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1.75rem;
  margin-bottom: 1.5rem;
}

.tab-intro {
  flex: 1;
  min-width: 260px;
}

.tab-intro h2 {
  margin: 0 0 0.4rem;
  color: var(--cgi-grey-900);
}

.tab-intro p {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 0.92rem;
  max-width: 68ch;
}

.coverage-summary {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.coverage-summary__roles {
  display: flex;
  gap: 1.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--cgi-grey-300);
}

.coverage-summary__group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.coverage-summary__title {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--cgi-purple);
  white-space: nowrap;
}

.roster,
.individual-detail {
  margin-bottom: 1.75rem;
}

.roster h3 {
  margin: 0 0 0.6rem;
  font-size: 1.02rem;
  color: var(--cgi-purple);
  border-bottom: 2px solid var(--cgi-grey-300);
  padding-bottom: 0.35rem;
}

.roster__add {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.roster__add input {
  flex: 1;
  max-width: 320px;
  padding: 0.4rem 0.6rem;
  border: 1px dashed var(--color-border);
  border-radius: 6px;
  font-size: 0.85rem;
  background: var(--color-surface);
}

.roster__empty {
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.roster__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.roster__item {
  display: flex;
  align-items: stretch;
  gap: 0.4rem;
}

.roster__select {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-align: left;
  border: 1px solid var(--color-border);
  border-left: 4px solid var(--color-border);
  border-radius: 8px;
  padding: 0.55rem 0.9rem;
  background: var(--color-surface);
}

.roster__item--active .roster__select {
  border-left-color: var(--cgi-red);
  background: color-mix(in srgb, var(--cgi-purple) 6%, var(--color-surface));
}

.roster__name {
  font-weight: 600;
  color: var(--color-text);
}

.roster__meta {
  flex: 1;
  font-size: 0.78rem;
  color: var(--color-text-muted);
}

.role-chips {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.role-chip {
  border: 1.5px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text-muted);
  border-radius: 6px;
  padding: 0.2rem 0.5rem;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.role-chip--active {
  border-color: var(--cgi-purple);
  background: var(--cgi-purple);
  color: var(--cgi-white);
}

.tools-star,
.highlight-star,
.clients-star,
.attention-star {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.2rem;
  /* Fixed (not min-) width so the box doesn't grow when a count badge
     appears — otherwise rows with linked data misalign against rows
     without it. */
  width: 3.1rem;
  border: 1.5px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text-muted);
  border-radius: 6px;
  padding: 0.2rem 0.5rem;
  font-size: 0.85rem;
  line-height: 1;
  /* Emoji glyphs ignore `color` — dim them to grey until something is
     actually linked, so an unused icon doesn't read as already-set. */
  filter: grayscale(1);
  opacity: 0.65;
}

.tools-star--active,
.highlight-star--active,
.clients-star--active,
.attention-star--active {
  filter: none;
  opacity: 1;
}

.tools-star--active {
  border-color: #f59e0b;
  background: color-mix(in srgb, #f59e0b 12%, var(--color-surface));
  color: #b45309;
}

.tools-star span,
.highlight-star span,
.clients-star span,
.attention-star span {
  font-size: 0.7rem;
  font-weight: 700;
}

.highlight-star--active {
  border-color: var(--cgi-red);
  background: color-mix(in srgb, var(--cgi-red) 12%, var(--color-surface));
  color: var(--cgi-red);
}

.clients-star--active {
  border-color: var(--cgi-purple);
  background: color-mix(in srgb, var(--cgi-purple) 12%, var(--color-surface));
  color: var(--cgi-purple);
}

.attention-star--active {
  border-color: var(--cgi-red);
  background: color-mix(in srgb, var(--cgi-red) 12%, var(--color-surface));
  color: var(--cgi-red);
}

.roster__badge {
  flex-shrink: 0;
  min-width: 3.6rem;
  text-align: center;
  font-size: 0.78rem;
  font-weight: 600;
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  background: var(--cgi-grey-100);
  color: var(--color-text-muted);
}

.roster__remove {
  flex-shrink: 0;
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  font-size: 1.2rem;
  line-height: 1;
  padding: 0 0.6rem;
  border-radius: 4px;
}

.roster__remove:hover {
  background: var(--cgi-grey-100);
  color: var(--cgi-red);
}

.coverage__tiles {
  display: flex;
  gap: 0.5rem;
}

.coverage-tile {
  flex: 0 0 auto;
  min-width: 76px;
  padding: 0.4rem 0.6rem;
  background: var(--cgi-grey-100);
  border-radius: 8px;
  text-align: center;
}

.coverage-tile__pct {
  display: block;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text);
}

.coverage-tile__bar {
  height: 4px;
  border-radius: 999px;
  background: var(--cgi-grey-300);
  overflow: hidden;
  margin: 0.35rem 0 0.3rem;
}

.coverage-tile__fill {
  height: 100%;
  background: linear-gradient(90deg, var(--cgi-purple), var(--cgi-red));
  transition: width 0.2s ease;
}

.coverage-tile__label {
  display: block;
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.overall-progress {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.overall-progress__bar {
  flex: 1;
  max-width: 320px;
  height: 8px;
  border-radius: 999px;
  background: var(--cgi-grey-300);
  overflow: hidden;
}

.overall-progress__fill {
  height: 100%;
  background: linear-gradient(90deg, var(--cgi-purple), var(--cgi-red));
  transition: width 0.2s ease;
}

.overall-progress span {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--color-text-muted);
}

.role-hint {
  margin: -0.5rem 0 1.25rem;
  font-size: 0.8rem;
  color: var(--color-text-muted);
  font-style: italic;
  max-width: 60ch;
}

.btn-outline {
  border: 1px solid var(--cgi-purple);
  color: var(--cgi-purple);
  background: transparent;
  border-radius: 6px;
  padding: 0.35rem 0.8rem;
  font-size: 0.82rem;
  font-weight: 600;
  white-space: nowrap;
}

.btn-outline:hover {
  background: var(--cgi-purple);
  color: var(--cgi-white);
}

.tools-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: rgba(0, 0, 0, 0.6);
}

.tools-overlay:focus {
  outline: none;
}

.tools-overlay__panel {
  background: var(--cgi-white);
  border-radius: 16px;
  padding: 1.25rem 1.5rem;
  width: 320px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.35);
}

.tools-overlay__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--cgi-grey-900);
}

.tools-overlay__close {
  border: none;
  background: var(--cgi-grey-100);
  border-radius: 6px;
  width: 26px;
  height: 26px;
  font-size: 1rem;
  color: var(--color-text);
}

.tools-overlay__close:hover {
  background: var(--cgi-red);
  color: var(--cgi-white);
}

.tools-overlay__group {
  margin-bottom: 0.9rem;
}

.tools-overlay__group-label {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-muted);
  margin-bottom: 0.4rem;
}

.tools-overlay__item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0;
  font-size: 0.88rem;
  color: var(--color-text);
}

.tools-overlay__item input {
  width: 15px;
  height: 15px;
  accent-color: var(--cgi-purple);
}

.tools-overlay__add {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.6rem;
  padding-top: 0.8rem;
  border-top: 1px solid var(--cgi-grey-300);
}

.tools-overlay__add input {
  flex: 1;
  min-width: 0;
  padding: 0.4rem 0.6rem;
  border: 1px dashed var(--color-border);
  border-radius: 6px;
  font-size: 0.85rem;
  background: var(--color-surface);
}

.btn-primary {
  border: 1px solid var(--cgi-red);
  background: var(--cgi-red);
  color: var(--cgi-white);
  border-radius: 6px;
  padding: 0.35rem 0.9rem;
  font-size: 0.82rem;
  font-weight: 600;
}

.btn-primary:hover {
  background: var(--cgi-red-dark);
}

.highlight-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: rgba(0, 0, 0, 0.6);
}

.highlight-overlay:focus {
  outline: none;
}

.highlight-overlay__panel {
  background: var(--cgi-white);
  border-radius: 16px;
  padding: 1.5rem 1.75rem;
  width: 420px;
  max-width: 100%;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.35);
}

.highlight-overlay__title {
  margin: 0 0 0.35rem;
  font-size: 1.05rem;
  color: var(--cgi-grey-900);
}

.highlight-overlay__subtitle {
  margin: 0 0 0.9rem;
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.highlight-overlay__textarea {
  width: 100%;
  box-sizing: border-box;
  resize: vertical;
  min-height: 140px;
  padding: 0.65rem 0.8rem;
  border: 1.5px solid #f59e0b;
  border-radius: 8px;
  font-size: 0.9rem;
  font-family: inherit;
  color: var(--color-text);
  background: var(--color-surface);
}

.highlight-overlay__textarea:focus {
  outline: none;
  border-color: #f59e0b;
  box-shadow: 0 0 0 3px color-mix(in srgb, #f59e0b 20%, transparent);
}

.highlight-overlay__actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
  margin-top: 1rem;
}

.clients-overlay,
.attention-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: rgba(0, 0, 0, 0.6);
}

.clients-overlay:focus,
.attention-overlay:focus {
  outline: none;
}

.clients-overlay__panel,
.attention-overlay__panel {
  background: var(--cgi-white);
  border-radius: 16px;
  padding: 1.5rem 1.75rem;
  width: 380px;
  max-width: 100%;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.35);
}

.clients-overlay__title,
.attention-overlay__title {
  margin: 0 0 0.35rem;
  font-size: 1.05rem;
  color: var(--cgi-grey-900);
}

.clients-overlay__subtitle,
.attention-overlay__subtitle {
  margin: 0 0 0.9rem;
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.clients-overlay__list {
  list-style: none;
  margin: 0 0 0.9rem;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.clients-overlay__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.35rem 0.65rem;
  border-radius: 6px;
  background: var(--cgi-grey-100);
  font-size: 0.88rem;
  color: var(--color-text);
}

.clients-overlay__remove {
  flex-shrink: 0;
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  font-size: 1.1rem;
  line-height: 1;
  padding: 0 0.3rem;
  border-radius: 4px;
}

.clients-overlay__remove:hover {
  background: var(--cgi-grey-300);
  color: var(--cgi-red);
}

.clients-overlay__add {
  display: flex;
  gap: 0.5rem;
}

.clients-overlay__add input {
  flex: 1;
  min-width: 0;
  padding: 0.4rem 0.6rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  font-size: 0.85rem;
  background: var(--color-surface);
}

.clients-overlay__actions,
.attention-overlay__actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
}

.attention-overlay__item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.3rem 0;
  font-size: 0.9rem;
  color: var(--color-text);
}

.attention-overlay__item input {
  width: 16px;
  height: 16px;
  accent-color: var(--cgi-red);
}
</style>
