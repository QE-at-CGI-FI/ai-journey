<script setup>
const props = defineProps({
  item: { type: Object, required: true }, // { id, label }
  value: { type: Object, required: true }, // { on, details }
  removable: { type: Boolean, default: false },
})

const emit = defineEmits(['toggle', 'update:details', 'remove'])
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

      <span class="enabler-item__label">{{ item.label }}</span>

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
</style>
