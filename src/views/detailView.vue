<script setup lang="ts">
import { ref } from 'vue'
import schema from '@/detail.json'
import FormComponent from '@/components/FormComponent.vue'
import { useFormDetail } from '@/composables/form/detail/useFormDetail'
const controller = useFormDetail(schema)
const payload = ref<Record<string, unknown>>()
</script>
<template>
  <h1>Formulario de detalle</h1>
  <FormComponent :controller="controller" @submit="(data) => (payload = data)" />
  <pre v-if="payload">{{ payload }}</pre>
</template>
