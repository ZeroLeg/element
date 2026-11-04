<template>
  <section v-if="items.length" class="feedback-summary" aria-label="Incidencias del formulario">
    <h2 class="feedback-summary__title">
      Revisa {{ items.length }} {{ items.length === 1 ? 'incidencia' : 'incidencias' }}
    </h2>
    <ul class="feedback-summary__list">
      <li v-for="item in items" :key="`${item.kind}:${item.key}`">
        <button
          class="feedback-summary__item"
          :class="`feedback-summary__item--${item.kind}`"
          type="button"
          @click="emit('select', item)"
        >
          <span class="feedback-summary__label">
            {{ item.rowId ? `${item.rowId} · ` : '' }}
            {{ item.tabLabel ? `${item.tabLabel} · ` : '' }}{{ item.label }}
          </span>
          <span>{{ item.message }}</span>
        </button>
      </li>
    </ul>
  </section>
</template>

<script lang="ts" setup>
import type { FormFeedbackItem } from '@/composables/useFormFeedback'

defineProps<{ items: FormFeedbackItem[] }>()
const emit = defineEmits<{ select: [item: FormFeedbackItem] }>()
</script>

<style scoped>
.feedback-summary {
  margin: 0 0 24px;
  padding: 14px 16px;
  border: 1px solid #e8c66a;
  border-left: 4px solid #d59b18;
  background: #fff9e8;
}

.feedback-summary__title {
  margin: 0 0 8px;
  color: #604d1c;
  font-size: 15px;
  font-weight: 650;
}

.feedback-summary__list {
  display: grid;
  gap: 4px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.feedback-summary__item {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 3px 0;
  border: 0;
  background: none;
  color: #705714;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.feedback-summary__item:hover .feedback-summary__label,
.feedback-summary__item:focus-visible .feedback-summary__label {
  text-decoration: underline;
}

.feedback-summary__item--error {
  color: #a33b2f;
}

.feedback-summary__label {
  font-weight: 650;
}
</style>
