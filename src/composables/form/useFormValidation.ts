import { computed, reactive, ref } from 'vue'
import { hasValue } from './dependencies'
import type { Field, Model, ValidationRule } from './types'
export interface ValidationIssue {
  severity: 'warning' | 'error'
  message: string
}
function compileRule(rule: ValidationRule) {
  let expression: RegExp
  try {
    expression = new RegExp(rule.pattern, rule.flags)
  } catch {
    throw new Error(`Regex de validacion invalida: ${rule.pattern}`)
  }
  return (value: unknown): ValidationIssue | null => {
    if (!hasValue(value)) return null
    expression.lastIndex = 0
    return expression.test(String(value))
      ? null
      : { severity: rule.severity, message: rule.message }
  }
}
export function useFormValidation(fields: Field[], model: Model) {
  const blurred = reactive(new Set<string>())
  const submitted = ref(false)
  const compiled = fields
    .filter((field) => field.type !== 'HIDDEN' && field.visible !== false)
    .map((field) => ({
      field,
      rules: (field.validation?.rules ?? []).map((rule) => ({ rule, check: compileRule(rule) })),
    }))
  const issues = computed(() =>
    Object.fromEntries(
      compiled.map(({ field, rules }) => {
        const value = model[field.id]
        const messages: ValidationIssue[] = []
        if (
          field.validation?.required &&
          !hasValue(value) &&
          (submitted.value || blurred.has(field.id))
        )
          messages.push({ severity: 'error', message: 'Campo obligatorio' })
        if (field.validation?.nospaces && typeof value === 'string' && /\s/.test(value))
          messages.push({ severity: 'error', message: 'El campo no puede contener espacios.' })
        for (const { rule, check } of rules) {
          if (rule.trigger === 'blur' && !submitted.value && !blurred.has(field.id)) continue
          const issue = check(value)
          if (issue) messages.push(issue)
        }
        return [field.id, messages]
      }),
    ),
  )
  function validate() {
    submitted.value = true
    return !Object.values(issues.value).some((messages) =>
      messages.some((issue) => issue.severity === 'error'),
    )
  }
  function reset() {
    blurred.clear()
    submitted.value = false
  }
  return { issues, validate, reset, markBlurred: (id: string) => blurred.add(id) }
}
