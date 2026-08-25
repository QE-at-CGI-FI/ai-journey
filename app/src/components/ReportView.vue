<script setup>
import { computed } from 'vue'
import { badgeTiers } from '../data/badgeTiers.js'

const props = defineProps({
  store: { type: Object, required: true },
})
const emit = defineEmits(['close'])

const {
  state,
  ui,
  displayIndividualName,
  orgEnablerGroups,
  learningCultureItemGroups,
  valueItemGroups,
  someonePctBucket,
  someonePctIndividuals,
  someonePctBadges,
  groupsForIndividual,
  individualExperiencePct,
} = props.store

const orgDisplayName = computed(() =>
  ui.anonymized ? 'Client Organization' : state.organization.name || 'AI-Native Journey',
)

const generatedOn = new Date().toLocaleDateString(undefined, {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})

const areas = computed(() => [
  { label: 'Foundational enablers', pct: someonePctBucket(state.organization, orgEnablerGroups) },
  { label: 'Learning culture', pct: someonePctBucket(state.learningCulture, learningCultureItemGroups) },
  { label: 'Individual experiences', pct: someonePctIndividuals() },
  { label: 'Benefits showcase', pct: someonePctBucket(state.value, valueItemGroups) },
  { label: 'Badges', pct: someonePctBadges() },
])

const overallPct = computed(() => {
  if (!areas.value.length) return 0
  return Math.round(areas.value.reduce((sum, a) => sum + a.pct, 0) / areas.value.length)
})

function roleLabel(ind) {
  const flags = ind.roleFlags || {}
  if (flags.knowledgeWorker && flags.developer) return 'Knowledge worker + Developer'
  if (flags.knowledgeWorker) return 'Knowledge worker'
  if (flags.developer) return 'Developer'
  return 'Untargeted'
}

function badgeLabels(ind) {
  return ind.badges
    .map((id) => badgeTiers.find((t) => t.id === id)?.label)
    .filter(Boolean)
    .join(', ')
}

const people = computed(() =>
  state.individuals.map((ind) => ({
    name: displayIndividualName(ind),
    role: roleLabel(ind),
    pct: individualExperiencePct(ind),
    badges: badgeLabels(ind) || '—',
  })),
)

const roleCounts = computed(() => {
  const counts = { both: 0, knowledgeWorker: 0, developer: 0, untargeted: 0 }
  state.individuals.forEach((ind) => {
    const flags = ind.roleFlags || {}
    if (flags.knowledgeWorker && flags.developer) counts.both += 1
    else if (flags.knowledgeWorker) counts.knowledgeWorker += 1
    else if (flags.developer) counts.developer += 1
    else counts.untargeted += 1
  })
  return counts
})

const badgeSummary = computed(() =>
  badgeTiers.map((tier) => ({
    label: tier.label,
    count: state.individuals.filter((ind) => ind.badges.includes(tier.id)).length,
  })),
)

function handlePrint() {
  window.print()
}
</script>

<template>
  <div class="report">
    <div class="report__toolbar no-print">
      <button type="button" class="btn-secondary" @click="emit('close')">← Back to app</button>
      <button type="button" class="btn-primary" @click="handlePrint">🖨 Print</button>
    </div>

    <div class="report__page">
      <header class="report__header">
        <h1>{{ orgDisplayName }} — Journey report</h1>
        <p v-if="state.organization.useCase" class="report__usecase">{{ state.organization.useCase }}</p>
        <p class="report__meta">Generated {{ generatedOn }}</p>
      </header>

      <section class="report__section">
        <h2>Journey snapshot</h2>
        <div class="area-strip">
          <div class="area-tile area-tile--overall">
            <span class="area-tile__pct">{{ overallPct }}%</span>
            <span class="area-tile__label">Overall</span>
          </div>
          <div v-for="area in areas" :key="area.label" class="area-tile">
            <span class="area-tile__pct">{{ area.pct }}%</span>
            <span class="area-tile__label">{{ area.label }}</span>
          </div>
        </div>
      </section>

      <section class="report__section">
        <h2>People ({{ state.individuals.length }})</h2>
        <p class="report__subtle">
          {{ roleCounts.knowledgeWorker }} knowledge worker · {{ roleCounts.developer }} developer ·
          {{ roleCounts.both }} both · {{ roleCounts.untargeted }} untargeted
        </p>
        <table v-if="people.length" class="report__table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Experience</th>
              <th>Badges</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in people" :key="p.name">
              <td>{{ p.name }}</td>
              <td>{{ p.role }}</td>
              <td>{{ p.pct }}%</td>
              <td>{{ p.badges }}</td>
            </tr>
          </tbody>
        </table>
        <p v-else class="report__subtle">No one tracked yet.</p>
      </section>

      <section class="report__section">
        <h2>Badges awarded</h2>
        <div class="area-strip">
          <div v-for="tier in badgeSummary" :key="tier.label" class="area-tile">
            <span class="area-tile__pct">{{ tier.count }}</span>
            <span class="area-tile__label">{{ tier.label }}</span>
          </div>
        </div>
      </section>

      <section v-if="state.actions.length" class="report__section">
        <h2>Planned actions</h2>
        <ul class="report__actions">
          <li v-for="action in state.actions" :key="action.id">
            <strong>{{ action.title || 'Untitled action' }}</strong>
            <span v-if="action.timeline"> — {{ action.timeline }}</span>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<style scoped>
