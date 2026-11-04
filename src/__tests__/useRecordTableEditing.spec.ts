import { describe, expect, it, vi } from 'vitest'
import { useRecordTableEditing } from '@/composables/useRecordTableEditing'
import { createEmptyRecord, type RecordItem } from '@/domain/record'

const record = { ...createEmptyRecord(), id: 'REC-1', name: 'Laura' }

describe('useRecordTableEditing', () => {
  it('isolates drafts, derives models and cancels without changing the original', async () => {
    const editing = useRecordTableEditing()
    await editing.startEditing(record)
    editing.updateField(record.id, 'name', 'Marta')
    expect(record.name).toBe('Laura')
    expect(editing.editModels.value[record.id]?.name).toBe('Marta')
    expect(editing.pendingRows.value).toHaveLength(1)
    editing.stopEditing(record.id)
    expect(editing.editModels.value).toEqual({})
    expect(editing.pendingRows.value).toEqual([])
  })

  it('validates before saving and removes only saved editors', async () => {
    const editing = useRecordTableEditing()
    await editing.startEditing(record)
    editing.updateField(record.id, 'name', 'Marta')
    const persist = vi.fn<(records: RecordItem[]) => void>()
    expect(await editing.saveChanges(async () => false, persist)).toEqual([])
    expect(persist).not.toHaveBeenCalled()
    expect(await editing.saveChanges(async () => true, persist)).toEqual([record.id])
    expect(persist).toHaveBeenCalledWith([{ ...record, name: 'Marta' }])
    expect(editing.editors).toEqual({})
  })

  it('retains newer edits while an earlier snapshot is saved', async () => {
    const editing = useRecordTableEditing()
    await editing.startEditing(record)
    editing.updateField(record.id, 'name', 'Marta')
    let resolve!: () => void
    const save = editing.saveChanges(
      async () => true,
      () =>
        new Promise<void>((done) => {
          resolve = done
        }),
    )
    await Promise.resolve()
    editing.updateField(record.id, 'name', 'Ana')
    resolve()
    await save
    expect(editing.editors[record.id]?.isDirty.value).toBe(true)
    expect(editing.editModels.value[record.id]?.name).toBe('Ana')
  })
})
