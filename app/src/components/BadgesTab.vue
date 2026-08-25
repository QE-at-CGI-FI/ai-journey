<script setup>
import { ref } from 'vue'
import { badgeTiers } from '../data/badgeTiers.js'

const props = defineProps({
  store: { type: Object, required: true },
})

const { state, awardBadge, revokeBadge, individualExperiencePct, displayIndividualName } = props.store

const baseUrl = import.meta.env.BASE_URL
const dragOverTier = ref(null)
const activeInfo = ref(null)

function openInfo(tier) {
  activeInfo.value = tier
}

function closeInfo() {
  activeInfo.value = null
}

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
            {{ displayIndividualName(ind) }} {{ individualExperiencePct(ind) }}%
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
            <h4>
              {{ tier.label }}
              <button
                v-if="tier.image"
                type="button"
                class="tier__info-btn"
                :aria-label="`Show ${tier.label} details`"
                :title="`Show ${tier.label} details`"
                @click="openInfo(tier)"
              >
                ⓘ
              </button>
            </h4>
            <span class="tier__count">{{ membersFor(tier.id).length }}</span>
          </header>
          <p v-if="tier.tagline" class="tier__tagline">{{ tier.tagline }}</p>
          <div class="tier__dropzone">
            <p v-if="!membersFor(tier.id).length" class="tier__hint">Drag a person here</p>
            <div v-for="ind in membersFor(tier.id)" :key="ind.id" class="badge-chip">
              <span>{{ displayIndividualName(ind) }} {{ individualExperiencePct(ind) }}%</span>
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

    <Teleport to="body">
      <div
        v-if="activeInfo"
        class="info-overlay"
        role="dialog"
        aria-modal="true"
        :aria-label="activeInfo.label"
        tabindex="-1"
        @click.self="closeInfo"
        @keydown.esc="closeInfo"
      >
        <div class="info-overlay__panel">
          <button
            type="button"
            class="info-overlay__close"
            aria-label="Close"
            title="Close"
            @click="closeInfo"
          >
            ×
          </button>
          <img
            class="info-overlay__image"
            :src="baseUrl + activeInfo.image"
            :alt="`${activeInfo.label} badge criteria`"
          />
        </div>
      </div>
    </Teleport>
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
  margin-bottom: 0.3rem;
}

.tier__tagline {
  margin: 0 0 0.6rem;
  font-size: 0.78rem;
  font-style: italic;
  line-height: 1.4;
  color: var(--color-text-muted);
}

.tier__header h4 {
  margin: 0;
  font-size: 0.92rem;
  color: var(--cgi-purple);
}

.tier__info-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: 0.3rem;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--cgi-purple);
  font-size: 0.85rem;
  line-height: 1;
  vertical-align: middle;
  padding: 0.1rem;
  transition: transform 0.1s ease;
}

.tier__info-btn:hover {
  background: var(--cgi-grey-100);
  transform: scale(1.15);
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

.info-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: rgba(0, 0, 0, 0.6);
}

.info-overlay:focus {
  outline: none;
}

.info-overlay__panel {
  position: relative;
  max-width: min(90vw, 960px);
  max-height: 90vh;
  background: var(--cgi-white);
  border-radius: 10px;
  padding: 1.25rem;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.35);
  overflow: auto;
}

.info-overlay__close {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 50%;
  background: var(--cgi-grey-100);
  color: var(--color-text);
  font-size: 1.2rem;
  line-height: 1;
}

.info-overlay__close:hover {
  background: var(--cgi-red);
  color: var(--cgi-white);
}

.info-overlay__image {
  display: block;
  max-width: 100%;
  max-height: 80vh;
}
</style>
