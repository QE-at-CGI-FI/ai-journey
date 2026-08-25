<script setup>
import { ref } from 'vue'
import { badgeTiers } from '../data/badgeTiers.js'

const props = defineProps({
  store: { type: Object, required: true },
})

const { state, awardBadge, revokeBadge } = props.store

const dragOverTier = ref(null)

function onDragStart(event, individualId) {
  event.dataTransfer.setData('text/plain', individualId)
  event.dataTransfer.effectAllowed = 'copy'
}

function onDragEnter(tierId) {
  dragOverTier.value = tierId
}

function onDragLeave(tierId) {
  if (dragOverTier.value === tierId) dragOverTier.value = null
}

function onDrop(event, tierId) {
  const individualId = event.dataTransfer.getData('text/plain')
  if (individualId) awardBadge(individualId, tierId)
  dragOverTier.value = null
}

function membersFor(tierId) {
  return state.individuals.filter((ind) => ind.badges.includes(tierId))
}
</script>

<template>
  <div class="tab-panel">
    <div class="tab-intro">
      <h2>Badges</h2>
      <p>
        Recognize individuals by dragging their card onto a badge. The same person can hold
        several badges at once — drag them onto every one that applies.
      </p>
    </div>

    <p v-if="!state.individuals.length" class="empty">
      No one tracked yet — add people on the Individual tab to award badges here.
    </p>

    <template v-else>
      <section class="people">
        <h3>People</h3>
        <div class="people__list">
          <div
            v-for="ind in state.individuals"
            :key="ind.id"
            class="person-card"
            draggable="true"
            @dragstart="onDragStart($event, ind.id)"
          >
            {{ ind.name || 'Unnamed' }}
          </div>
        </div>
      </section>

      <div class="tier-grid">
        <section
          v-for="tier in badgeTiers"
          :key="tier.id"
          class="tier"
          :class="{ 'tier--over': dragOverTier === tier.id }"
          @dragover.prevent
          @dragenter.prevent="onDragEnter(tier.id)"
          @dragleave="onDragLeave(tier.id)"
          @drop.prevent="onDrop($event, tier.id)"
        >
          <header class="tier__header">
            <h4>{{ tier.label }}</h4>
            <span class="tier__count">{{ membersFor(tier.id).length }}</span>
          </header>
          <div class="tier__dropzone">
            <p v-if="!membersFor(tier.id).length" class="tier__hint">Drag a person here</p>
            <div v-for="ind in membersFor(tier.id)" :key="ind.id" class="badge-chip">
              <span>{{ ind.name || 'Unnamed' }}</span>
              <button
                type="button"
                class="badge-chip__remove"
                title="Remove badge"
                aria-label="Remove badge"
                @click="revokeBadge(ind.id, tier.id)"
              >
                ×
              </button>
            </div>
          </div>
        </section>
      </div>
    </template>
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
  margin: 0;
  color: var(--color-text-muted);
  font-size: 0.92rem;
  max-width: 68ch;
}

.empty {
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.people {
  margin-bottom: 1.5rem;
}

.people h3 {
  margin: 0 0 0.6rem;
  font-size: 1.02rem;
  color: var(--cgi-purple);
  border-bottom: 2px solid var(--cgi-grey-300);
  padding-bottom: 0.35rem;
}

.people__list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.person-card {
  cursor: grab;
  user-select: none;
  padding: 0.5rem 0.9rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-surface);
  font-weight: 600;
  font-size: 0.88rem;
  color: var(--color-text);
}

.person-card:active {
  cursor: grabbing;
}

.tier-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.tier {
  border: 1px dashed var(--color-border);
  border-radius: 10px;
  padding: 0.75rem;
  background: var(--cgi-grey-100);
  transition: border-color 0.15s ease, background 0.15s ease;
}

.tier--over {
  border-color: var(--cgi-purple);
  background: color-mix(in srgb, var(--cgi-purple) 8%, var(--cgi-grey-100));
}

.tier__header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.6rem;
}

.tier__header h4 {
  margin: 0;
  font-size: 0.92rem;
  color: var(--cgi-purple);
}

.tier__count {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.1rem 0.5rem;
  border-radius: 999px;
  background: var(--color-surface);
  color: var(--color-text-muted);
}

.tier__dropzone {
  min-height: 3rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.tier__hint {
  margin: 0;
  font-size: 0.78rem;
  color: var(--color-text-muted);
  font-style: italic;
}

.badge-chip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.4rem 0.7rem;
  border-radius: 8px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text);
}

.badge-chip__remove {
  flex-shrink: 0;
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  font-size: 1rem;
  line-height: 1;
  padding: 0 0.3rem;
  border-radius: 4px;
}

.badge-chip__remove:hover {
  background: var(--cgi-grey-100);
  color: var(--cgi-red);
}
</style>
