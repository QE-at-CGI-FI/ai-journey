<script setup>
import { computed, ref, watch } from 'vue'
import EnablerGroup from './EnablerGroup.vue'

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
  addIndividual,
  removeIndividual,
  itemCoverage,
} = props.store

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
const selectedProgress = computed(() =>
  selected.value ? overallProgress(selected.value, individualAreaGroups) : { on: 0, total: 0 },
)

function coverageFor(individual) {
  return overallProgress(individual, individualAreaGroups)
}

function handleAdd() {
  const id = addIndividual(newName.value)
  if (id) selectedId.value = id
  newName.value = ''
}

function handleRemove(id) {
  removeIndividual(id)
}

function pctOf(progress) {
  return progress.total ? (progress.on / progress.total) * 100 : 0
}
</script>

<template>
  <div class="tab-panel">
    <div class="tab-intro">
      <h2>Individual growth journey</h2>
      <p>
        Track the people in the organization growing into AI-native ways of working — built on
        top of the enablers the organization provides. Add each person, toggle their experiences
        on as they become true, and see coverage across the whole roster.
      </p>
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
            <span class="roster__name">{{ ind.name || 'Unnamed' }}</span>
            <span class="roster__meta">{{ [ind.role, ind.team].filter(Boolean).join(' · ') }}</span>
            <span class="roster__badge">{{ coverageFor(ind).on }} / {{ coverageFor(ind).total }}</span>
          </button>
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

    <section v-if="state.individuals.length" class="coverage">
      <h3>Coverage across experiences</h3>
      <p class="coverage__hint">
        Share of the {{ state.individuals.length }}
        {{ state.individuals.length === 1 ? 'person' : 'people' }} tracked who have grown into
        each experience.
      </p>

      <div v-for="group in individualAreaGroups" :key="group.id" class="coverage__group">
        <h4>{{ group.title }}</h4>
        <ul class="coverage__items">
          <li v-for="item in group.items" :key="item.id" class="coverage__row">
            <span class="coverage__label">{{ item.label }}</span>
            <div class="coverage__bar">
              <div
                class="coverage__fill"
                :style="{ width: pctOf(itemCoverage(item.id)) + '%' }"
              />
            </div>
            <span class="coverage__count">{{ itemCoverage(item.id).on }} / {{ state.individuals.length }}</span>
          </li>
        </ul>
      </div>
    </section>

    <section v-if="selected" class="individual-detail">
      <div class="profile-fields">
        <label>
          Name
          <input v-model="selected.name" type="text" placeholder="Jane Doe" />
        </label>
        <label>
          Role
          <input v-model="selected.role" type="text" placeholder="e.g. Consultant" />
        </label>
        <label>
          Team
          <input v-model="selected.team" type="text" placeholder="e.g. Delivery" />
        </label>
      </div>

      <div class="overall-progress">
        <div class="overall-progress__bar">
          <div class="overall-progress__fill" :style="{ width: pctOf(selectedProgress) + '%' }" />
        </div>
        <span>{{ selectedProgress.on }} / {{ selectedProgress.total }} areas growing for {{ selected.name || 'this person' }}</span>
      </div>

      <EnablerGroup
        v-for="group in individualAreaGroups"
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
  </div>
</template>

<style scoped>
.tab-panel {
  max-width: 860px;
}

.tab-intro {
  margin-bottom: 1.5rem;
}

.tab-intro h2 {
  margin: 0 0 0.4rem;
  color: var(--cgi-grey-900);
}

.tab-intro p {
  margin: 0 0 1rem;
  color: var(--color-text-muted);
  font-size: 0.92rem;
  max-width: 68ch;
}

.roster,
.coverage,
.individual-detail {
  margin-bottom: 1.75rem;
}

.roster h3,
.coverage h3 {
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

.roster__badge {
  flex-shrink: 0;
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

.coverage__hint {
  margin: 0 0 0.75rem;
  font-size: 0.82rem;
  color: var(--color-text-muted);
}

.coverage__group {
  margin-bottom: 1rem;
}

.coverage__group h4 {
  margin: 0 0 0.4rem;
  font-size: 0.85rem;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.coverage__items {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.coverage__row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.coverage__label {
  flex: 1;
  font-size: 0.85rem;
  color: var(--color-text);
}

.coverage__bar {
  flex: 0 0 140px;
  height: 6px;
  border-radius: 999px;
  background: var(--cgi-grey-300);
  overflow: hidden;
}

.coverage__fill {
  height: 100%;
  background: linear-gradient(90deg, var(--cgi-purple), var(--cgi-red));
  transition: width 0.2s ease;
}

.coverage__count {
  flex-shrink: 0;
  width: 3.2rem;
  text-align: right;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--color-text-muted);
}

.profile-fields {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
  padding: 0.9rem 1rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
}

.profile-fields label {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--color-text-muted);
  flex: 1;
  min-width: 160px;
}

.profile-fields input {
  padding: 0.4rem 0.6rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  font-size: 0.88rem;
  font-weight: 400;
  color: var(--color-text);
}

.profile-fields input:focus {
  outline: 2px solid var(--cgi-purple);
  outline-offset: 1px;
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
</style>
