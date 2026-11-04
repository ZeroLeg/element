import { describe, expect, it } from 'vitest'
import { useFormFeedback } from '@/composables/useFormFeedback'

describe('useFormFeedback', () => {
  it('keeps errors and warnings separately and clears a row together', () => {
    const feedback = useFormFeedback()

    feedback.setWarning({
      key: 'REC-1001.name',
      fieldKey: 'name',
      rowId: 'REC-1001',
      label: 'Nombre',
      message: 'Formato recomendado',
    })
    feedback.setError({
      key: 'REC-1001.name',
      fieldKey: 'name',
      rowId: 'REC-1001',
      label: 'Nombre',
      message: 'El nombre es obligatorio',
    })

    expect(feedback.items.value.map((item) => item.kind)).toEqual(['error', 'warning'])

    feedback.clearRow('REC-1001')
    expect(feedback.items.value).toEqual([])
  })
})
