<script setup lang="ts">
import { computed, ref } from 'vue'
import schema from '@/lista.json'
import FormComponent from '@/components/FormComponent.vue'
import { useFormList } from '@/composables/form/list/useFormList'
const controller = useFormList(schema)
const editing = ref(false)
const payload = ref<Record<string, unknown>>()
const rows = computed(() =>
  schema.data.map((row) => Object.fromEntries(row.map((f) => [f.id, f.value]))),
)
function edit(index: number) {
  controller.editRow(index)
  editing.value = true
}
function create() {
  controller.createRow()
  editing.value = true
}
</script>
<template>
  <h1>Listado</h1>
  <el-button @click="create">Nuevo</el-button>
  <el-table :data="rows" height="500">
    <el-table-column
      v-for="column in schema.config.columns.filter((c) => c.visible && c.type !== 'HIDDEN')"
      :key="column.id"
      :prop="column.id"
      :label="column.label"
      min-width="160"
    />
    <el-table-column fixed="right" label="Acciones"
      ><template #default="scope"
        ><el-button @click="edit(scope.$index)">Editar</el-button></template
      ></el-table-column
    >
  </el-table>
  <el-dialog v-model="editing" title="Formulario de fila" width="75%">
    <FormComponent :controller="controller" @submit="(data) => (payload = data)" />
    <pre v-if="payload">{{ payload }}</pre>
  </el-dialog>
</template>
