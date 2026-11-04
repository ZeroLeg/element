import { mount } from '@vue/test-utils'
import ElementPlus from 'element-plus'
import { describe, expect, it } from 'vitest'
import RecordFieldControl from '@/components/RecordFieldControl.vue'
import { recordFields } from '@/forms/recordForm'

const nameField = recordFields.find((field) => field.key === 'name')!

describe('RecordFieldControl', () => {
  it('shows a non-blocking warning only when a non-empty value fails its pattern', async () => {
    const wrapper = mount(RecordFieldControl, {
      props: {
        field: nameField,
        value: '',
        options: [],
        loading: false,
      },
      global: { plugins: [ElementPlus] },
    })

    expect(wrapper.find('[role="status"]').exists()).toBe(false)

    await wrapper.setProps({ value: 'Laura García' })
    expect(wrapper.find('[role="status"]').exists()).toBe(false)

    await wrapper.setProps({ value: 'Laura123' })
    expect(wrapper.find('[role="status"]').text()).toBe(
      'Usa solo letras, espacios, apóstrofos o guiones.',
    )
    expect(wrapper.find('.field-warning').exists()).toBe(true)
  })
})
