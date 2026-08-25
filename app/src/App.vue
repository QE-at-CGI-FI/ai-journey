<script setup>
import { ref } from 'vue'
import CgiLogo from './components/CgiLogo.vue'
import DataControls from './components/DataControls.vue'
import OrganizationTab from './components/OrganizationTab.vue'
import IndividualTab from './components/IndividualTab.vue'
import { useJourneyStore } from './composables/useJourneyStore.js'

const store = useJourneyStore()
const activeTab = ref('organization')

const tabs = [
  { id: 'organization', label: 'Organization' },
  { id: 'individual', label: 'Individual' },
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
</script>

<template>
  <div class="app-shell">
    <header class="app-header">
      <div class="app-header__brand">
        <CgiLogo :size="44" />
        <div class="app-header__titles">
          <h1>AI-Native Journey</h1>
          <p>From organizational foundational enablers to individual experience growth</p>
        </div>
      </div>
      <DataControls @export="handleExport" @import="handleImport" @reset="handleReset" />
    </header>

    <div class="org-name-bar">
      <div class="org-name-bar__field">
        <label for="org-name">Organization</label>
        <input
          id="org-name"
          v-model="store.state.organization.name"
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
      <OrganizationTab v-if="activeTab === 'organization'" :store="store" />
      <IndividualTab v-else :store="store" />
    </main>

    <footer class="app-footer">
      <span>Saved automatically to this browser's local storage. Use Export to back up or share.</span>
    </footer>
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
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
