<template>
  <div>
    <template v-if="mode === 'm3u'">
      <el-input
        :model-value="m3uUrl"
        @update:model-value="$emit('update:m3uUrl', $event)"
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
        :model-value="xtreamHost"
        @update:model-value="$emit('update:xtreamHost', $event)"
        placeholder="Host (ej: http://example.com:port)"
        class="url-input"
      />
      <el-input
        :model-value="xtreamUser"
        @update:model-value="$emit('update:xtreamUser', $event)"
        placeholder="Usuario"
        class="url-input"
      />
      <el-input
        :model-value="xtreamPass"
        @update:model-value="$emit('update:xtreamPass', $event)"
        placeholder="Contraseña"
        class="url-input"
      />
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
const { mode, m3uUrl, xtreamHost, xtreamUser, xtreamPass } = defineProps({
  mode: String,
  m3uUrl: String,
  xtreamHost: String,
  xtreamUser: String,
  xtreamPass: String,
})
</script>

<style scoped>
.url-input {
  margin-bottom: 10px;
}
</style>
