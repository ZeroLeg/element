<template>
  <el-container>
    <AppHeader :mode="mode" @change-mode="mode = $event" />
    <el-container>
      <el-aside width="300px">
        <el-menu class="channel-list" unique-opened>
          <el-sub-menu v-for="group in groups" :key="group" :index="group">
            <template #title>
              {{ group }}
            </template>
            <el-menu-item
              v-for="channel in groupedChannels[group]"
              :key="channel.name + channel.url"
              @click="selectChannel(channel)"
            >
              <img v-if="channel.logo" :src="channel.logo" alt="logo" class="channel-logo" />
              <span class="channel-title">{{ channel.name }}</span>
            </el-menu-item>
          </el-sub-menu>
        </el-menu>
      </el-aside>
      <el-main class="main">
        <div class="form-container">
          <template v-if="mode === 'm3u'">
            <el-input
              v-model="m3uUrl"
              placeholder="Pega la URL de tu archivo M3U"
              class="url-input"
              clearable
            />
            <el-button @click="loadFromUrl" type="primary" size="small" style="margin-top: 8px">
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
            <el-button @click="loadFromXtream" type="primary" size="small" style="margin-top: 8px">
              Cargar Xtream
            </el-button>
          </template>
        </div>
        <div v-if="selectedChannel">
          <h2>{{ selectedChannel.name }}</h2>
          <div class="video-format">Formato detectado: {{ getFormat(selectedChannel.url) }}</div>
          <template v-if="isSupportedFormat(selectedChannel.url)">
            <div class="video-container">
              <video ref="videoRef" controls autoplay width="100%" @error="onVideoError"></video>
            </div>
            <div v-if="videoError" class="video-error">
              No se pudo cargar el canal. El servidor no responde o el formato no es compatible.
            </div>
          </template>
          <template v-else>
            <div class="video-error">
              Este canal no es compatible en el navegador (solo .m3u8 o .mp4).
            </div>
          </template>
        </div>
        <div v-else>
          <p>Selecciona un canal para reproducir</p>
        </div>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, watch, nextTick, computed, onMounted, onBeforeUnmount } from 'vue'
import Hls from 'hls.js'
import AppHeader from './components/AppHeader.vue'

const channels = ref([])
const selectedChannel = ref(null)
const m3uUrl = ref('')
const videoRef = ref(null)
const videoError = ref(false)
const mode = ref('m3u')
const xtreamHost = ref('')
const xtreamUser = ref('')
const xtreamPass = ref('')
let hlsInstance = null

function parseM3U(content) {
  const lines = content.split('\n')
  const result = []
  let name = ''
  let logo = ''
  let group = ''
  for (const line of lines) {
    if (line.startsWith('#EXTINF')) {
      // Extraer atributos
      const nameMatch = line.match(/,(.*)$/)
      name = nameMatch ? nameMatch[1].trim() : ''
      const logoMatch = line.match(/tvg-logo="([^"]*)"/)
      logo = logoMatch ? logoMatch[1] : ''
      const groupMatch = line.match(/group-title="([^"]*)"/)
      group = groupMatch ? groupMatch[1] : 'Sin grupo'
    } else if (line && !line.startsWith('#')) {
      result.push({ name, url: line.trim(), logo, group })
      name = ''
      logo = ''
      group = ''
    }
  }
  return result
}

async function loadFromUrl() {
  if (!m3uUrl.value) return
  try {
    const res = await fetch(m3uUrl.value)

    const text = await res.text()
    channels.value = parseM3U(text)
  } catch (e) {
    channels.value = []
    selectedChannel.value = null
    alert('No se pudo cargar el archivo M3U')
  }
}

async function loadFromXtream() {
  if (!xtreamHost.value || !xtreamUser.value || !xtreamPass.value) {
    alert('Completa todos los campos de Xtream')
    return
  }
  // Construye la URL Xtream para obtener el archivo M3U
  const url = `${xtreamHost.value}/get.php?username=${encodeURIComponent(xtreamUser.value)}&password=${encodeURIComponent(xtreamPass.value)}&type=m3u_plus&output=m3u8`
  m3uUrl.value = url
  await loadFromUrl()
}

function selectChannel(channel) {
  selectedChannel.value = channel
}

const groups = computed(() => {
  const set = new Set()
  channels.value.forEach((c) => set.add(c.group || 'Sin grupo'))
  return Array.from(set)
})

const groupedChannels = computed(() => {
  const map = {}
  channels.value.forEach((c) => {
    const group = c.group || 'Sin grupo'
    if (!map[group]) map[group] = []
    map[group].push(c)
  })
  return map
})

function onVideoError() {
  videoError.value = true
}

function isSupportedFormat(url) {
  return url.endsWith('.m3u8') || url.endsWith('.mp4')
}

function getFormat(url) {
  // Busca parámetro output en la URL
  const outputMatch = url.match(/output=([a-zA-Z0-9]+)/)
  if (outputMatch) return outputMatch[1]
  // Busca extensión de archivo
  const extMatch = url.match(/\.(\w+)(\?|$)/)
  if (extMatch) return extMatch[1]
  return 'desconocido'
}

watch(selectedChannel, async (channel) => {
  await nextTick()
  videoError.value = false
  if (!channel || !videoRef.value) return
  if (!isSupportedFormat(channel.url)) return

  // Limpia instancia anterior de hls.js
  if (hlsInstance) {
    hlsInstance.destroy()
    hlsInstance = null
  }

  const url = channel.url

  if (url.endsWith('.m3u8')) {
    // Verifica si el navegador soporta HLS nativamente
    const canPlayNative = videoRef.value.canPlayType('application/vnd.apple.mpegurl') !== ''
    if (canPlayNative) {
      videoRef.value.src = url
    } else if (Hls.isSupported()) {
      hlsInstance = new Hls()
      hlsInstance.loadSource(url)
      hlsInstance.attachMedia(videoRef.value)
    } else {
      videoError.value = true
    }
  } else {
    videoRef.value.src = url
  }
})

onMounted(() => {
  // Nada especial aquí
})

onBeforeUnmount(() => {
  if (hlsInstance) {
    hlsInstance.destroy()
    hlsInstance = null
  }
})
</script>

<style scoped>
.header {
  background: #f5f7fa;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #ebeef5;
}
.main {
  height: 100vh;
  padding-top: 24px;
}
.form-container {
  margin-bottom: 24px;
  max-width: 400px;
}
.channel-list {
  margin-top: 20px;
}
.upload-demo {
  margin-bottom: 20px;
}
.url-input {
  margin-bottom: 10px;
}
.channel-logo {
  width: 32px;
  height: 32px;
  object-fit: contain;
  margin-right: 8px;
  vertical-align: middle;
}
.channel-title {
  vertical-align: middle;
}
.video-error {
  color: #f56c6c;
  margin-top: 12px;
  font-weight: bold;
}
.video-format {
  margin-bottom: 8px;
  color: #909399;
  font-size: 13px;
}
.video-container {
  width: 100%;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.video-container video {
  width: 100%;
  height: 100%;
  min-height: 300px;
  background: #000;
}
</style>
