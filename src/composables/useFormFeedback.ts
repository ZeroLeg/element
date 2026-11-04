import { computed, reactive } from 'vue'

export type FeedbackKind = 'error' | 'warning'

export interface FormFeedbackItem {
  key: string
  fieldKey: string
  rowId?: string
  tabId?: string
  tabLabel?: string
  label: string
  kind: FeedbackKind
  message: string
}

export function useFormFeedback() {
  const entries = reactive<Record<string, FormFeedbackItem>>({})
  const items = computed(() =>
    Object.values(entries).sort((left, right) => {
      if (left.kind !== right.kind) return left.kind === 'error' ? -1 : 1
      return left.label.localeCompare(right.label)
    }),
  )

  function set(item: Omit<FormFeedbackItem, 'kind'>, kind: FeedbackKind) {
    const entryKey = `${kind}:${item.key}`
    if (item.message) entries[entryKey] = { ...item, kind }
    else delete entries[entryKey]
  }

  function setError(item: Omit<FormFeedbackItem, 'kind'>) {
    set(item, 'error')
  }

  function setWarning(item: Omit<FormFeedbackItem, 'kind'>) {
    set(item, 'warning')
  }

  function clear(key: string) {
    delete entries[`error:${key}`]
    delete entries[`warning:${key}`]
  }

  function clearRow(rowId: string) {
    for (const item of items.value) {
      if (item.rowId === rowId) clear(item.key)
    }
  }

  function clearAll() {
    for (const key of Object.keys(entries)) delete entries[key]
  }

  return { items, setError, setWarning, clear, clearRow, clearAll }
}
