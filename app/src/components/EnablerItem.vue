<script setup>
import { nextTick, ref, watch } from 'vue'

const props = defineProps({
  item: { type: Object, required: true }, // { id, label, info?: Array<{ id, label, image, alt }> }
  value: { type: Object, required: true }, // { on, details }
  removable: { type: Boolean, default: false },
})

const emit = defineEmits(['toggle', 'update:details', 'remove'])

const baseUrl = import.meta.env.BASE_URL
const activeInfo = ref(null)
const overlayEl = ref(null)

function openInfo(info) {
  activeInfo.value = info
}

function closeInfo() {
  activeInfo.value = null
}

function onOverlayKeydown(event) {
  if (event.key === 'Escape') closeInfo()
}

watch(activeInfo, async (info) => {
  if (!info) return
  await nextTick()
  overlayEl.value?.focus()
})
</script>

<template>
  <div class="enabler-item" :class="{ 'is-on': value.on }">
    <div class="enabler-item__row">
      <button
        type="button"
        class="toggle"
        :class="{ 'toggle--on': value.on }"
        role="switch"
        :aria-checked="value.on"
        :aria-label="`Toggle ${item.label}`"
        @click="emit('toggle')"
      >
        <span class="toggle__knob" />
      </button>

      <span class="enabler-item__label">
        {{ item.label }}
        <button
          v-for="info in item.info"
          :key="info.id"
          type="button"
          class="info-btn"
          :aria-label="`Show ${info.label}`"
          :title="info.label"
          @click="openInfo(info)"
        >
          i
        </button>
      </span>

      <span class="status-pill" :class="value.on ? 'status-pill--on' : 'status-pill--off'">
        {{ value.on ? 'Enabled' : 'Not yet' }}
      </span>

      <button
        v-if="removable"
        type="button"
        class="remove-btn"
        title="Remove custom item"
        aria-label="Remove custom item"
        @click="emit('remove')"
      >
        ×
      </button>
    </div>

    <textarea
      class="enabler-item__details"
      :value="value.details"
      placeholder="Document details, context, owner, links…"
      rows="2"
      @input="emit('update:details', $event.target.value)"
    />

    <Teleport to="body">
      <div
        v-if="activeInfo"
        ref="overlayEl"
        class="info-overlay"
        role="dialog"
        aria-modal="true"
        :aria-label="activeInfo.label"
        tabindex="-1"
        @click.self="closeInfo"
        @keydown="onOverlayKeydown"
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
            :alt="activeInfo.alt || activeInfo.label"
          />
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.enabler-item {
  border: 1px solid var(--color-border);
  border-left: 4px solid var(--color-border);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  background: var(--color-surface);
  transition: border-color 0.15s ease;
}

.enabler-item.is-on {
  border-left-color: var(--cgi-red);
}

.enabler-item__row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.enabler-item__label {
  flex: 1;
  font-size: 0.95rem;
  line-height: 1.35;
  color: var(--color-text);
}

.toggle {
  position: relative;
  flex-shrink: 0;
  width: 42px;
  height: 24px;
  border-radius: 999px;
  border: none;
  background: var(--cgi-grey-300);
  padding: 2px;
  transition: background 0.15s ease;
}

.toggle--on {
  background: var(--cgi-red);
}

.toggle__knob {
  display: block;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--cgi-white);
  transform: translateX(0);
  transition: transform 0.15s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.toggle--on .toggle__knob {
  transform: translateX(18px);
}

.status-pill {
  flex-shrink: 0;
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
}

.status-pill--on {
  background: color-mix(in srgb, var(--cgi-red) 15%, white);
  color: var(--cgi-red-dark);
}

.status-pill--off {
  background: var(--cgi-grey-100);
  color: var(--color-text-muted);
}

.remove-btn {
  flex-shrink: 0;
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  font-size: 1.1rem;
  line-height: 1;
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
}

.remove-btn:hover {
  background: var(--cgi-grey-100);
  color: var(--cgi-red);
}

.enabler-item__details {
  width: 100%;
  margin-top: 0.6rem;
  resize: vertical;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 0.5rem 0.6rem;
  font-size: 0.85rem;
  color: var(--color-text);
  background: var(--cgi-grey-100);
}

.enabler-item__details:focus {
  outline: 2px solid var(--cgi-purple);
  outline-offset: 1px;
  background: var(--cgi-white);
}

.info-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  margin-left: 0.4rem;
  border: 1px solid var(--cgi-purple);
  border-radius: 50%;
  background: transparent;
  color: var(--cgi-purple);
  font-size: 0.72rem;
  font-style: italic;
  font-weight: 700;
  line-height: 1;
  vertical-align: middle;
  flex-shrink: 0;
}

.info-btn:hover {
  background: var(--cgi-purple);
  color: var(--cgi-white);
}

.info-overlay:focus {
  outline: none;
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
