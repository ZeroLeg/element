import { describe, expect, it, vi } from 'vitest'
import type { FormField } from '@/forms/types'
import { useRecordForm } from '@/composables/useRecordForm'

interface DraftRecord {
  name: string
}

const fields: FormField<DraftRecord>[] = [
  { key: 'name', label: 'Nombre', type: 'text', placeholder: 'Nombre' },
]

describe('useRecordForm', () => {
  it('tracks changes in the reactive draft', () => {
    const form = useRecordForm<DraftRecord>({ name: 'Laura' }, fields, async () => [])

    expect(form.isDirty.value).toBe(false)
    form.updateField('name', 'Marta')
    expect(form.isDirty.value).toBe(true)
    form.cancelEditing()
    expect(form.isDirty.value).toBe(false)
  })

  it('does not persist invalid data and shares submit behavior', async () => {
    const form = useRecordForm<DraftRecord>({ name: 'Laura' }, fields, async () => [])
    const persist = vi.fn<(record: DraftRecord) => void>()

    form.startEditing()
    expect(await form.submit(async () => false, persist)).toBe(false)
    expect(persist).not.toHaveBeenCalled()
    expect(form.isEditing.value).toBe(true)

    expect(await form.submit(async () => true, persist)).toBe(true)
    expect(persist).toHaveBeenCalledWith({ name: 'Laura' })
    expect(form.isEditing.value).toBe(false)
  })
})

it('preserves edits made while persistence is pending', async () => {
  const form = useRecordForm({ name: 'Laura' }, fields, async () => [])
  let resolve!: () => void
  let persisted!: DraftRecord
  form.startEditing()
  const save = form.submit(
    async () => true,
    (record) => {
      persisted = record
      return new Promise<void>((done) => {
        resolve = done
      })
    },
  )
  await Promise.resolve()
  form.updateField('name', 'Marta')
  resolve()
  await save
  expect(persisted).toEqual({ name: 'Laura' })
  expect(form.isDirty.value).toBe(true)
  expect(form.isEditing.value).toBe(true)
  form.cancelEditing()
  expect(form.model.name).toBe('Laura')
})

it('keeps the draft when persistence fails', async () => {
  const form = useRecordForm({ name: 'Laura' }, fields, async () => [])
  form.startEditing()
  form.updateField('name', 'Marta')
  await expect(
    form.submit(
      async () => true,
      async () => {
        throw new Error('Offline')
      },
    ),
  ).rejects.toThrow('Offline')
  expect(form.isDirty.value).toBe(true)
  expect(form.isEditing.value).toBe(true)
})
