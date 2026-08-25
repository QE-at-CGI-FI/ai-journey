<script setup>
import { ref } from 'vue'
import CgiLogo from './components/CgiLogo.vue'
import DataControls from './components/DataControls.vue'
import JourneyTab from './components/JourneyTab.vue'
import OrganizationTab from './components/OrganizationTab.vue'
import LearningCultureTab from './components/LearningCultureTab.vue'
import IndividualTab from './components/IndividualTab.vue'
import BadgesTab from './components/BadgesTab.vue'
import ValueTab from './components/ValueTab.vue'
import ActionsTab from './components/ActionsTab.vue'
import ReportView from './components/ReportView.vue'
import { useJourneyStore } from './composables/useJourneyStore.js'

const store = useJourneyStore()
const activeTab = ref('journey')
const showReport = ref(false)

const tabs = [
  { id: 'journey', label: 'Journey' },
  { id: 'organization', label: 'Organization' },
  { id: 'learning-culture', label: 'Learning culture' },
  { id: 'individual', label: 'Individual' },
  { id: 'badges', label: 'Badges' },
  { id: 'value', label: 'Value' },
  { id: 'actions', label: 'Actions' },
]

function handleExport() {
  store.exportData()
}

function handleImport(jsonText) {
  store.importData(jsonText)
}

function handleReset() {
  store.resetAll()
}

function handlePrintReport() {
  showReport.value = true
}
</script>

<template>
  <div class="app-shell">
  <div class="app-chrome" :class="{ 'is-report-open': showReport }">
    <header class="app-header">
      <div class="app-header__brand">
        <CgiLogo :size="44" />
        <div class="app-header__titles">
          <h1>AI-Native Journey</h1>
          <p>From organizational foundational enablers to individual experience growth</p>
        </div>
      </div>
      <DataControls
        :anonymized="store.ui.anonymized"
        @export="handleExport"
        @import="handleImport"
        @reset="handleReset"
        @print-report="handlePrintReport"
        @toggle-anonymize="store.ui.anonymized = !store.ui.anonymized"
      />
    </header>

    <div class="org-name-bar">
      <div class="org-name-bar__field">
        <label for="org-name">Organization</label>
        <input
          id="org-name"
          :value="store.ui.anonymized ? 'Client Organization' : store.state.organization.name"
          :disabled="store.ui.anonymized"
          :title="store.ui.anonymized ? 'Turn off Anonymized to edit the organization name' : ''"
          @input="store.state.organization.name = $event.target.value"
          type="text"
          placeholder="e.g. CGI"
        />
      </div>
      <div class="org-name-bar__field org-name-bar__field--grow">
        <label for="org-use-case">Use case</label>
        <input
          id="org-use-case"
          v-model="store.state.organization.useCase"
          type="text"
          placeholder="e.g. Client proposal drafting with AI assistance"
        />
      </div>
    </div>

    <nav class="tabs" role="tablist">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        type="button"
        role="tab"
        class="tab-btn"
        :class="{ 'tab-btn--active': activeTab === tab.id }"
        :aria-selected="activeTab === tab.id"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
      </button>
    </nav>

    <main class="app-main">
      <JourneyTab v-if="activeTab === 'journey'" :store="store" @navigate="activeTab = $event" />
      <OrganizationTab v-else-if="activeTab === 'organization'" :store="store" />
      <LearningCultureTab v-else-if="activeTab === 'learning-culture'" :store="store" />
      <IndividualTab v-else-if="activeTab === 'individual'" :store="store" />
      <BadgesTab v-else-if="activeTab === 'badges'" :store="store" />
      <ValueTab v-else-if="activeTab === 'value'" :store="store" />
      <ActionsTab v-else :store="store" />
    </main>

    <footer class="app-footer">
      <span>Saved automatically to this browser's local storage. Use Export to back up or share.</span>
    </footer>
  </div>

  <ReportView v-if="showReport" :store="store" @close="showReport = false" />
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-chrome {
  display: flex;
  flex-direction: column;
  flex: 1;
}

@media print {
  .app-chrome.is-report-open {
    display: none !important;
  }
}

.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  flex-wrap: wrap;
  background: var(--cgi-black);
  color: var(--cgi-white);
  padding: 1rem 1.75rem;
  border-bottom: 4px solid var(--cgi-red);
}

.app-header__brand {
  display: flex;
  align-items: center;
  gap: 0.9rem;
}

.app-header__titles h1 {
  margin: 0;
  font-size: 1.3rem;
  letter-spacing: 0.01em;
}

.app-header__titles p {
  margin: 0.15rem 0 0;
  font-size: 0.82rem;
  color: var(--cgi-grey-300);
}

.org-name-bar {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
  background: var(--cgi-grey-100);
  padding: 0.6rem 1.75rem;
  border-bottom: 1px solid var(--color-border);
}

.org-name-bar__field {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex: 0 0 auto;
}

.org-name-bar__field--grow {
  flex: 1 1 320px;
}

.org-name-bar label {
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--cgi-grey-700);
  white-space: nowrap;
}

.org-name-bar input {
  flex: 0 1 320px;
  padding: 0.35rem 0.6rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--cgi-grey-900);
  background: var(--cgi-white);
}

.org-name-bar__field--grow input {
  flex: 1 1 auto;
  font-weight: 400;
}

.org-name-bar input:focus {
  outline: 2px solid var(--cgi-purple);
  outline-offset: 1px;
}

.tabs {
  display: flex;
  gap: 0.25rem;
  background: var(--cgi-grey-900);
  padding: 0 1.5rem;
}

.tab-btn {
  border: none;
  background: transparent;
  color: var(--cgi-grey-300);
  padding: 0.75rem 1.25rem;
  font-size: 0.92rem;
  font-weight: 600;
  border-bottom: 3px solid transparent;
}

.tab-btn:hover {
  color: var(--cgi-white);
}

.tab-btn--active {
  color: var(--cgi-white);
  border-bottom-color: var(--cgi-red);
}

.app-main {
  flex: 1;
  padding: 1.75rem;
  background: var(--color-bg);
}

.app-footer {
  padding: 0.85rem 1.75rem;
  border-top: 1px solid var(--color-border);
  background: var(--color-surface);
  font-size: 0.78rem;
  color: var(--color-text-muted);
}
</style>
