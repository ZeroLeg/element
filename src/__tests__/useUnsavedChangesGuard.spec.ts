import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, h, ref } from 'vue'
import { createMemoryHistory, createRouter, RouterView } from 'vue-router'
import { describe, expect, it, vi } from 'vitest'
import { useUnsavedChangesGuard } from '@/composables/useUnsavedChangesGuard'

const { confirm } = vi.hoisted(() => ({ confirm: vi.fn<() => Promise<void>>() }))
vi.mock('element-plus', () => ({ ElMessageBox: { confirm } }))

describe('unsaved changes navigation', () => {
  it('blocks navigation and unloading until changes are discarded', async () => {
    const dirty = ref(true)
    const page = defineComponent({
      setup() {
        useUnsavedChangesGuard(dirty)
        return () => h('div', 'Editor')
      },
    })
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', component: page },
        { path: '/other', component: { render: () => h('div', 'Other') } },
      ],
    })
    await router.push('/')
    const wrapper = mount(RouterView, { global: { plugins: [router] } })
    await flushPromises()
    const unload = new Event('beforeunload', { cancelable: true })
    window.dispatchEvent(unload)
    expect(unload.defaultPrevented).toBe(true)
    confirm.mockRejectedValueOnce('cancel')
    await router.push('/other')
    expect(router.currentRoute.value.path).toBe('/')
    confirm.mockResolvedValueOnce(undefined)
    await router.push('/other')
    expect(router.currentRoute.value.path).toBe('/other')
    wrapper.unmount()
    const afterUnmount = new Event('beforeunload', { cancelable: true })
    window.dispatchEvent(afterUnmount)
    expect(afterUnmount.defaultPrevented).toBe(false)
  })
})
