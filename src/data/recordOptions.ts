import type { SelectOption, SelectPayload } from '@/forms/types'

const countries: SelectOption[] = [
  { label: 'España', value: 'España' },
  { label: 'Francia', value: 'Francia' },
]

const regionsByCountry: Record<string, SelectOption[]> = {
  España: [
    { label: 'Madrid', value: 'Madrid' },
    { label: 'Andalucía', value: 'Andalucía' },
  ],
  Francia: [
    { label: 'Île-de-France', value: 'Île-de-France' },
    { label: 'Occitania', value: 'Occitania' },
  ],
}

const officesByCountry: Record<string, SelectOption[]> = {
  España: [
    { label: 'Oficina Centro', value: 'Oficina Centro' },
    { label: 'Oficina Sur', value: 'Oficina Sur' },
  ],
  Francia: [
    { label: 'Oficina París', value: 'Oficina París' },
    { label: 'Oficina Toulouse', value: 'Oficina Toulouse' },
  ],
}

export async function loadRecordOptions(
  fieldKey: string,
  payload: SelectPayload,
): Promise<SelectOption[]> {
  if (fieldKey === 'country') return countries
  if (fieldKey === 'region') return regionsByCountry[String(payload.parent)] ?? []
  if (fieldKey === 'office') return officesByCountry[String(payload.country)] ?? []
  return []
}
