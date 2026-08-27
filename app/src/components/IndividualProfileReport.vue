<script setup>
import { computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  store: { type: Object, required: true },
  individual: { type: Object, required: true },
})
const emit = defineEmits(['close'])

// Marks <body> so App.vue's print styles can hide the rest of the app
// chrome while this overlay is open — mirrors how ReportView is hidden.
onMounted(() => document.body.classList.add('profile-report-open'))
onUnmounted(() => document.body.classList.remove('profile-report-open'))

const {
  displayIndividualName,
  groupsForIndividual,
  valueFor,
  customItemsFor,
  individualExperiencePct,
} = props.store

const generatedOn = new Date().toLocaleDateString(undefined, {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})

const roleLabel = computed(() => {
  const flags = props.individual.roleFlags || {}
  if (flags.knowledgeWorker && flags.developer) return 'Knowledge worker + Developer'
  if (flags.knowledgeWorker) return 'Knowledge worker'
  if (flags.developer) return 'Developer'
  return 'Untargeted'
})

const pct = computed(() => individualExperiencePct(props.individual))

const groups = computed(() =>
  groupsForIndividual(props.individual).map((group) => {
    const items = [...group.items, ...customItemsFor(props.individual, group.id)]
    const acquired = items.filter((item) => valueFor(props.individual, item.id)?.on)
    const notAcquired = items.filter((item) => !valueFor(props.individual, item.id)?.on)
    return { id: group.id, title: group.title, acquired, notAcquired }
  }),
)

function handlePrint() {
  window.print()
}
</script>

<template>
  <div class="profile-report">
    <div class="profile-report__toolbar no-print">
      <button type="button" class="btn-secondary" @click="emit('close')">← Back to app</button>
      <button type="button" class="btn-primary" @click="handlePrint">🖨 Print</button>
    </div>

    <div class="profile-report__page">
      <header class="profile-report__header">
        <h1>{{ displayIndividualName(individual) }}</h1>
        <p class="profile-report__subtitle">{{ roleLabel }}</p>
        <p class="profile-report__meta">Generated {{ generatedOn }}</p>
      </header>

      <section class="profile-report__section">
        <div class="pct-tile">
          <span class="pct-tile__pct">{{ pct }}%</span>
          <span class="pct-tile__label">Experience growth</span>
        </div>
      </section>

      <section v-for="group in groups" :key="group.id" class="profile-report__section">
        <h2>{{ group.title }}</h2>

        <div class="profile-report__columns">
          <div class="profile-report__column">
            <h3>Acquired ({{ group.acquired.length }})</h3>
            <ul v-if="group.acquired.length" class="profile-report__list">
              <li v-for="item in group.acquired" :key="item.id">{{ item.label }}</li>
            </ul>
            <p v-else class="profile-report__subtle">None yet.</p>
          </div>

          <div class="profile-report__column">
            <h3>Not yet acquired ({{ group.notAcquired.length }})</h3>
            <ul v-if="group.notAcquired.length" class="profile-report__list profile-report__list--muted">
              <li v-for="item in group.notAcquired" :key="item.id">{{ item.label }}</li>
            </ul>
            <p v-else class="profile-report__subtle">All acquired.</p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.profile-report {
  position: fixed;
  inset: 0;
  z-index: 900;
  overflow-y: auto;
  background: var(--cgi-grey-100);
}

.profile-report__toolbar {
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

.profile-report__page {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 2.5rem 3rem;
  background: var(--cgi-white);
  color: var(--cgi-grey-900);
}

.profile-report__header {
  margin-bottom: 1.5rem;
  border-bottom: 3px solid var(--cgi-red);
  padding-bottom: 0.75rem;
}

.profile-report__header h1 {
  margin: 0 0 0.3rem;
  font-size: 1.4rem;
}

.profile-report__subtitle {
  margin: 0 0 0.2rem;
  font-size: 0.9rem;
  color: var(--cgi-grey-700);
}

.profile-report__meta {
  margin: 0;
  font-size: 0.78rem;
  color: var(--cgi-grey-500);
}

.profile-report__section {
  margin-bottom: 1.5rem;
}

.profile-report__section h2 {
  margin: 0 0 0.6rem;
  font-size: 1rem;
  color: var(--cgi-purple);
  border-bottom: 1px solid var(--cgi-grey-300);
  padding-bottom: 0.3rem;
}

.profile-report__subtle {
  margin: 0;
  font-size: 0.82rem;
  color: var(--cgi-grey-700);
}

.pct-tile {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  padding: 0.75rem 1.5rem;
  border: 1px solid var(--cgi-purple);
  border-radius: 10px;
  background: color-mix(in srgb, var(--cgi-purple) 8%, var(--cgi-white));
}

.pct-tile__pct {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--cgi-grey-900);
}

.pct-tile__label {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--cgi-grey-700);
}

.profile-report__columns {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.profile-report__column {
  flex: 1 1 260px;
  min-width: 220px;
}

.profile-report__column h3 {
  margin: 0 0 0.4rem;
  font-size: 0.82rem;
  color: var(--cgi-grey-700);
}

.profile-report__list {
  margin: 0;
  padding-left: 1.2rem;
  font-size: 0.85rem;
}

.profile-report__list li {
  margin-bottom: 0.25rem;
}

.profile-report__list--muted {
  color: var(--cgi-grey-500);
}

@media print {
  .no-print {
    display: none !important;
  }

  .profile-report {
    position: static;
    background: var(--cgi-white);
  }

  .profile-report__page {
    max-width: none;
    padding: 0;
  }

  .profile-report__columns {
    flex-wrap: nowrap;
  }
}
</style>
