export type Model = Record<string, unknown>
export interface Mapping {
  source: string
  destination: string
}
export interface Action {
  url: string
  config?: Model
  data?: Model
  sourcedest?: Mapping[]
  sourcedestsetter?: Mapping[]
}
export interface ValidationRule {
  type: 'regex'
  pattern: string
  flags?: string
  severity: 'warning' | 'error'
  message: string
  trigger?: 'change' | 'blur'
}
export interface Field {
  id: string
  type: string
  label?: string
  value?: unknown
  default?: unknown
  visible?: boolean
  readonly?: boolean
  validation?: {
    required?: boolean
    readonly?: boolean
    nospaces?: boolean
    rules?: ValidationRule[]
  }
  combo?: {
    parent?: string
    waitparent?: boolean
    combowaitparent?: boolean
    simple?: boolean
    action: Action
  }
}
export type Transport = (action: Action, signal: AbortSignal) => Promise<unknown>
export interface FormOptions {
  transport?: Transport
}
export interface Option {
  value: string | number
  label: string
  raw: Model
}
