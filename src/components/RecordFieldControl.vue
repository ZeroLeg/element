<template>
  <div ref="controlRoot" class="field-control-wrap">
    <el-date-picker
      v-if="field.type === 'date'"
      :model-value="value"
      type="date"
      value-format="YYYY-MM-DD"
      :placeholder="field.placeholder"
      class="field-control"
      @update:model-value="emit('update:value', $event ?? '')"
      @change="emit('change')"
    />
    <el-select
      v-else-if="field.type === 'select'"
      :model-value="value"
      :placeholder="field.placeholder"
      :loading="loading"
      clearable
      class="field-control"
      @update:model-value="emit('update:value', $event ?? '')"
      @change="emit('change')"
    >
      <el-option
        v-for="option in options"
        :key="option.value"
        :label="option.label"
        :value="option.value"
      />
    </el-select>
    <el-input
      v-else
      :model-value="value"
      :placeholder="field.placeholder"
      class="field-control"
      @update:model-value="emit('update:value', $event ?? '')"
      @change="emit('change')"
    />
    <div v-if="error" role="alert" class="field-error">
      {{ error }}
      <button type="button" @click="emit('retry')">Reintentar</button>
    </div>
    <span v-if="warning" class="field-warning" role="status">{{ warning }}</span>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import type { SelectOption } from '@/forms/types'
import type { RecordField } from '@/forms/recordForm'

const props = defineProps<{
  field: RecordField
  value: string
  options: SelectOption[]
  error?: string
  loading: boolean
}>()

const warning = computed(() => {
  const { field, value } = props
  if (!field.pattern || !field.patternMessage || !value) return ''

  const flags = field.pattern.flags.replace(/[gy]/g, '')
  return new RegExp(field.pattern.source, flags).test(value) ? '' : field.patternMessage
})

const controlRoot = ref<HTMLElement>()

const emit = defineEmits<{
  'update:value': [value: string]
  retry: []
  change: []
  warning: [message: string]
}>()

watch(warning, (message) => emit('warning', message), { immediate: true })

function focus() {
  controlRoot.value?.scrollIntoView({ block: 'center', behavior: 'smooth' })
  controlRoot.value?.querySelector<HTMLInputElement>('input')?.focus()
}

defineExpose({ focus })
</script>

<style scoped>
.field-control-wrap {
  display: grid;
  width: 100%;
  gap: 4px;
}

.field-control {
  width: 100%;
  min-width: 100px;
}

.field-error {
  color: var(--el-color-danger);
  font-size: 12px;
}

.field-warning {
  color: #a66a00;
  font-size: 12px;
  line-height: 1.4;
}
</style>
