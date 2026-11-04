import { computed, reactive, ref, toRaw, toValue, type MaybeRefOrGetter, type Ref } from 'vue'
import type { FormField } from '@/forms/types'
import { useDependentSelects, type SelectOptionsLoader } from '@/composables/useDependentSelects'

export type RecordFormMode = 'read' | 'edit'

export function useRecordForm<T extends object>(
  initialRecord: MaybeRefOrGetter<T>,
  fields: readonly FormField<T>[],
  loadOptions: SelectOptionsLoader,
) {
  const initialValue = toValue(initialRecord)
  const model = reactive({ ...initialValue }) as T
  const savedValue = ref({ ...initialValue }) as Ref<T>
  const mode = ref<RecordFormMode>('read')
  const isEditing = computed(() => mode.value === 'edit')
  const isDirty = computed(() => JSON.stringify(model) !== JSON.stringify(savedValue.value))
  const dependentSelects = useDependentSelects(model, fields, loadOptions)

  function setValue<K extends keyof T>(key: K, value: T[K]) {
    model[key] = value
  }

  async function load(record: T) {
    Object.assign(model, record)
    savedValue.value = { ...record }
    mode.value = 'read'

    await dependentSelects.refreshAllOptions()
  }

  function startEditing() {
    mode.value = 'edit'
  }

  function cancelEditing() {
    Object.assign(model, savedValue.value)
    mode.value = 'read'
    void dependentSelects.refreshAllOptions()
  }

  function markSaved(record: T = { ...toRaw(model) }) {
    savedValue.value = { ...record }
    mode.value = isDirty.value ? 'edit' : 'read'
  }

  async function submit(validate: () => Promise<boolean>, persist: (record: T) => unknown) {
    if (!(await validate())) return false

    const snapshot = { ...toRaw(model) }
    await persist(snapshot)
    markSaved(snapshot)
    return true
  }

  return {
    model,
    updateField: setValue,
    mode,
    isEditing,
    isDirty,
    ...dependentSelects,
    load,
    startEditing,
    cancelEditing,
    markSaved,
    submit,
  }
}

export type RecordFormController<T extends object> = ReturnType<typeof useRecordForm<T>>
