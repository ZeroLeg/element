import { defineComponent, h } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { provideTransactions, useTransaction, type TransactionResult } from './useTransaction'

function setup(onBusy?: () => void) {
  let host!: ReturnType<typeof provideTransactions>
  let client!: ReturnType<typeof useTransaction>
  const Child = defineComponent({
    setup() {
      client = useTransaction()
      return () => null
    },
  })
  const wrapper = mount(
    defineComponent({
      setup() {
        host = provideTransactions({ onBusy })
        return () => h(Child)
      },
    }),
  )
  return { host, client, wrapper }
}

const config = { title: 'Usuario', fields: [{ name: 'name', label: 'Nombre' }] }

describe('transactions', () => {
  it('returns confirmed data to the injected consumer and allows reopening', async () => {
    const { host, client, wrapper } = setup()
    const result = client.open(config)
    expect(host.active.value?.title).toBe('Usuario')
    const confirmed: TransactionResult = { confirmed: true, data: { name: 'Ana' } }
    host.finish(confirmed)
    await expect(result).resolves.toEqual(confirmed)
    expect(host.active.value).toBeNull()
    const next = client.open(config)
    host.finish({ confirmed: false })
    await expect(next).resolves.toEqual({ confirmed: false })
    wrapper.unmount()
  })

  it('notifies about a busy transaction without replacing it', async () => {
    const onBusy = vi.fn()
    const { host, client, wrapper } = setup(onBusy)
    const pending = client.open(config)
    const active = host.active.value
    await expect(client.open({ ...config, title: 'Otra' })).resolves.toEqual({
      confirmed: false,
      reason: 'busy',
    })
    expect(onBusy).toHaveBeenCalledOnce()
    expect(host.active.value).toBe(active)
    host.finish({ confirmed: false })
    await expect(pending).resolves.toEqual({ confirmed: false })
    wrapper.unmount()
  })

  it('resolves pending callers when the provider is disposed', async () => {
    const { client, wrapper } = setup()
    const pending = client.open(config)
    wrapper.unmount()
    await expect(pending).resolves.toEqual({ confirmed: false })
  })
})
