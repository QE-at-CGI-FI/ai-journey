<script setup>
import { ref } from 'vue'

const props = defineProps({
  store: { type: Object, required: true },
})

const { state, addAction, removeAction, reorderAction } = props.store

const showForm = ref(false)
const title = ref('')
const description = ref('')
const timeline = ref('')

const draggedIndex = ref(null)
const dragOverIndex = ref(null)

function submit() {
  if (!title.value.trim()) return
  addAction(title.value, description.value, timeline.value)
  title.value = ''
  description.value = ''
  timeline.value = ''
  showForm.value = false
}

function cancel() {
  title.value = ''
  description.value = ''
  timeline.value = ''
  showForm.value = false
}

function onDragStart(index) {
  draggedIndex.value = index
}

function onDragEnter(index) {
  dragOverIndex.value = index
}

function onDrop(index) {
  if (draggedIndex.value !== null && draggedIndex.value !== index) {
    reorderAction(draggedIndex.value, index)
  }
  draggedIndex.value = null
  dragOverIndex.value = null
}

function onDragEnd() {
  draggedIndex.value = null
  dragOverIndex.value = null
}
</script>

<template>
  <div class="tab-panel">
    <header class="actions-header">
      <h2>Actions ({{ state.actions.length }})</h2>
      <button type="button" class="btn-outline" @click="showForm = !showForm">
        + Add action
      </button>
    </header>

    <form v-if="showForm" class="action-form" @submit.prevent="submit">
      <input v-model="title" type="text" placeholder="Action title" />
      <textarea v-model="description" placeholder="What needs to happen…" rows="2" />
      <input v-model="timeline" type="text" placeholder="Timeline, e.g. Q3 2026" />
      <div class="action-form__buttons">
        <button type="submit" class="btn-outline">Add</button>
        <button type="button" class="btn-text" @click="cancel">Cancel</button>
      </div>
    </form>

    <p v-if="!state.actions.length" class="empty">
      No actions planned yet — add one to get started.
    </p>

    <ul v-else class="action-list">
      <li
        v-for="(action, index) in state.actions"
        :key="action.id"
        class="action-card"
        :class="{ 'action-card--over': dragOverIndex === index && draggedIndex !== index }"
        draggable="true"
        @dragstart="onDragStart(index)"
        @dragover.prevent
        @dragenter.prevent="onDragEnter(index)"
        @drop.prevent="onDrop(index)"
        @dragend="onDragEnd"
      >
        <span class="action-card__handle" title="Drag to reorder">≡</span>
        <div class="action-card__body">
          <h3>{{ action.title }}</h3>
          <p v-if="action.description">{{ action.description }}</p>
          <div v-if="action.timeline" class="action-card__meta">
            <span class="action-card__label">Timeline</span>
            <span class="action-card__timeline">{{ action.timeline }}</span>
          </div>
        </div>
        <button
          type="button"
          class="action-card__remove"
          title="Remove action"
          aria-label="Remove action"
          @click="removeAction(action.id)"
        >
          ×
        </button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.tab-panel {
  max-width: 860px;
}

.actions-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.actions-header h2 {
  margin: 0;
  color: var(--cgi-grey-900);
}

.empty {
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.action-form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  padding: 0.9rem 1rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
}

.action-form input,
.action-form textarea {
  padding: 0.4rem 0.6rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  font-size: 0.88rem;
  font-family: inherit;
  color: var(--color-text);
  background: var(--color-surface);
  resize: vertical;
}

.action-form input:focus,
.action-form textarea:focus {
  outline: 2px solid var(--cgi-purple);
  outline-offset: 1px;
}

.action-form__buttons {
  display: flex;
  gap: 0.5rem;
}

.btn-text {
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  font-size: 0.82rem;
  font-weight: 600;
  padding: 0.35rem 0.6rem;
}

.btn-text:hover {
  color: var(--cgi-red);
}

.action-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.action-card {
  display: flex;
  align-items: stretch;
  gap: 0.75rem;
  padding: 1rem 1.1rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  transition: border-color 0.15s ease, background 0.15s ease;
}

.action-card--over {
  border-color: var(--cgi-purple);
  background: color-mix(in srgb, var(--cgi-purple) 6%, var(--color-surface));
}

.action-card__handle {
  cursor: grab;
  color: var(--color-text-muted);
  font-size: 1rem;
  line-height: 1;
  padding-top: 0.15rem;
  user-select: none;
}

.action-card__handle:active {
  cursor: grabbing;
}

.action-card__body {
  flex: 1;
  min-width: 0;
}

.action-card__body h3 {
  margin: 0 0 0.3rem;
  font-size: 0.98rem;
  color: var(--color-text);
}

.action-card__body p {
  margin: 0 0 0.6rem;
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.action-card__meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.action-card__label {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.action-card__timeline {
  font-size: 0.78rem;
  font-weight: 600;
  padding: 0.15rem 0.6rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--cgi-purple) 12%, var(--color-surface));
  color: var(--cgi-purple);
}

.action-card__remove {
  flex-shrink: 0;
  align-self: flex-start;
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  font-size: 1.2rem;
  line-height: 1;
  padding: 0 0.3rem;
  border-radius: 4px;
}

.action-card__remove:hover {
  background: var(--cgi-grey-100);
  color: var(--cgi-red);
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
