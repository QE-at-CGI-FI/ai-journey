<script setup>
import { computed } from 'vue'
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
} = props.store

const overall = computed(() => overallProgress('individual', individualAreaGroups))
</script>

<template>
  <div class="tab-panel">
    <div class="tab-intro">
      <h2>Individual growth journey</h2>
      <p>
        Track one individual's personal experience growing into AI-native ways of working —
        built on top of the enablers the organization provides. Toggle each area on as it
        becomes true for this person, and note examples or evidence.
      </p>

      <div class="profile-fields">
        <label>
          Name
          <input v-model="state.individual.profile.name" type="text" placeholder="Jane Doe" />
        </label>
        <label>
          Role
          <input v-model="state.individual.profile.role" type="text" placeholder="e.g. Consultant" />
        </label>
        <label>
          Team
          <input v-model="state.individual.profile.team" type="text" placeholder="e.g. Delivery" />
        </label>
      </div>

      <div class="overall-progress">
        <div class="overall-progress__bar">
          <div
            class="overall-progress__fill"
            :style="{ width: (overall.total ? (overall.on / overall.total) * 100 : 0) + '%' }"
          />
        </div>
        <span>{{ overall.on }} / {{ overall.total }} areas growing</span>
      </div>
    </div>

    <EnablerGroup
      v-for="group in individualAreaGroups"
      :key="group.id"
      :group="group"
      :custom-items="customItemsFor('individual', group.id)"
      :value-for="(id) => valueFor('individual', id)"
      :progress="groupProgress('individual', group)"
      @toggle="(id) => toggleItem('individual', id)"
      @update:details="(id, text) => setDetails('individual', id, text)"
      @add-custom="(label) => addCustomItem('individual', group.id, label)"
      @remove-custom="(id) => removeCustomItem('individual', group.id, id)"
    />
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
</style>
