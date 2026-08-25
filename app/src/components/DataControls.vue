<script setup>
import { ref } from 'vue'

defineProps({
  anonymized: { type: Boolean, default: true },
})
const emit = defineEmits(['export', 'import', 'reset', 'print-report', 'toggle-anonymize'])
const fileInput = ref(null)
const errorMsg = ref('')

function triggerImport() {
  errorMsg.value = ''
  fileInput.value?.click()
}

function onFileChosen(event) {
  const file = event.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    try {
      emit('import', reader.result)
      errorMsg.value = ''
    } catch (err) {
      errorMsg.value = 'Could not read that file — is it a valid export from this app?'
    }
  }
  reader.onerror = () => {
    errorMsg.value = 'Could not read that file.'
  }
  reader.readAsText(file)
  event.target.value = ''
}
</script>

<template>
  <div class="data-controls">
    <button
      type="button"
      class="btn-secondary"
      :class="{ 'btn-secondary--active': anonymized }"
      :title="anonymized ? 'Names are hidden — click to show real names' : 'Click to hide organization and people names'"
      @click="emit('toggle-anonymize')"
    >
      {{ anonymized ? '🙈 Anonymized' : '👁 Show names' }}
    </button>
    <button type="button" class="btn-secondary" @click="emit('print-report')">🖨 Print report</button>
    <button type="button" class="btn-primary" @click="emit('export')">↓ Export</button>
    <button type="button" class="btn-secondary" @click="triggerImport">↑ Import</button>
    <input
      ref="fileInput"
      type="file"
      accept="application/json,.json"
      class="visually-hidden"
      @change="onFileChosen"
    />
    <button type="button" class="btn-danger" @click="emit('reset')">Clear data</button>
    <span v-if="errorMsg" class="error">{{ errorMsg }}</span>
  </div>
</template>

<style scoped>
.data-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

button {
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
  background: var(--cgi-white);
  color: var(--cgi-purple);
  border-color: var(--cgi-purple);
}

.btn-secondary:hover {
  background: var(--cgi-purple);
  color: var(--cgi-white);
}

.btn-secondary--active {
  background: var(--cgi-purple);
  color: var(--cgi-white);
}

.btn-danger {
  background: transparent;
  color: var(--color-text-muted);
  border-color: var(--color-border);
}

.btn-danger:hover {
  color: var(--cgi-red);
  border-color: var(--cgi-red);
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
}

.error {
  color: var(--cgi-red);
  font-size: 0.78rem;
}
</style>
