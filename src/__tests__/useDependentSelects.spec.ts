import { reactive } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import type { FormField, SelectPayload } from '@/forms/types'
import { useDependentSelects } from '@/composables/useDependentSelects'

interface LocationRecord {
  country: string
  region: string
  office: string
}

const fields: FormField<LocationRecord>[] = [
  {
    key: 'country',
    label: 'País',
    type: 'select',
    placeholder: 'País',
    source: 'country',
    childrenSourceDest: ['office'],
  },
  {
    key: 'region',
    label: 'Región',
    type: 'select',
    placeholder: 'Región',
    parent: 'country',
    waitParent: true,
  },
  { key: 'office', label: 'Oficina', type: 'select', placeholder: 'Oficina' },
]

describe('useDependentSelects', () => {
  it('respects waitParent and builds independent parent and source payloads', async () => {
    const model = reactive<LocationRecord>({ country: '', region: '', office: '' })
    const loadOptions = vi.fn<(key: string, payload: SelectPayload) => Promise<[]>>(async () => [])
    const selects = useDependentSelects(model, fields, loadOptions)

    await selects.refreshOptions('region')
    expect(loadOptions).not.toHaveBeenCalledWith('region', expect.anything())
    await selects.refreshOptions('office')
    expect(loadOptions).toHaveBeenCalledWith('office', {})

    model.country = 'España'
    model.region = 'Madrid'
    model.office = 'Oficina Centro'
    await selects.refreshAllOptions()
    loadOptions.mockClear()

    model.country = 'Francia'
    await selects.fieldChanged('country')

    expect(model.region).toBe('')
    expect(model.office).toBe('')
    expect(loadOptions).toHaveBeenCalledWith('region', { parent: 'Francia' })
    expect(loadOptions).toHaveBeenCalledWith('office', { country: 'Francia' })
    expect(
      selects.runtimeFields.value.find((field) => field.key === 'country')?.parentChilds,
    ).toEqual(['region'])
  })
})

describe('dependent select request lifecycle', () => {
  it('invalidates a pending response when the parent is cleared', async () => {
    const model = reactive<LocationRecord>({
      country: 'España',
      region: 'Madrid',
      office: 'Centro',
    })
    let resolve!: (options: { label: string; value: string }[]) => void
    const selects = useDependentSelects(model, fields, (key) =>
      key === 'region'
        ? new Promise((done) => {
            resolve = done
          })
        : [],
    )
    const request = selects.refreshOptions('region')
    model.country = ''
    await selects.fieldChanged('country')
    resolve([{ label: 'Madrid', value: 'Madrid' }])
    await request
    expect(selects.options.region).toEqual([])
    expect(selects.loadingOptions.region).toBe(false)
  })

  it('clears all dependents before loading, and allows retry after failure', async () => {
    const model = reactive<LocationRecord>({
      country: 'Francia',
      region: 'Madrid',
      office: 'Centro',
    })
    let reject!: (error: Error) => void
    const selects = useDependentSelects(model, fields, (key) =>
      key === 'region'
        ? new Promise((_, fail) => {
            reject = fail
          })
        : [],
    )
    const change = selects.fieldChanged('country')
    expect(model.region).toBe('')
    expect(model.office).toBe('')
    reject(new Error('Offline'))
    await change
    expect(selects.optionErrors.region).toBeTruthy()
    expect(selects.loadingOptions.region).toBe(false)
    model.country = ''
    await selects.refreshOptions('region')
    expect(selects.optionErrors.region).toBe('')
  })

  it('keeps only the latest response when requests finish out of order', async () => {
    const model = reactive<LocationRecord>({ country: 'España', region: '', office: '' })
    const resolvers: ((value: { label: string; value: string }[]) => void)[] = []
    const selects = useDependentSelects(
      model,
      fields,
      () => new Promise((resolve) => resolvers.push(resolve)),
    )
    const first = selects.refreshOptions('region')
    model.country = 'Francia'
    const second = selects.refreshOptions('region')
    resolvers[1]!([{ label: 'París', value: 'París' }])
    await second
    resolvers[0]!([{ label: 'Madrid', value: 'Madrid' }])
    await first
    expect(selects.options.region).toEqual([{ label: 'París', value: 'París' }])
  })
})
