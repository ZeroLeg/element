import { computed, reactive } from 'vue'
import type { FormField, SelectOption, SelectPayload } from '@/forms/types'

export interface RuntimeFormField<T extends object> extends FormField<T> {
  parentChilds: string[]
}

export type SelectOptionsLoader = (
  fieldKey: string,
  payload: SelectPayload,
) => Promise<SelectOption[]> | SelectOption[]

export function useDependentSelects<T extends object>(
  model: T,
  fields: readonly FormField<T>[],
  loadOptions: SelectOptionsLoader,
) {
  const options = reactive<Record<string, SelectOption[]>>({})
  const loadingOptions = reactive<Record<string, boolean>>({})
  const optionErrors = reactive<Record<string, string>>({})
  const lastPayload = reactive<Record<string, SelectPayload>>({})
  const requestVersions: Record<string, number> = {}
  const runtimeFields = computed<RuntimeFormField<T>[]>(() =>
    fields.map((field) => ({
      ...field,
      parentChilds: fields
        .filter((candidate) => candidate.parent === field.key)
        .map((candidate) => String(candidate.key)),
    })),
  )

  function getField(key: string) {
    return runtimeFields.value.find((field) => String(field.key) === key)
  }

  function getValue(key: string) {
    return (model as Record<string, unknown>)[key]
  }

  function setValue(key: string, value: unknown) {
    ;(model as Record<string, unknown>)[key] = value
  }

  function hasValue(value: unknown) {
    return value !== undefined && value !== null && value !== ''
  }

  function buildPayload(field: FormField<T>): SelectPayload {
    const payload: SelectPayload = {}

    if (field.parent) {
      const parentValue = getValue(String(field.parent))
      if (hasValue(parentValue)) payload.parent = parentValue
    }

    for (const sourceField of fields) {
      if (!sourceField.childrenSourceDest?.includes(field.key)) continue

      const sourceValue = getValue(String(sourceField.key))
      if (hasValue(sourceValue)) {
        payload[sourceField.source ?? String(sourceField.key)] = sourceValue
      }
    }

    return payload
  }

  async function refreshOptions(key: string) {
    const field = getField(key)
    if (!field || field.type !== 'select') return

    const requestVersion = (requestVersions[key] ?? 0) + 1
    requestVersions[key] = requestVersion
    optionErrors[key] = ''
    const payload = buildPayload(field)
    lastPayload[key] = payload
    const parentValue = field.parent ? getValue(String(field.parent)) : undefined
    if (field.waitParent && !hasValue(parentValue)) {
      options[key] = []
      loadingOptions[key] = false
      return
    }

    loadingOptions[key] = true

    try {
      const loadedOptions = await loadOptions(key, payload)
      if (requestVersions[key] === requestVersion) options[key] = loadedOptions
    } catch {
      if (requestVersions[key] === requestVersion) {
        options[key] = []
        optionErrors[key] = 'No se pudieron cargar las opciones. Vuelve a intentarlo.'
      }
    } finally {
      if (requestVersions[key] === requestVersion) loadingOptions[key] = false
    }
  }

  function collectDependents(key: string, visited = new Set<string>([key])) {
    const result: string[] = []
    const field = getField(key)
    if (!field) return result
    for (const child of [...field.parentChilds, ...(field.childrenSourceDest ?? [])]) {
      if (visited.has(child)) continue
      visited.add(child)
      result.push(child, ...collectDependents(child, visited))
    }
    return result
  }

  async function refreshAllOptions() {
    await Promise.all(
      fields
        .filter((field) => field.type === 'select')
        .map((field) => refreshOptions(String(field.key))),
    )
  }

  async function fieldChanged(key: string) {
    const dependents = collectDependents(key)
    for (const child of dependents) {
      requestVersions[child] = (requestVersions[child] ?? 0) + 1
      setValue(child, '')
      options[child] = []
      optionErrors[child] = ''
    }
    await Promise.all(dependents.map(refreshOptions))
  }

  return {
    options,
    optionErrors,
    loadingOptions,
    lastPayload,
    runtimeFields,
    fieldChanged,
    refreshOptions,
    refreshAllOptions,
  }
}
