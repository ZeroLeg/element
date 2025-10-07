<template>
  <div>
    <template v-if="mode === 'm3u'">
      <el-input
        v-model="m3uUrl"
        placeholder="Pega la URL de tu archivo M3U"
        class="url-input"
        clearable
      />
      <el-button
        @click="$emit('load-from-url')"
        type="primary"
        size="small"
        style="margin-top: 8px"
      >
        Cargar canales
      </el-button>
    </template>
    <template v-else>
      <el-input
        v-model="xtreamHost"
        placeholder="Host (ej: http://example.com:port)"
        class="url-input"
      />
      <el-input v-model="xtreamUser" placeholder="Usuario" class="url-input" />
      <el-input v-model="xtreamPass" placeholder="Contraseña" class="url-input" />
      <el-button
        @click="$emit('load-from-xtream')"
        type="primary"
        size="small"
        style="margin-top: 8px"
      >
        Cargar Xtream
      </el-button>
    </template>
  </div>
</template>

<script setup>
const props = defineProps({
  mode: String,
  m3uUrl: String,
  xtreamHost: String,
  xtreamUser: String,
  xtreamPass: String,
})
const emit = defineEmits([
  'update:m3uUrl',
  'update:xtreamHost',
  'update:xtreamUser',
  'update:xtreamPass',
  'load-from-url',
  'load-from-xtream',
])

// v-model bindings
const m3uUrl = defineModel('m3uUrl')
const xtreamHost = defineModel('xtreamHost')
const xtreamUser = defineModel('xtreamUser')
const xtreamPass = defineModel('xtreamPass')
</script>

<style scoped>
.url-input {
  margin-bottom: 10px;
}
</style>
