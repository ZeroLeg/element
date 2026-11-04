import type { FormRules } from 'element-plus'
import type { RecordItem, RecordFieldKey } from '@/domain/record'
import type { FormField } from '@/forms/types'

export type RecordField = Omit<FormField<RecordItem>, 'key' | 'parent' | 'childrenSourceDest'> & {
  key: RecordFieldKey
  parent?: RecordFieldKey
  childrenSourceDest?: RecordFieldKey[]
}

export const recordFields: RecordField[] = [
  { key: 'date', label: 'Fecha', type: 'date', placeholder: 'Selecciona una fecha' },
  {
    key: 'name',
    label: 'Nombre',
    type: 'text',
    placeholder: 'Nombre completo',
    pattern: /^[\p{L}\s'-]+$/u,
    patternMessage: 'Usa solo letras, espacios, apóstrofos o guiones.',
  },
  { key: 'address', label: 'Dirección', type: 'text', placeholder: 'Dirección' },
  {
    key: 'country',
    label: 'País',
    type: 'select',
    placeholder: 'Selecciona un país',
    source: 'country',
    childrenSourceDest: ['office'],
  },
  {
    key: 'region',
    label: 'Región',
    type: 'select',
    placeholder: 'Selecciona una región',
    parent: 'country',
    waitParent: true,
  },
  { key: 'office', label: 'Oficina', type: 'select', placeholder: 'Selecciona una oficina' },
]

export const recordRules: FormRules<RecordItem> = {
  date: [{ required: true, message: 'Selecciona una fecha', trigger: 'change' }],
  name: [
    {
      type: 'string',
      required: true,
      whitespace: true,
      message: 'El nombre es obligatorio',
      trigger: 'blur',
    },
    { min: 2, message: 'El nombre debe tener al menos 2 caracteres', trigger: 'blur' },
  ],
  address: [
    {
      type: 'string',
      required: true,
      whitespace: true,
      message: 'La dirección es obligatoria',
      trigger: 'blur',
    },
  ],
  country: [{ required: true, message: 'Selecciona un país', trigger: 'change' }],
  region: [{ required: true, message: 'Selecciona una región', trigger: 'change' }],
  office: [{ required: true, message: 'Selecciona una oficina', trigger: 'change' }],
}
