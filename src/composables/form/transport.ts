import type { Model, Option, Transport } from './types'
export const fetchTransport: Transport = async (action, signal) => {
  const response = await fetch(action.url, {
    method: 'POST',
    signal,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ config: action.config ?? {}, data: action.data ?? {} }),
  })
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${action.url}`)
  return response.json()
}
export function parseOptions(response: unknown): Option[] {
  const rows = Array.isArray(response) ? response : (response as { data?: unknown })?.data
  if (!Array.isArray(rows)) throw new Error('Respuesta de combo invalida')
  return rows.map((row: Model) => {
    const raw: Model = Array.isArray(row)
      ? Object.fromEntries(
          row.map((field: { id: string; value: unknown }) => [field.id, field.value]),
        )
      : row
    const value = raw.id ?? raw.value
    if (typeof value !== 'number' && typeof value !== 'string')
      throw new Error('Opcion sin id valido')
    return { value, label: String(raw.name ?? raw.text ?? raw.label ?? value), raw }
  })
}
