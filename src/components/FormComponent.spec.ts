import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ElementPlus from 'element-plus'
import FormComponent from './FormComponent.vue'
import { useFormBase } from '@/composables/form/useFormBase'
import type { FormController } from '@/composables/form/useFormBase'
describe('warnings del formulario', () => {
  it('renderiza el aviso amarillo debajo del input y permite submit', async () => {
    let controller: FormController
    const host = mount(
      {
        components: { FormComponent },
        setup() {
          controller = useFormBase([
            {
              id: 'name',
              type: 'STRING',
              value: 'ana',
              validation: {
                rules: [
                  {
                    type: 'regex',
                    pattern: '^A',
                    severity: 'warning',
                    message: 'Debe empezar por A',
                    trigger: 'blur',
                  },
                ],
              },
            },
          ])
          return { controller }
        },
        template: '<FormComponent :controller="controller" />',
      },
      { global: { plugins: [ElementPlus] } },
    )
    const form = host.findComponent(FormComponent)
    expect(form.find('.field-warning').exists()).toBe(false)
    await form.find('input').trigger('focusout')
    expect(form.find('.field-warning').text()).toBe('Debe empezar por A')
    expect(form.find('.field-warning').classes()).toContain('el-text--warning')
    expect(form.find('.el-form-item__error').exists()).toBe(false)
    await form.find('form').trigger('submit')
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(form.emitted('submit')?.[0]).toEqual([{ name: 'ana' }])
    await form.find('input').setValue('Ana')
    expect(form.find('.field-warning').exists()).toBe(false)
    host.unmount()
  })
})
