<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElButton, ElDialog, ElForm, ElFormItem, ElInput, type FormInstance } from 'element-plus'
import type { TransactionConfig, TransactionResult } from './useTransaction'

const props = defineProps<{ config: TransactionConfig | null }>()
const emit = defineEmits<{ finish: [result: TransactionResult] }>()
const form = ref<FormInstance>()
const values = ref<Record<string, string>>({})
const validating = ref(false)

watch(
  () => props.config,
  (config) => {
    values.value = Object.fromEntries(
      config?.fields.map((field) => [field.name, config.initialValues?.[field.name] ?? '']) ?? [],
    )
    form.value?.clearValidate()
  },
)

async function confirm() {
  if (validating.value || !form.value) return
  const config = props.config
  validating.value = true
  try {
    const valid = await form.value.validate().catch(() => false)
    if (valid && props.config === config) {
      emit('finish', { confirmed: true, data: { ...values.value } })
    }
  } finally {
    validating.value = false
  }
}
</script>

<template>
  <ElDialog
    :model-value="config !== null"
    :title="config?.title"
    width="min(480px, 90vw)"
    destroy-on-close
    @update:model-value="
      (visible) => {
        if (!visible) emit('finish', { confirmed: false })
      }
    "
  >
    <ElForm ref="form" :model="values" label-position="top" @submit.prevent="confirm">
      <ElFormItem
        v-for="field in config?.fields"
        :key="field.name"
        :label="field.label"
        :prop="field.name"
        :rules="[
          {
            required: field.required,
            message: `${field.label} es obligatorio`,
            whitespace: true,
            trigger: 'blur',
          },
          ...(field.type === 'email'
            ? [{ type: 'email' as const, message: 'Introduce un email válido', trigger: 'blur' }]
            : []),
        ]"
      >
        <ElInput v-model="values[field.name]" :type="field.type ?? 'text'" />
      </ElFormItem>
      <ElButton @click="emit('finish', { confirmed: false })">Cancelar</ElButton>
      <ElButton type="primary" native-type="submit" :loading="validating">
        {{ config?.confirmText ?? 'Confirmar' }}
      </ElButton>
    </ElForm>
  </ElDialog>
</template>
