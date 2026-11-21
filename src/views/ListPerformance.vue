<script setup lang="ts">
import { nextTick, ref } from 'vue'
import { useProgressiveRows } from '@/composables/useProgressiveRows'

interface Row {
  id: number
  name: string
  email: string
  company: string
  city: string
  status: string
  amount: string
  date: string
}

const rowCount = ref(2000)
const delay = ref(200)
const { rows, clear, renderRows } = useProgressiveRows<Row>()
const loading = ref(false)
const waitForRender = ref(true)
const running = ref(false)
const progressive = ref(false)
const requestTime = ref<number | null>(null)
const renderTime = ref<number | null>(null)

const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))

async function loadRows() {
  running.value = true
  loading.value = true
  clear()
  requestTime.value = null
  renderTime.value = null
  // Give Vue a chance to show the loading state before starting the experiment.
  await nextTick()
  await nextFrame()
  await nextFrame()

  const requestStart = performance.now()
  // Simulates a fast HTTP response; data is generated locally, without network traffic.
  await new Promise((resolve) => setTimeout(resolve, delay.value))
  const data = Array.from({ length: rowCount.value }, (_, index): Row => ({
    id: index + 1,
    name: `Cliente ${index + 1}`,
    email: `cliente${index + 1}@ejemplo.com`,
    company: `Empresa ${(index % 100) + 1}`,
    city: ['Madrid', 'Barcelona', 'Valencia', 'Sevilla'][index % 4]!,
    status: index % 3 === 0 ? 'Pendiente' : 'Activo',
    amount: `${((index * 17.35) % 10000).toFixed(2)} €`,
    date: `2026-11-${String((index % 28) + 1).padStart(2, '0')}`,
  }))
  requestTime.value = performance.now() - requestStart

  if (!waitForRender.value) {
    // Paint the loading state disappearing before starting the expensive update.
    loading.value = false
    await nextTick()
    await nextFrame()
    await nextFrame()
    // Keep the empty table visible briefly so the early dismissal is observable.
    await new Promise((resolve) => setTimeout(resolve, 300))
  }
  const tableStart = performance.now()
  if (progressive.value) {
    await renderRows(data, 5)
  } else {
    rows.value = data
  }
  await nextTick()
  // Two frames allow the browser an opportunity to paint after Vue's DOM update.
  await nextFrame()
  await nextFrame()
  renderTime.value = performance.now() - tableStart
  loading.value = false
  running.value = false
}
</script>

<template>
  <main class="performance-page">
    <h1>Prueba de rendimiento de tabla</h1>
    <p>
      Simula una respuesta rápida y muestra todos los registros en una tabla de Element Plus. Prueba
      a interactuar con la página durante la carga.
    </p>

    <div class="controls">
      <label
        >Filas
        <el-input-number v-model="rowCount" :min="100" :max="10000" :step="500" :disabled="running"
      /></label>
      <label
        >Espera simulada (ms)
        <el-input-number v-model="delay" :min="0" :max="5000" :step="100" :disabled="running"
      /></label>
      <label
        >Esperar al renderizado <el-switch v-model="waitForRender" :disabled="running"
      /></label>
      <label>Filas progresivas (5) <el-switch v-model="progressive" :disabled="running" /></label>
      <el-button type="primary" :loading="loading" :disabled="running" @click="loadRows"
        >Cargar tabla</el-button
      >
    </div>

    <p class="hint">
      {{
        waitForRender
          ? 'Activado: el indicador permanece hasta después de actualizar la tabla y dar al navegador una oportunidad de pintarla.'
          : 'Desactivado: desaparece el indicador y se muestra la tabla vacía antes de insertar las filas (con 300 ms añadidos para observarlo).'
      }}
    </p>

    <p v-if="progressive" class="hint">
      Las filas se añaden en lotes de cinco. Si quieres verlas aparecer, desactiva «Esperar al
      renderizado».
    </p>

    <div class="metrics" aria-live="polite">
      <span
        >Respuesta simulada y generación:
        <strong>{{ requestTime === null ? '—' : `${requestTime.toFixed(0)} ms` }}</strong></span
      >
      <span
        >Actualización y oportunidad de pintado:
        <strong>{{ renderTime === null ? '—' : `${renderTime.toFixed(0)} ms` }}</strong></span
      >
      <span
        >Filas: <strong>{{ rows.length }}</strong></span
      >
    </div>

    <p class="hint">
      La petición está simulada en el navegador. La segunda medida incluye la actualización de Vue y
      la espera hasta dos fotogramas; no es una medición exacta del pintado. Usa la pestaña
      Performance de DevTools para analizar las tareas del hilo principal.
    </p>

    <el-table v-loading="loading" :data="rows" height="600" border stripe empty-text="Sin datos">
      <el-table-column prop="id" label="ID" width="90" />
      <el-table-column prop="name" label="Nombre" min-width="150" />
      <el-table-column prop="email" label="Correo" min-width="230" />
      <el-table-column prop="company" label="Empresa" min-width="150" />
      <el-table-column prop="city" label="Ciudad" min-width="130" />
      <el-table-column prop="status" label="Estado" min-width="120" />
      <el-table-column prop="amount" label="Importe" min-width="120" />
      <el-table-column prop="date" label="Fecha" min-width="120" />
    </el-table>
  </main>
</template>

<style scoped>
.performance-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 32px;
}
h1 {
  margin-top: 0;
}
p {
  color: #647670;
  line-height: 1.5;
}
.controls,
.metrics {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 20px;
  margin: 24px 0;
}
.controls label {
  display: flex;
  align-items: center;
  gap: 10px;
}
.metrics {
  padding: 16px;
  border: 1px solid #dce7e1;
  border-radius: 8px;
  background: white;
}
.hint {
  font-size: 13px;
}
@media (max-width: 640px) {
  .performance-page {
    padding: 20px;
  }
}
</style>
