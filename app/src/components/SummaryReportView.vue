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
  orgEnablerGroups,
  learningCultureItemGroups,
  individualAreaGroups,
  valueItemGroups,
  customItemsFor,
  someonePctBucket,
  someonePctIndividuals,
  someonePctBadges,
  itemCoverage,
} = props.store

const orgDisplayName = computed(() =>
  ui.anonymized ? 'Client Organization' : state.organization.name || 'AI-Native Journey',
)

const generatedOn = new Date().toLocaleDateString(undefined, {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})

// Org-wide bucket (organization / learning culture / value): checked once
// that item is switched on for the org.
function bucketChecklist(bucket, groups) {
  return groups.map((g) => ({
    id: g.id,
    title: g.title,
    items: [...g.items, ...customItemsFor(bucket, g.id)].map((item) => ({
      id: item.id,
      label: item.label,
      on: !!bucket.values[item.id]?.on,
    })),
  }))
}

// Individual experiences aren't a single bucket — an item is checked here
// once at least one tracked person has it, matching the "someone" percentage
// used everywhere else in the app.
const individualChecklist = computed(() =>
  individualAreaGroups.map((g) => ({
    id: g.id,
    title: g.title,
    items: g.items.map((item) => ({
      id: item.id,
      label: item.label,
      on: itemCoverage(item.id).on > 0,
    })),
  })),
)

const badgeChecklist = computed(() =>
  badgeTiers.map((tier) => ({
    id: tier.id,
    label: tier.label,
    on: state.individuals.some((ind) => ind.badges.includes(tier.id)),
  })),
)

const sections = computed(() => [
  {
    id: 'organization',
    title: 'Foundational enablers',
    pct: someonePctBucket(state.organization, orgEnablerGroups),
    groups: bucketChecklist(state.organization, orgEnablerGroups),
  },
  {
    id: 'learning-culture',
    title: 'Learning culture',
    pct: someonePctBucket(state.learningCulture, learningCultureItemGroups),
    groups: bucketChecklist(state.learningCulture, learningCultureItemGroups),
  },
  {
    id: 'individual',
    title: 'Individual experiences',
    pct: someonePctIndividuals(),
    groups: individualChecklist.value,
  },
  {
    id: 'value',
    title: 'Benefits showcase',
    pct: someonePctBucket(state.value, valueItemGroups),
    groups: bucketChecklist(state.value, valueItemGroups),
  },
])

const overallPct = computed(() => {
  const pcts = [...sections.value.map((s) => s.pct), someonePctBadges()]
  if (!pcts.length) return 0
  return Math.round(pcts.reduce((sum, p) => sum + p, 0) / pcts.length)
})

function handlePrint() {
  window.print()
}
</script>

<template>
  <div class="summary">
    <div class="summary__toolbar no-print">
      <button type="button" class="btn-secondary" @click="emit('close')">← Back to app</button>
      <button type="button" class="btn-primary" @click="handlePrint">🖨 Print</button>
    </div>

    <div class="summary__page">
      <header class="summary__header">
        <h1>{{ orgDisplayName }} — Journey summary</h1>
        <p v-if="state.organization.useCase" class="summary__usecase">{{ state.organization.useCase }}</p>
        <p class="summary__meta">Generated {{ generatedOn }} · Overall {{ overallPct }}%</p>
      </header>

      <section v-for="section in sections" :key="section.id" class="summary__section">
        <h2>{{ section.title }} <span class="pct-chip">{{ section.pct }}%</span></h2>
        <div v-for="group in section.groups" :key="group.id" class="summary__group">
          <h3 v-if="section.groups.length > 1">{{ group.title }}</h3>
          <ul class="checklist">
            <li v-for="item in group.items" :key="item.id" :class="{ 'checklist__item--on': item.on }">
              <span class="checklist__box">{{ item.on ? '☑' : '☐' }}</span>{{ item.label }}
            </li>
          </ul>
        </div>
      </section>

      <section class="summary__section">
        <h2>Badges <span class="pct-chip">{{ someonePctBadges() }}%</span></h2>
        <ul class="checklist checklist--badges">
          <li v-for="tier in badgeChecklist" :key="tier.id" :class="{ 'checklist__item--on': tier.on }">
            <span class="checklist__box">{{ tier.on ? '☑' : '☐' }}</span>{{ tier.label }}
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<style scoped>
.summary {
  position: fixed;
  inset: 0;
  z-index: 900;
  overflow-y: auto;
  background: var(--cgi-grey-100);
}

.summary__toolbar {
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

.summary__page {
  max-width: 900px;
  margin: 0 auto;
  padding: 1.5rem 2rem 2rem;
  background: var(--cgi-white);
  color: var(--cgi-grey-900);
  font-size: 0.78rem;
}

.summary__header {
  margin-bottom: 0.9rem;
  border-bottom: 3px solid var(--cgi-red);
  padding-bottom: 0.5rem;
}

.summary__header h1 {
  margin: 0 0 0.25rem;
  font-size: 1.25rem;
}

.summary__usecase {
  margin: 0 0 0.15rem;
  font-size: 0.82rem;
  color: var(--cgi-grey-700);
}

.summary__meta {
  margin: 0;
  font-size: 0.72rem;
  color: var(--cgi-grey-500);
}

.summary__section {
  margin-bottom: 0.7rem;
  break-inside: avoid;
}

.summary__section h2 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 0.35rem;
  font-size: 0.88rem;
  color: var(--cgi-purple);
  border-bottom: 1px solid var(--cgi-grey-300);
  padding-bottom: 0.2rem;
}

.pct-chip {
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--cgi-white);
  background: var(--cgi-purple);
  border-radius: 999px;
  padding: 0.05rem 0.5rem;
}

.summary__group {
  margin-bottom: 0.4rem;
}

.summary__group h3 {
  margin: 0 0 0.15rem;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  color: var(--cgi-grey-700);
}

.checklist {
  margin: 0;
  padding: 0;
  list-style: none;
  column-count: 2;
  column-gap: 1.25rem;
}

.checklist--badges {
  column-count: 1;
}

.checklist li {
  break-inside: avoid;
  font-size: 0.72rem;
  line-height: 1.35;
  color: var(--cgi-grey-700);
}

.checklist__item--on {
  color: var(--cgi-grey-900);
  font-weight: 600;
}

.checklist__box {
  display: inline-block;
  width: 1.1em;
  color: var(--cgi-purple);
}

@media print {
  .no-print {
    display: none !important;
  }

  .summary {
    position: static;
    background: var(--cgi-white);
  }

  .summary__page {
    max-width: none;
    padding: 0;
  }
}
</style>
