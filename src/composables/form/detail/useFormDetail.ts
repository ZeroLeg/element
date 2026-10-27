import { useFormBase } from '../useFormBase'
import type { Field, FormOptions } from '../types'
export function useFormDetail(
  schema: { data: { groups: { id?: string | number; name?: string; fields: Field[] }[] } },
  options: FormOptions = {},
) {
  return {
    ...useFormBase(
      schema.data.groups.flatMap((g) => g.fields),
      options,
    ),
    groups: schema.data.groups,
  }
}
