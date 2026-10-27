<script setup lang="ts">
import { ref, watch } from 'vue'
import { useFormValidation } from '@/composables/form/useFormValidation'
import type { FormController } from '@/composables/form/useFormBase'
import type { FormInstance } from 'element-plus'
const { controller } = defineProps<{ controller: FormController }>()
const validation = useFormValidation(controller.fields, controller.model)
watch(controller.originalModel, () => validation.reset())
function errorFor(id: string) {
  return validation.issues.value[id]
    ?.filter((issue) => issue.severity === 'error')
    .map((issue) => issue.message)
    .join(' ')
}
function reset() {
  controller.reset()
  validation.reset()
}
const emit = defineEmits<{ submit: [data: Record<string, unknown>] }>()
const form = ref<FormInstance>()
function comboValue(id: string) {
  return controller.model[id] as string | number | (string | number)[]
}
async function submit() {
  if (validation.validate() && (await form.value?.validate().catch(() => false)))
    emit('submit', controller.getPayload())
}
</script>
<template>
  <el-form ref="form" :model="controller.model" label-width="auto" @submit.prevent="submit">
    <template v-for="field in controller.fields" :key="field.id">
      <el-form-item
        v-if="field.type !== 'HIDDEN' && field.visible !== false"
        :label="field.label ?? field.id"
        :prop="field.id"
        :required="field.validation?.required"
        :error="errorFor(field.id)"
      >
        <div class="field-content" @focusout="validation.markBlurred(field.id)">
          <el-select
            v-if="field.combo"
            :model-value="comboValue(field.id)"
            :multiple="field.combo.simple === false"
            :disabled="field.readonly || field.validation?.readonly || controller.isBlocked(field)"
            :loading="controller.combos[field.id]?.loading"
            clearable
            @visible-change="(visible: boolean) => visible && controller.loadOptions(field.id)"
            @update:model-value="(value: unknown) => controller.selectOption(field.id, value)"
          >
            <el-option
              v-for="option in controller.combos[field.id]?.options"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
          <el-input-number
            v-else-if="['INTEGER', 'DOUBLE'].includes(field.type)"
            v-model="controller.model[field.id] as number"
            :disabled="field.readonly || field.validation?.readonly"
            :precision="field.type === 'INTEGER' ? 0 : undefined"
          />
          <el-switch
            v-else-if="field.type === 'BOOLEAN'"
            v-model="controller.model[field.id] as boolean"
            :disabled="field.readonly || field.validation?.readonly"
          />
          <el-input
            v-else-if="['STRING', 'TEXT', 'HOUR', 'DATE', 'DATETIME'].includes(field.type)"
            v-model="controller.model[field.id] as string"
            :type="field.type === 'TEXT' ? 'textarea' : 'text'"
            :disabled="field.readonly || field.validation?.readonly"
          />
          <slot v-else name="field" :field="field" :model="controller.model"
            ><span>Control {{ field.type }} pendiente de integrar</span></slot
          >
          <el-text v-if="controller.combos[field.id]?.error" type="danger">{{
            controller.combos[field.id]?.error
          }}</el-text>
          <template v-for="(issue, index) in validation.issues.value[field.id]" :key="index">
            <el-text
              v-if="issue.severity === 'warning'"
              type="warning"
              size="small"
              role="status"
              class="field-warning"
              >{{ issue.message }}</el-text
            >
          </template>
        </div>
      </el-form-item>
    </template>
    <el-button type="primary" native-type="submit">Preparar datos</el-button>
    <el-button @click="reset">Restablecer</el-button>
  </el-form>
</template>

<style scoped>
.field-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
}
.field-warning {
  align-self: flex-start;
  color: var(--el-color-warning);
}
</style>
