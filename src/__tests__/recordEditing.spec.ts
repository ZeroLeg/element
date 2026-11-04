import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import { createMemoryHistory, createRouter, RouterView } from 'vue-router'
import { describe, expect, it } from 'vitest'
import ListView from '@/views/ListView.vue'
import DetailView from '@/views/DetailView.vue'
import { useRecordsStore } from '@/stores/records'

async function mountPage(path: string) {
  const pinia = createPinia()
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'record-list', component: ListView },
      { path: '/records/:id', name: 'record-detail', component: DetailView, props: true },
    ],
  })
  await router.push(path)
  const wrapper = mount(RouterView, { global: { plugins: [pinia, router, ElementPlus] } })
  await flushPromises()
  return { wrapper, store: useRecordsStore(pinia) }
}

describe('record editing screens', () => {
  it('saves a table draft through the real form validation', async () => {
    const { wrapper, store } = await mountPage('/')
    await wrapper
      .findAll('button')
      .find((button) => button.text() === 'Editar')!
      .trigger('click')
    await flushPromises()
    await wrapper.find('input[placeholder="Nombre completo"]').setValue('Ana García')
    expect(store.records[0]?.name).toBe('Laura García')
    await wrapper
      .findAll('button')
      .find((button) => button.text() === 'Guardar cambios')!
      .trigger('click')
    await flushPromises()
    expect(store.records[0]?.name).toBe('Ana García')
    expect(wrapper.find('input[placeholder="Nombre completo"]').exists()).toBe(false)
    wrapper.unmount()
  })

  it('rejects whitespace in detail and restores the saved value on cancel', async () => {
    const { wrapper, store } = await mountPage('/records/REC-1001')
    await wrapper
      .findAll('button')
      .find((button) => button.text() === 'Editar')!
      .trigger('click')
    await flushPromises()
    await wrapper.find('input[placeholder="Nombre completo"]').setValue('   ')
    await wrapper
      .findAll('button')
      .find((button) => button.text() === 'Guardar cambios')!
      .trigger('click')
    await flushPromises()
    expect(store.records[0]?.name).toBe('Laura García')
    expect(wrapper.find('input[placeholder="Nombre completo"]').exists()).toBe(true)
    expect(wrapper.find('.feedback-summary').text()).toContain('El nombre es obligatorio')
    await wrapper
      .findAll('button')
      .find((button) => button.text() === 'Cancelar')!
      .trigger('click')
    await flushPromises()
    expect(wrapper.find('.feedback-summary').exists()).toBe(false)
    expect(wrapper.text()).toContain('Laura García')
    wrapper.unmount()
  })
})
