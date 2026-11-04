<template>
  <div v-if="mode === 'read'" class="record-details">
    <div v-for="field in props.fields" :key="field.key" class="record-details__row">
      <span class="record-details__label">{{ field.label }}</span>
      <span class="record-details__value">{{ displayValue(field) }}</span>
    </div>
  </div>

  <el-form
    v-else
    ref="formRef"
    :model="model"
    :disabled="saving"
    :rules="recordRules"
    label-position="top"
    class="record-form"
    @validate="handleValidation"
    @submit.prevent
  >
    <el-form-item
      v-for="field in props.fields"
      :key="field.key"
      :label="field.label"
      :prop="field.key"
    >
      <RecordFieldControl
        :ref="(instance) => registerControl(field.key, instance)"
        :field="field"
        :value="model[field.key]"
        :options="options[field.key] ?? []"
        :loading="loadingOptions[field.key] ?? false"
        :error="optionErrors[field.key]"
        @retry="emit('retry-options', field.key)"
        @update:value="emit('update:field', field.key, $event)"
        @change="emit('field-change', field.key)"
        @warning="emit('warning', field.key, $event)"
      />
    </el-form-item>
  </el-form>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { FormInstance } from 'element-plus'
import RecordFieldControl from '@/components/RecordFieldControl.vue'
import { type RecordFieldKey, type RecordItem } from '@/domain/record'
import { type SelectOption } from '@/forms/types'
import { recordFields, recordRules, type RecordField } from '@/forms/recordForm'
import type { RecordFormMode } from '@/composables/useRecordForm'

const props = withDefaults(
  defineProps<{
    saving: boolean
    fields?: RecordField[]
    model: RecordItem
    mode: RecordFormMode
    options: Record<string, SelectOption[]>
    loadingOptions: Record<string, boolean>
    optionErrors: Record<string, string>
  }>(),
  {
    fields: () => recordFields,
  },
)
const emit = defineEmits<{
  'retry-options': [key: RecordFieldKey]
  'update:field': [key: RecordFieldKey, value: string]
  'field-change': [key: RecordFieldKey]
  validated: [key: RecordFieldKey, isValid: boolean, message: string]
  warning: [key: RecordFieldKey, message: string]
}>()

const formRef = ref<FormInstance>()
const controlRefs = new Map<RecordFieldKey, { focus: () => void }>()

function registerControl(key: RecordFieldKey, instance: unknown) {
  const control = instance as { focus?: () => void } | null
  if (control?.focus) controlRefs.set(key, control as { focus: () => void })
  else controlRefs.delete(key)
}

function handleValidation(prop: string, isValid: boolean, message: string) {
  emit('validated', prop as RecordFieldKey, isValid, message)
}

async function validate() {
  if (props.mode !== 'edit' || !formRef.value) return false

  try {
    return await formRef.value.validate()
  } catch {
    return false
  }
}

function displayValue(field: RecordField) {
  const value = props.model[field.key]
  if (!value) return 'Sin información'
  if (field.type !== 'select') return value
  return props.options[field.key]?.find((option) => option.value === value)?.label ?? value
}

function focusField(key: RecordFieldKey) {
  controlRefs.get(key)?.focus()
}

defineExpose({ validate, focusField })
</script>

<style scoped>
.record-details {
  max-width: 720px;
}

.record-details__row {
  display: grid;
  grid-template-columns: minmax(120px, 180px) 1fr;
  gap: 24px;
  padding: 18px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.record-details__label {
  color: var(--el-text-color-secondary);
}

.record-details__value {
  color: var(--el-text-color-primary);
  overflow-wrap: anywhere;
}

.record-form {
  max-width: 560px;
}

.record-form__control {
  width: 100%;
}

@media (max-width: 540px) {
  .record-details__row {
    grid-template-columns: 1fr;
    gap: 6px;
  }
}
</style>
