<template>
  <main class="page-content">
    <div class="page-heading">
      <div>
        <p class="eyebrow">GESTIÓN</p>
        <h1>Registros</h1>
        <p class="page-description">Consulta la información de los registros disponibles.</p>
      </div>
      <span class="record-count">{{ records.length }} registros</span>
    </div>

    <ValidationSummary :items="feedbackItems" @select="focusFeedback" />

    <TableComponent
      ref="tableRef"
      :rows="records"
      :saving="isSaving"
      :editors="editors"
      :edit-models="editModels"
      @retry-options="(id, key) => editors[id]?.refreshOptions(key)"
      @open="openRecord"
      @edit="editRecord"
      @delete="deleteRecord"
      @update-field="updateRowField"
      @field-change="changeRowField"
      @validated="handleRowValidation"
      @warning="handleRowWarning"
    />

    <div v-if="pendingRows.length" class="table-footer">
      <span>{{ pendingRows.length }} filas con cambios sin guardar</span>
      <el-button type="primary" :loading="isSaving" @click="saveChanges">
        Guardar cambios
      </el-button>
    </div>
  </main>
</template>

<script lang="ts" setup>
import { nextTick, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import TableComponent from '@/components/TableComponent.vue'
import ValidationSummary from '@/components/ValidationSummary.vue'
import { type RecordFieldKey, type RecordItem } from '@/domain/record'
import { recordFields } from '@/forms/recordForm'
import { useRecordTableEditing } from '@/composables/useRecordTableEditing'
import { useUnsavedChangesGuard } from '@/composables/useUnsavedChangesGuard'
import { useFormFeedback, type FormFeedbackItem } from '@/composables/useFormFeedback'
import { useRecordsStore } from '@/stores/records'

const router = useRouter()
const recordsStore = useRecordsStore()
const { records } = storeToRefs(recordsStore)
const editing = useRecordTableEditing()
const {
  editors,
  editModels,
  pendingRows,
  updateField: updateRowField,
  fieldChanged: changeRowField,
} = editing
useUnsavedChangesGuard(() => pendingRows.value.length > 0)
const tableRef = ref<InstanceType<typeof TableComponent> | null>(null)
const isSaving = ref(false)
const feedback = useFormFeedback()
const { items: feedbackItems } = feedback

function fieldLabel(key: RecordFieldKey) {
  return recordFields.find((field) => field.key === key)?.label ?? key
}

function openRecord(id: string) {
  router.push({ name: 'record-detail', params: { id } })
}

async function editRecord(record: RecordItem) {
  if (editors[record.id]) {
    editing.stopEditing(record.id)
    feedback.clearRow(record.id)
    return
  }

  await editing.startEditing(record)
}

function handleRowValidation(
  rowId: string,
  fieldKey: RecordFieldKey,
  isValid: boolean,
  message: string,
) {
  feedback.setError({
    key: `${rowId}.${fieldKey}`,
    rowId,
    fieldKey,
    label: fieldLabel(fieldKey),
    message: isValid ? '' : message,
  })
}

function handleRowWarning(rowId: string, fieldKey: RecordFieldKey, message: string) {
  feedback.setWarning({
    key: `${rowId}.${fieldKey}`,
    rowId,
    fieldKey,
    label: fieldLabel(fieldKey),
    message,
  })
}

async function focusFeedback(item: FormFeedbackItem) {
  if (!item.rowId) return

  if (!editors[item.rowId]) {
    const record = records.value.find((candidate) => candidate.id === item.rowId)
    if (!record) return
    await editRecord(record)
  }

  await nextTick()
  tableRef.value?.focusField(item.rowId, item.fieldKey as RecordFieldKey)
}

async function saveChanges() {
  const rowsToSave = pendingRows.value
  if (!rowsToSave.length || isSaving.value) return

  isSaving.value = true
  try {
    const savedIds = await editing.saveChanges(
      async (ids) => (await tableRef.value?.validate(ids)) ?? false,
      recordsStore.updateRecords,
    )
    for (const id of savedIds) feedback.clearRow(id)
    if (savedIds.length) ElMessage.success(`${savedIds.length} filas guardadas`)
  } catch {
    ElMessage.error('No se pudieron guardar los cambios. Vuelve a intentarlo.')
  } finally {
    isSaving.value = false
  }
}

async function deleteRecord(id: string) {
  try {
    await ElMessageBox.confirm('Esta acción no se puede deshacer.', 'Eliminar registro', {
      type: 'warning',
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
    })
    editing.stopEditing(id)
    feedback.clearRow(id)
    recordsStore.deleteRecord(id)
    ElMessage.success('Registro eliminado')
  } catch {
    return
  }
}
</script>

<style scoped>
.page-content {
  width: min(1120px, 100%);
  margin: 0 auto;
  padding: 48px 32px;
}

.page-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 28px;
}

.eyebrow {
  margin: 0 0 8px;
  color: var(--el-color-primary);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

h1 {
  margin: 0;
  color: #183b3a;
  font-size: 30px;
  font-weight: 650;
}

.page-description {
  margin: 8px 0 0;
  color: #667876;
}

.record-count {
  flex: none;
  padding-bottom: 3px;
  color: #667876;
  font-size: 14px;
}

.table-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 18px;
  padding: 18px 0;
  color: #667876;
  font-size: 14px;
}

@media (max-width: 640px) {
  .page-content {
    padding: 32px 18px;
  }

  .page-heading {
    align-items: flex-start;
    flex-direction: column;
    gap: 10px;
  }

  .table-footer {
    align-items: flex-end;
    flex-direction: column-reverse;
  }
}
</style>
