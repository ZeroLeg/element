export interface RecordItem {
  id: string
  date: string
  name: string
  address: string
  country: string
  region: string
  office: string
}

export type RecordFieldKey = Exclude<keyof RecordItem, 'id'>

export function createEmptyRecord(): RecordItem {
  return {
    id: '',
    date: '',
    name: '',
    address: '',
    country: '',
    region: '',
    office: '',
  }
}
