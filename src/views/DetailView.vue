<template>
  <main class="page-content">
    <el-button class="back-button" text @click="router.push({ name: 'record-list' })">
      Volver a registros
    </el-button>

    <template v-if="record">
      <div class="page-heading">
        <div>
          <p class="eyebrow">REGISTRO {{ record.id }}</p>
          <h1>{{ isEditing ? 'Editar registro' : 'Detalle del registro' }}</h1>
        </div>
        <div class="heading-actions">
          <template v-if="isEditing">
            <el-button :disabled="isSaving" @click="cancelRecordEditing">Cancelar</el-button>
            <el-button type="primary" :loading="isSaving" @click="saveRecord">
              Guardar cambios
            </el-button>
          </template>
          <el-button v-else type="primary" @click="startEditing">Editar</el-button>
        </div>
      </div>

      <ValidationSummary :items="feedbackItems" @select="focusFeedback" />

      <el-tabs v-model="activeTab" class="detail-tabs">
        <el-tab-pane label="Datos generales" name="general">
          <FormComponent
            :ref="(instance) => registerForm('general', instance)"
            :fields="fieldsByTab.general"
            :model="model"
            :saving="isSaving"
            :mode="mode"
            :options="options"
            :loading-options="loadingOptions"
            :option-errors="optionErrors"
            @retry-options="refreshOptions"
            @update:field="updateField"
            @field-change="fieldChanged"
            @validated="handleValidation"
            @warning="handleWarning"
          />
        </el-tab-pane>
        <el-tab-pane label="Edificios" name="buildings">
          <FormComponent
            v-if="fieldsByTab.buildings.length"
            :ref="(instance) => registerForm('buildings', instance)"
            :fields="fieldsByTab.buildings"
            :model="model"
            :saving="isSaving"
            :mode="mode"
            :options="options"
            :loading-options="loadingOptions"
            :option-errors="optionErrors"
            @retry-options="refreshOptions"
            @update:field="updateField"
            @field-change="fieldChanged"
            @validated="handleValidation"
            @warning="handleWarning"
          />
          <el-empty v-else description="No hay edificios asociados" />
        </el-tab-pane>
      </el-tabs>
    </template>

    <el-empty v-else description="No se encontró el registro">
      <el-button type="primary" @click="router.push({ name: 'record-list' })">
        Volver a registros
      </el-button>
    </el-empty>
  </main>
</template>

<script lang="ts" setup>
import { computed, nextTick, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import FormComponent from '@/components/FormComponent.vue'
import ValidationSummary from '@/components/ValidationSummary.vue'
import { createEmptyRecord, type RecordFieldKey, type RecordItem } from '@/domain/record'
import { recordFields } from '@/forms/recordForm'
import { useUnsavedChangesGuard } from '@/composables/useUnsavedChangesGuard'
import { useRecordForm } from '@/composables/useRecordForm'
import { loadRecordOptions } from '@/data/recordOptions'
import { useFormFeedback, type FormFeedbackItem } from '@/composables/useFormFeedback'
import { useRecordsStore } from '@/stores/records'

const props = defineProps<{ id: string }>()
type DetailTabId = 'general' | 'buildings'

const detailTabs: Record<DetailTabId, string> = {
  general: 'Datos generales',
  buildings: 'Edificios',
}

const router = useRouter()
const recordsStore = useRecordsStore()
const record = computed(() => recordsStore.findById(props.id))
const activeTab = ref<DetailTabId>('general')
const fieldsByTab = computed(() => ({
  general: recordFields.filter((field) => (field.tabId ?? 'general') === 'general'),
  buildings: recordFields.filter((field) => field.tabId === 'buildings'),
}))
const {
  model,
  updateField,
  mode,
  isEditing,
  isDirty,
  optionErrors,
  refreshOptions,
  options,
  loadingOptions,
  load,
  fieldChanged,
  startEditing,
  cancelEditing: resetEditing,
  submit,
} = useRecordForm(createEmptyRecord(), recordFields, loadRecordOptions)
useUnsavedChangesGuard(isDirty)
const formRefs = new Map<DetailTabId, InstanceType<typeof FormComponent>>()
const isSaving = ref(false)
const feedback = useFormFeedback()
const { items: feedbackItems } = feedback

function fieldLabel(key: string) {
  return recordFields.find((field) => field.key === key)?.label ?? key
}

function fieldTab(key: string): DetailTabId {
  const tabId = recordFields.find((field) => field.key === key)?.tabId
  return tabId === 'buildings' ? 'buildings' : 'general'
}

function registerForm(tabId: DetailTabId, instance: unknown) {
  if (instance) formRefs.set(tabId, instance as InstanceType<typeof FormComponent>)
  else formRefs.delete(tabId)
}

function handleValidation(fieldKey: string, isValid: boolean, message: string) {
  feedback.setError({
    key: fieldKey,
    fieldKey,
    label: fieldLabel(fieldKey),
    tabId: fieldTab(fieldKey),
    tabLabel: detailTabs[fieldTab(fieldKey)],
    message: isValid ? '' : message,
  })
}

function handleWarning(fieldKey: string, message: string) {
  feedback.setWarning({
    key: fieldKey,
    fieldKey,
    label: fieldLabel(fieldKey),
    tabId: fieldTab(fieldKey),
    tabLabel: detailTabs[fieldTab(fieldKey)],
    message,
  })
}

function cancelRecordEditing() {
  resetEditing()
  feedback.clearAll()
}

async function focusFeedback(item: FormFeedbackItem) {
  const tabId = (item.tabId as DetailTabId | undefined) ?? 'general'
  activeTab.value = tabId
  if (!isEditing.value) startEditing()
  await nextTick()
  formRefs.get(tabId)?.focusField(item.fieldKey as RecordFieldKey)
}

watch(
  record,
  (currentRecord) => {
    if (currentRecord) {
      feedback.clearAll()
      void load(currentRecord)
    }
  },
  { immediate: true },
)

async function saveRecord() {
  if (isSaving.value) return
  isSaving.value = true
  try {
    const saved = await submit(
      async () => {
        const results = await Promise.all([...formRefs.values()].map((form) => form.validate()))
        return results.length > 0 && results.every(Boolean)
      },
      (updatedRecord: RecordItem) => recordsStore.updateRecord(updatedRecord),
    )
    if (saved) {
      feedback.clearAll()
      ElMessage.success('Cambios guardados')
    }
  } catch {
    ElMessage.error('No se pudieron guardar los cambios. Vuelve a intentarlo.')
  } finally {
    isSaving.value = false
  }
}
</script>

<style scoped>
.page-content {
  width: min(1120px, 100%);
  margin: 0 auto;
  padding: 40px 32px;
}

.back-button {
  margin: 0 0 26px -12px;
  color: #52716d;
}

.page-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 24px;
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
  font-size: 28px;
  font-weight: 650;
}

.heading-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.detail-tabs {
  margin-top: 8px;
}

@media (max-width: 640px) {
  .page-content {
    padding: 28px 18px;
  }

  .page-heading {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
