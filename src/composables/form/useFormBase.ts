import { computed, onScopeDispose, reactive, ref, toRaw, watch } from 'vue'
import { assertAcyclic, buildAction, canLoad, dependencies, normalize } from './dependencies'
import { fetchTransport, parseOptions } from './transport'
import type { Field, FormOptions, Model, Option } from './types'
const copy = <T>(value: T): T => structuredClone(toRaw(value))
export function useFormBase(fields: Field[], options: FormOptions = {}) {
  assertAcyclic(fields)
  const model = reactive<Model>({})
  const originalModel = ref<Model>({})
  const combos = reactive<
    Record<string, { options: Option[]; loading: boolean; error: string | null }>
  >({})
  const controllers = new Map<string, AbortController>()
  let hydrating = false,
    disposed = false
  for (const field of fields) {
    model[field.id] = copy(normalize(field, field.value ?? field.default ?? null))
    if (field.combo) combos[field.id] = { options: [], loading: false, error: null }
  }
  originalModel.value = copy(model)
  function invalidate(id: string) {
    controllers.get(id)?.abort()
    controllers.delete(id)
    const state = combos[id]
    if (state) {
      state.options = []
      state.loading = false
      state.error = null
    }
  }
  async function loadOptions(id: string) {
    const field = fields.find((field) => field.id === id)
    if (!field?.combo || disposed) return
    invalidate(id)
    if (!canLoad(field, model)) return
    const controller = new AbortController()
    controllers.set(id, controller)
    const state = combos[id]!
    state.loading = true
    try {
      const result = await (options.transport ?? fetchTransport)(
        buildAction(field, model),
        controller.signal,
      )
      if (controllers.get(id) === controller && !controller.signal.aborted)
        state.options = parseOptions(result)
    } catch (error) {
      if (controllers.get(id) === controller && !controller.signal.aborted)
        state.error = error instanceof Error ? error.message : String(error)
    } finally {
      if (controllers.get(id) === controller) {
        state.loading = false
        controllers.delete(id)
      }
    }
  }
  function clearDependents(source: string, seen = new Set<string>()) {
    for (const field of fields) {
      if (!dependencies(field).includes(source) || seen.has(field.id)) continue
      seen.add(field.id)
      invalidate(field.id)
      model[field.id] = field.combo?.simple === false ? [] : null
      for (const mapping of field.combo?.action.sourcedestsetter ?? [])
        if (mapping.destination !== field.id) {
          model[mapping.destination] = null
          clearDependents(mapping.destination, seen)
        }
      clearDependents(field.id, seen)
    }
  }
  for (const id of new Set(fields.flatMap(dependencies)))
    watch(
      () => model[id],
      () => {
        if (!hydrating) clearDependents(id)
      },
      { flush: 'sync', deep: true },
    )
  for (const field of fields.filter((field) => field.combo))
    watch(
      () => dependencies(field).map((id) => model[id]),
      () => {
        void loadOptions(field.id)
      },
      { deep: true },
    )
  function initForm(values: Model) {
    hydrating = true
    fields.forEach((field) => {
      model[field.id] = copy(
        normalize(field, field.id in values ? values[field.id] : (field.default ?? null)),
      )
    })
    hydrating = false
    originalModel.value = copy(model)
    fields.forEach((field) => invalidate(field.id))
  }
  function selectOption(id: string, value: unknown) {
    model[id] = value
    const field = fields.find((field) => field.id === id)
    const selected = combos[id]?.options.find((o) => o.value === value)
    const changed = new Set<string>()
    hydrating = true
    for (const mapping of field?.combo?.action.sourcedestsetter ?? []) {
      const next = selected?.raw[mapping.source] ?? null
      if (model[mapping.destination] !== next) changed.add(mapping.destination)
      model[mapping.destination] = next
    }
    hydrating = false
    for (const source of changed) clearDependents(source, new Set([id]))
  }
  const loadCombos = () =>
    Promise.all(fields.filter((field) => field.combo).map((field) => loadOptions(field.id)))
  onScopeDispose(() => {
    disposed = true
    controllers.forEach((combo) => combo.abort())
  })
  return {
    fields,
    model,
    originalModel,
    combos,
    initForm,
    loadOptions,
    loadCombos,
    selectOption,
    isBlocked: (field: Field) => !canLoad(field, model),
    reset: () => initForm(copy(originalModel.value)),
    getPayload: () => copy(model),
    isDirty: computed(() => JSON.stringify(model) !== JSON.stringify(originalModel.value)),
  }
}
export type FormController = ReturnType<typeof useFormBase>
