<script setup>
import { computed } from 'vue'
import EnablerGroup from './EnablerGroup.vue'

const props = defineProps({
  store: { type: Object, required: true },
})

const { state, valueItemGroups, valueFor, toggleItem, setDetails, addCustomItem, removeCustomItem, customItemsFor, groupProgress, overallProgress } =
  props.store

const bucket = state.value
const overall = computed(() => overallProgress(bucket, valueItemGroups))
</script>

<template>
  <div class="tab-panel">
    <div class="tab-intro">
      <h2>Value &amp; benefits tracking</h2>
      <p>
        Track the benefits being realized from the AI-native way of working. Toggle each item on
        once it's being measured or shown, and document the evidence, source, or owner.
      </p>
      <div class="overall-progress">
        <div class="overall-progress__bar">
          <div
            class="overall-progress__fill"
            :style="{ width: (overall.total ? (overall.on / overall.total) * 100 : 0) + '%' }"
          />
        </div>
        <span>{{ overall.on }} / {{ overall.total }} benefits tracked</span>
      </div>
    </div>

    <EnablerGroup
      v-for="group in valueItemGroups"
      :key="group.id"
      :group="group"
      :custom-items="customItemsFor(bucket, group.id)"
      :value-for="(id) => valueFor(bucket, id)"
      :progress="groupProgress(bucket, group)"
      @toggle="(id) => toggleItem(bucket, id)"
      @update:details="(id, text) => setDetails(bucket, id, text)"
      @add-custom="(label) => addCustomItem(bucket, group.id, label)"
      @remove-custom="(id) => removeCustomItem(bucket, group.id, id)"
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
  margin: 0 0 0.9rem;
  color: var(--color-text-muted);
  font-size: 0.92rem;
  max-width: 68ch;
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
