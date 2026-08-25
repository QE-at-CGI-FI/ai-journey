<script setup>
import { ref } from 'vue'
import EnablerItem from './EnablerItem.vue'

const props = defineProps({
  group: { type: Object, required: true }, // { id, title, items }
  customItems: { type: Array, default: () => [] },
  valueFor: { type: Function, required: true }, // (itemId) => { on, details }
  progress: { type: Object, required: true }, // { on, total }
})

const emit = defineEmits(['toggle', 'update:details', 'add-custom', 'remove-custom'])

const newLabel = ref('')

function submitCustom() {
  if (!newLabel.value.trim()) return
  emit('add-custom', newLabel.value)
  newLabel.value = ''
}
</script>

<template>
  <section class="enabler-group">
    <header class="enabler-group__header">
      <h3>{{ group.title }}</h3>
      <span class="progress">{{ progress.on }} / {{ progress.total }} enabled</span>
    </header>

    <div class="enabler-group__items">
      <EnablerItem
        v-for="item in group.items"
        :key="item.id"
        :item="item"
        :value="valueFor(item.id)"
        @toggle="emit('toggle', item.id)"
        @update:details="(text) => emit('update:details', item.id, text)"
      />

      <EnablerItem
        v-for="item in customItems"
        :key="item.id"
        :item="item"
        :value="valueFor(item.id)"
        removable
        @toggle="emit('toggle', item.id)"
        @update:details="(text) => emit('update:details', item.id, text)"
        @remove="emit('remove-custom', item.id)"
      />
    </div>

    <form class="add-custom" @submit.prevent="submitCustom">
      <input
        v-model="newLabel"
        type="text"
        :placeholder="`Add a custom item to ${group.title}…`"
      />
      <button type="submit" class="btn-outline">+ Add</button>
    </form>
  </section>
</template>

<style scoped>
.enabler-group {
  margin-bottom: 1.75rem;
}

.enabler-group__header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  border-bottom: 2px solid var(--cgi-grey-300);
  padding-bottom: 0.35rem;
  margin-bottom: 0.75rem;
}

.enabler-group__header h3 {
  margin: 0;
  font-size: 1.02rem;
  color: var(--cgi-purple);
}

.progress {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--color-text-muted);
}

.enabler-group__items {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.add-custom {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.6rem;
}

.add-custom input {
  flex: 1;
  padding: 0.4rem 0.6rem;
  border: 1px dashed var(--color-border);
  border-radius: 6px;
  font-size: 0.85rem;
  background: var(--color-surface);
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
