<template>
  <el-form
    ref="formRef"
    :model="editModels"
    :disabled="saving"
    @validate="handleValidation"
    @submit.prevent
  >
    <el-table :data="rows" row-key="id" class="records-table" empty-text="No hay registros">
      <el-table-column prop="id" label="Referencia" min-width="130" fixed="left" />
      <el-table-column
        v-for="field in recordFields"
        :key="field.key"
        :prop="field.key"
        :label="field.label"
        :min-width="columnWidth(field.key)"
      >
        <template #default="{ row }">
          <el-form-item
            v-if="editorFor(row.id)"
            :prop="`${row.id}.${field.key}`"
            :rules="recordRules[field.key]"
            class="inline-field"
          >
            <RecordFieldControl
              :ref="(instance) => registerControl(row.id, field.key, instance)"
              :field="field"
              :value="editorFor(row.id).model[field.key]"
              :options="editorFor(row.id).options[field.key] ?? []"
              :loading="editorFor(row.id).loadingOptions[field.key] ?? false"
              :error="editorFor(row.id).optionErrors[field.key]"
              @retry="emit('retry-options', row.id, field.key)"
              @update:value="emit('update-field', row.id, field.key, $event)"
              @change="emit('field-change', row.id, field.key)"
              @warning="emit('warning', row.id, field.key, $event)"
            />
          </el-form-item>
          <span v-else>{{ row[field.key] || 'Sin información' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Acciones" width="230" align="right" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link :disabled="saving" @click="emit('open', row.id)"
            >Ver</el-button
          >
          <el-button link :disabled="saving" @click="emit('edit', row)">
            {{ editors[row.id] ? 'Cancelar' : 'Editar' }}
          </el-button>
          <el-button type="danger" link :disabled="saving" @click="emit('delete', row.id)"
            >Eliminar</el-button
          >
        </template>
      </el-table-column>
    </el-table>
  </el-form>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { FormInstance } from 'element-plus'
import RecordFieldControl from '@/components/RecordFieldControl.vue'
import { type RecordFieldKey, type RecordItem } from '@/domain/record'
import { recordFields, recordRules } from '@/forms/recordForm'
import type { SelectOption } from '@/forms/types'

interface RowEditor {
  model: RecordItem
  options: Record<string, SelectOption[]>
  loadingOptions: Record<string, boolean>
  optionErrors: Record<string, string>
}

const props = defineProps<{
  saving: boolean
  rows: RecordItem[]
  editors: Record<string, RowEditor>
  editModels: Record<string, RecordItem>
}>()
const emit = defineEmits<{
  open: [id: string]
  edit: [record: RecordItem]
  delete: [id: string]
  'retry-options': [id: string, key: RecordFieldKey]
  'update-field': [id: string, key: RecordFieldKey, value: string]
  'field-change': [id: string, key: RecordFieldKey]
  validated: [id: string, key: RecordFieldKey, isValid: boolean, message: string]
  warning: [id: string, key: RecordFieldKey, message: string]
}>()

const formRef = ref<FormInstance>()
const controlRefs = new Map<string, { focus: () => void }>()

function columnWidth(key: RecordFieldKey) {
  return key === 'address' ? 240 : key === 'name' ? 180 : 145
}

function editorFor(id: string) {
  return props.editors[id]!
}

function registerControl(rowId: string, fieldKey: RecordFieldKey, instance: unknown) {
  const control = instance as { focus?: () => void } | null
  const key = `${rowId}.${fieldKey}`
  if (control?.focus) controlRefs.set(key, control as { focus: () => void })
  else controlRefs.delete(key)
}

function handleValidation(prop: string, isValid: boolean, message: string) {
  const separator = prop.lastIndexOf('.')
  const rowId = prop.slice(0, separator)
  const fieldKey = prop.slice(separator + 1) as RecordFieldKey
  emit('validated', rowId, fieldKey, isValid, message)
}

async function validate(rowIds: string[]) {
  if (!formRef.value) return false

  try {
    const results = await Promise.all(
      rowIds.flatMap((id) =>
        recordFields.map((field) => formRef.value!.validateField(`${id}.${field.key}`)),
      ),
    )
    return results.every(Boolean)
  } catch {
    return false
  }
}

function focusField(rowId: string, fieldKey: RecordFieldKey) {
  controlRefs.get(`${rowId}.${fieldKey}`)?.focus()
}

defineExpose({ validate, focusField })
</script>

<style scoped>
.records-table {
  width: 100%;
}

.inline-field {
  margin-bottom: 0;
}
</style>