.report {
  position: fixed;
  inset: 0;
  z-index: 900;
  overflow-y: auto;
  background: var(--cgi-grey-100);
}

.report__toolbar {
  position: sticky;
  top: 0;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  background: var(--cgi-black);
}

.btn-primary,
.btn-secondary {
  border-radius: 6px;
  padding: 0.45rem 0.9rem;
  font-size: 0.85rem;
  font-weight: 600;
  border: 1px solid transparent;
}

.btn-primary {
  background: var(--cgi-red);
  color: var(--cgi-white);
}

.btn-primary:hover {
  background: var(--cgi-red-dark);
}

.btn-secondary {
  background: transparent;
  color: var(--cgi-white);
  border-color: var(--cgi-grey-500);
}

.btn-secondary:hover {
  border-color: var(--cgi-white);
}

.report__page {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 2.5rem 3rem;
  background: var(--cgi-white);
  color: var(--cgi-grey-900);
}

.report__header {
  margin-bottom: 1.5rem;
  border-bottom: 3px solid var(--cgi-red);
  padding-bottom: 0.75rem;
}

.report__header h1 {
  margin: 0 0 0.3rem;
  font-size: 1.4rem;
}

.report__usecase {
  margin: 0 0 0.2rem;
  font-size: 0.9rem;
  color: var(--cgi-grey-700);
}

.report__meta {
  margin: 0;
  font-size: 0.78rem;
  color: var(--cgi-grey-500);
}

.report__section {
  margin-bottom: 1.5rem;
}

.report__section h2 {
  margin: 0 0 0.6rem;
  font-size: 1rem;
  color: var(--cgi-purple);
  border-bottom: 1px solid var(--cgi-grey-300);
  padding-bottom: 0.3rem;
}

.report__subtle {
  margin: 0 0 0.6rem;
  font-size: 0.82rem;
  color: var(--cgi-grey-700);
}

.area-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.area-tile {
  flex: 1 1 100px;
  min-width: 100px;
  text-align: center;
  padding: 0.5rem 0.4rem;
  border: 1px solid var(--cgi-grey-300);
  border-radius: 8px;
}

.area-tile--overall {
  border-color: var(--cgi-purple);
  background: color-mix(in srgb, var(--cgi-purple) 8%, var(--cgi-white));
}

.area-tile__pct {
  display: block;
  font-size: 1.25rem;
  font-weight: 700;
}

.area-tile__label {
  display: block;
  font-size: 0.68rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--cgi-grey-700);
  margin-top: 0.15rem;
}

.report__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.82rem;
}

.report__table th,
.report__table td {
  text-align: left;
  padding: 0.35rem 0.5rem;
  border-bottom: 1px solid var(--cgi-grey-300);
}

.report__table th {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--cgi-grey-700);
}

.report__actions {
  margin: 0;
  padding-left: 1.2rem;
  font-size: 0.85rem;
}

.report__actions li {
  margin-bottom: 0.3rem;
}

@media print {
  .no-print {
    display: none !important;
  }

  .report {
    position: static;
    background: var(--cgi-white);
  }

  .report__page {
    max-width: none;
    padding: 0;
  }
}
</style>
