import { describe, expect, it } from 'vitest'
import { reactive } from 'vue'
import { useFormValidation } from './useFormValidation'
import type { Field } from './types'
const field: Field = {
  id: 'name',
  type: 'STRING',
  validation: {
    rules: [
      {
        type: 'regex',
        pattern: '^A',
        severity: 'warning',
        message: 'Debe empezar por A mayuscula.',
        trigger: 'blur',
      },
    ],
  },
}
describe('validacion de formularios', () => {
  it('muestra el warning al salir y lo elimina al corregir, sin bloquear', () => {
    const model = reactive({ name: 'ana' })
    const validation = useFormValidation([field], model)
    expect(validation.issues.value.name).toEqual([])
    validation.markBlurred('name')
    expect(validation.issues.value.name?.[0]?.severity).toBe('warning')
    expect(validation.validate()).toBe(true)
    model.name = 'Ana'
    expect(validation.issues.value.name).toEqual([])
  })
  it('no avisa por formato en un campo opcional vacio', () => {
    const validation = useFormValidation([field], reactive({ name: '' }))
    expect(validation.validate()).toBe(true)
    expect(validation.issues.value.name).toEqual([])
  })
  it('bloquea errores required, nospaces y regex', () => {
    const model = reactive({ name: '' })
    const validation = useFormValidation(
      [
        {
          ...field,
          validation: {
            required: true,
            nospaces: true,
            rules: [{ ...field.validation!.rules![0]!, severity: 'error' }],
          },
        },
      ],
      model,
    )
    expect(validation.validate()).toBe(false)
    model.name = 'Ana Maria'
    expect(validation.validate()).toBe(false)
    model.name = 'ana'
    expect(validation.validate()).toBe(false)
    model.name = 'Ana'
    expect(validation.validate()).toBe(true)
  })
  it('reinicia el estado de interaccion y rechaza regex mal configuradas', () => {
    const validation = useFormValidation([field], reactive({ name: 'ana' }))
    validation.validate()
    validation.reset()
    expect(validation.issues.value.name).toEqual([])
    expect(() =>
      useFormValidation(
        [{ ...field, validation: { rules: [{ ...field.validation!.rules![0]!, pattern: '[' }] } }],
        {},
      ),
    ).toThrow('Regex')
  })
})
