<script setup lang="ts">
import { ref } from 'vue'
import { useTransaction } from '../modules/transactions/useTransaction'

const { open } = useTransaction()
const user = ref<Record<string, string> | null>(null)

async function createUser() {
  const result = await open({
    title: 'Crear usuario',
    confirmText: 'Guardar',
    fields: [
      { name: 'name', label: 'Nombre', required: true },
      { name: 'email', label: 'Email', type: 'email', required: true },
    ],
  })
  if (result.confirmed) user.value = result.data
}
</script>

<template>
  <div>
    <p>Campo ejemplo</p>
    <el-button type="primary" @click="createUser">Crear usuario</el-button>
    <p v-if="user">Usuario confirmado: {{ user.name }} — {{ user.email }}</p>
  </div>
</template>
