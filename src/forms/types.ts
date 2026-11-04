export interface FormField<T extends object> {
  key: Extract<keyof T, string>
  label: string
  type: 'text' | 'date' | 'select'
  placeholder: string
  parent?: Extract<keyof T, string>
  waitParent?: boolean
  source?: string
  childrenSourceDest?: Extract<keyof T, string>[]
  pattern?: RegExp
  patternMessage?: string
  tabId?: string
}

export interface SelectOption {
  label: string
  value: string
}

export type SelectPayload = Record<string, unknown>
