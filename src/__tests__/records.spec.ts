import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useRecordsStore } from '@/stores/records'

describe('records store', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('copies submitted records and rejects unknown IDs atomically', () => {
    const store = useRecordsStore()
    const original = { ...store.records[0]! }
    const updated = { ...original, name: 'Ana' }
    expect(() => store.updateRecords([updated, { ...updated, id: 'missing' }])).toThrow(
      'No existe el registro missing',
    )
    expect(store.findById(original.id)?.name).toBe(original.name)
    store.updateRecords([updated])
    updated.name = 'Changed externally'
    expect(store.findById(original.id)?.name).toBe('Ana')
    expect(() => store.updateRecord({ ...updated, id: 'missing' })).toThrow(
      'No existe el registro missing',
    )
  })

  it('deletes only the requested record', () => {
    const store = useRecordsStore()
    const id = store.records[0]!.id
    store.deleteRecord(id)
    expect(store.findById(id)).toBeUndefined()
    expect(store.records).toHaveLength(2)
  })
})
