import type { Field, Model } from './types'
export const hasValue = (value: unknown) =>
  value !== null &&
  value !== undefined &&
  value !== '' &&
  (!Array.isArray(value) || value.length > 0)
export const normalize = (field: Field, value: unknown) =>
  field.combo?.simple && Array.isArray(value) ? (value[0] ?? null) : value
export const dependencies = (field: Field) => [
  ...new Set([
    ...(field.combo?.parent ? [field.combo.parent] : []),
    ...(field.combo?.action.sourcedest ?? []).map((mapping) => mapping.source),
  ]),
]
export function canLoad(field: Field, model: Model) {
  const combo = field.combo
  return (
    !!combo &&
    (!(combo.waitparent ?? combo.combowaitparent) || !combo.parent || hasValue(model[combo.parent]))
  )
}
export function buildAction(field: Field, model: Model) {
  if (!field.combo) throw new Error(`El campo ${field.id} no es combo`)
  const action = structuredClone(field.combo.action)
  action.data = { ...action.data }
  if (field.combo.parent) action.data.parent = model[field.combo.parent]
  for (const mapping of action.sourcedest ?? [])
    action.data[mapping.destination] = model[mapping.source] ?? null
  return action
}
export function assertAcyclic(fields: Field[]) {
  const byId = new Map(fields.map((field) => [field.id, field]))
  const visited = new Set<string>(),
    visiting = new Set<string>()
  function visit(id: string) {
    if (visiting.has(id)) throw new Error(`Dependencia circular: ${id}`)
    if (visited.has(id)) return
    visiting.add(id)
    for (const dep of dependencies(byId.get(id)!)) if (byId.has(dep)) visit(dep)
    visiting.delete(id)
    visited.add(id)
  }
  fields.forEach((field) => visit(field.id))
}
