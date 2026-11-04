import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { RecordItem } from '@/domain/record'

export const useRecordsStore = defineStore('records', () => {
  const records = ref<RecordItem[]>([
    {
      id: 'REC-1001',
      date: '2026-10-28',
      name: 'Laura García',
      address: 'Calle Mayor 12, Madrid',
      country: 'España',
      region: 'Madrid',
      office: 'Oficina Centro',
    },
    {
      id: 'REC-1002',
      date: '2026-10-29',
      name: 'Daniel Ruiz',
      address: 'Avenida del Puerto 8, Valencia',
      country: 'España',
      region: 'Andalucía',
      office: 'Oficina Sur',
    },
    {
      id: 'REC-1003',
      date: '2026-10-30',
      name: 'Marta López',
      address: 'Calle Feria 24, Sevilla',
      country: 'Francia',
      region: 'Île-de-France',
      office: 'Oficina París',
    },
  ])

  function findById(id: string) {
    return records.value.find((record) => record.id === id)
  }

  function updateRecord(updatedRecord: RecordItem) {
    const index = records.value.findIndex((record) => record.id === updatedRecord.id)
    if (index === -1) throw new Error(`No existe el registro ${updatedRecord.id}`)
    records.value[index] = { ...updatedRecord }
  }

  function updateRecords(updatedRecords: RecordItem[]) {
    const existingIds = new Set(records.value.map((record) => record.id))
    for (const record of updatedRecords) {
      if (!existingIds.has(record.id)) throw new Error(`No existe el registro ${record.id}`)
    }
    const recordsById = new Map(updatedRecords.map((record) => [record.id, { ...record }]))
    records.value = records.value.map((record) => recordsById.get(record.id) ?? record)
  }

  function deleteRecord(id: string) {
    records.value = records.value.filter((record) => record.id !== id)
  }

  return { records, findById, updateRecord, updateRecords, deleteRecord }
})
