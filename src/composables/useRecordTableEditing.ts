import { computed, shallowReactive } from 'vue'
import type { RecordItem, RecordFieldKey } from '@/domain/record'
import { recordFields } from '@/forms/recordForm'
import { loadRecordOptions } from '@/data/recordOptions'
import { useRecordForm, type RecordFormController } from '@/composables/useRecordForm'

export function useRecordTableEditing() {
  const editors = shallowReactive<Record<string, RecordFormController<RecordItem>>>({})
  const editModels = computed(() =>
    Object.fromEntries(Object.entries(editors).map(([id, editor]) => [id, editor.model])),
  )
  const pendingRows = computed(() =>
    Object.entries(editors).filter(([, editor]) => editor.isDirty.value),
  )

  async function startEditing(record: RecordItem) {
    if (editors[record.id]) return
    const editor = useRecordForm(record, recordFields, loadRecordOptions)
    editors[record.id] = editor
    editor.startEditing()
    await editor.refreshAllOptions()
  }

  function stopEditing(id: string) {
    delete editors[id]
  }

  function updateField(id: string, key: RecordFieldKey, value: string) {
    editors[id]?.updateField(key, value)
  }

  function fieldChanged(id: string, key: RecordFieldKey) {
    return editors[id]?.fieldChanged(key)
  }

  async function saveChanges(
    validate: (ids: string[]) => Promise<boolean>,
    persist: (records: RecordItem[]) => unknown,
  ) {
    const rows = pendingRows.value
    if (!rows.length || !(await validate(rows.map(([id]) => id)))) return []
    // A cancelled editor must not be saved after asynchronous validation.
    const activeRows = rows.filter(([id, editor]) => editors[id] === editor)
    if (!activeRows.length) return []
    const snapshots = activeRows.map(([, editor]) => ({ ...editor.model }))
    await persist(snapshots)
    const savedIds: string[] = []
    activeRows.forEach(([id, editor], index) => {
      if (editors[id] !== editor) return
      editor.markSaved(snapshots[index]!)
      if (!editor.isDirty.value) {
        stopEditing(id)
        savedIds.push(id)
      }
    })
    return savedIds
  }

  return {
    editors,
    editModels,
    pendingRows,
    startEditing,
    stopEditing,
    updateField,
    fieldChanged,
    saveChanges,
  }
}
