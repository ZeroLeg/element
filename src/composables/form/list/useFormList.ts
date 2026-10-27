import { useFormBase } from '../useFormBase'
import type { Field, FormOptions } from '../types'
export function useFormList(
  schema: { config: { columns: Field[] }; data: { id: string; value: unknown }[][] },
  options: FormOptions = {},
) {
  const form = useFormBase(schema.config.columns, options)
  function editRow(index: number) {
    const row = schema.data[index]
    if (!row) throw new RangeError(`Fila inexistente: ${index}`)
    form.initForm(Object.fromEntries(row.map((field) => [field.id, field.value])))
  }
  return { ...form, editRow, createRow: () => form.initForm({}) }
}
