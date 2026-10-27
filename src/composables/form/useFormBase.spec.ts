import { describe, expect, it, vi } from 'vitest'
import { effectScope, nextTick } from 'vue'
import { useFormBase } from './useFormBase'
import { buildAction } from './dependencies'
import { useFormDetail } from './detail/useFormDetail'
import { useFormList } from './list/useFormList'
import detail from '../../detail.json'
import list from '../../lista.json'
import type { Field, Transport } from './types'
const fields: Field[] = [
  { id: 'pais', type: 'COMBO', combo: { simple: true, action: { url: '/pais' } } },
  {
    id: 'region',
    type: 'COMBO',
    combo: {
      simple: true,
      parent: 'pais',
      combowaitparent: true,
      action: { url: '/region', data: { fixed: 4 } },
    },
  },
  {
    id: 'provincia',
    type: 'COMBO',
    combo: { simple: true, parent: 'region', waitparent: true, action: { url: '/provincia' } },
  },
]
describe('formularios dependientes', () => {
  it('espera al padre, conserva data y limpia descendientes', async () => {
    const transport = vi.fn<Transport>().mockResolvedValue([])
    const scope = effectScope()
    const form = scope.run(() => useFormBase(fields, { transport }))!
    await form.loadOptions('region')
    expect(transport).not.toHaveBeenCalled()
    form.model.pais = 12
    await nextTick()
    expect(transport.mock.calls[0]?.[0].data).toEqual({ fixed: 4, parent: 12 })
    form.model.region = 20
    form.model.provincia = 30
    form.model.pais = 0
    expect(form.model.region).toBeNull()
    expect(form.model.provincia).toBeNull()
    await nextTick()
    expect(transport.mock.calls.some(([action]) => action.data?.parent === 0)).toBe(true)
    scope.stop()
  })
  it('mapea sourcedest, reinicia el destino y no modifica el esquema', async () => {
    const target: Field = {
      id: 'destino',
      type: 'COMBO',
      combo: {
        simple: true,
        action: { url: '/', sourcedest: [{ source: 'pais', destination: 'paisId' }] },
      },
    }
    expect(buildAction(target, { pais: 12 }).data).toEqual({ paisId: 12 })
    expect(target.combo?.action.data).toBeUndefined()
    const scope = effectScope()
    const form = scope.run(() => useFormBase([...fields, target], { transport: async () => [] }))!
    form.model.destino = 5
    form.model.pais = 12
    expect(form.model.destino).toBeNull()
    await nextTick()
    scope.stop()
  })
  it('descarta respuestas obsoletas incluso si el transporte ignora abort', async () => {
    const pending: ((value: unknown) => void)[] = []
    const scope = effectScope()
    const form = scope.run(() =>
      useFormBase(fields, { transport: () => new Promise((resolve) => pending.push(resolve)) }),
    )!
    const first = form.loadOptions('pais')
    const second = form.loadOptions('pais')
    pending[1]!([{ id: 2, name: 'Actual' }])
    await second
    pending[0]!([{ id: 1, name: 'Antigua' }])
    await first
    expect(form.combos.pais?.options[0]?.value).toBe(2)
    scope.stop()
  })
  it('hidrata los ejemplos sin perder valores y permite reset', () => {
    const scope = effectScope()
    scope.run(() => {
      const a = useFormDetail(detail, { transport: async () => [] })
      expect(a.model.id_type).toBe(421)
      const b = useFormList(list, { transport: async () => [] })
      b.editRow(0)
      const initial = b.getPayload()
      b.model.denomination = 'Cambio'
      b.reset()
      expect(b.getPayload()).toEqual(initial)
    })
    scope.stop()
  })
  it('aplica setters sin borrar la opcion que acaba de seleccionarse', async () => {
    const scope = effectScope()
    const country: Field = {
      id: 'pais',
      type: 'COMBO',
      combo: {
        simple: true,
        action: {
          url: '/',
          sourcedest: [{ source: 'nombre', destination: 'name' }],
          sourcedestsetter: [
            { source: 'id', destination: 'pais' },
            { source: 'name', destination: 'nombre' },
          ],
        },
      },
    }
    const form = scope.run(() =>
      useFormBase([country], { transport: async () => [{ id: 12, name: 'Espana' }] }),
    )!
    await form.loadOptions('pais')
    form.selectOption('pais', 12)
    expect(form.model.pais).toBe(12)
    expect(form.model.nombre).toBe('Espana')
    await nextTick()
    expect(form.model.pais).toBe(12)
    scope.stop()
  })
  it('carga con padre vacio cuando no exige espera y permite reintentar errores', async () => {
    const scope = effectScope()
    const field: Field = {
      id: 'hijo',
      type: 'COMBO',
      combo: { parent: 'padre', action: { url: '/' } },
    }
    const transport = vi
      .fn<Transport>()
      .mockRejectedValueOnce(new Error('Sin conexion'))
      .mockResolvedValueOnce([])
    const form = scope.run(() => useFormBase([field], { transport }))!
    await form.loadOptions('hijo')
    expect(form.combos.hijo?.error).toBe('Sin conexion')
    await form.loadOptions('hijo')
    expect(form.combos.hijo?.error).toBeNull()
    expect(transport).toHaveBeenCalledTimes(2)
    scope.stop()
  })
  it('rechaza ciclos', () => {
    expect(() =>
      useFormBase([{ id: 'a', type: 'COMBO', combo: { parent: 'a', action: { url: '/' } } }]),
    ).toThrow('circular')
  })
})
