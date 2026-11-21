import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import App from './App.vue'
import router from './router'
import { createPerformanceMonitor } from './plugins/performanceMonitor'

const app = createApp(App)

const appMode = (import.meta.env.VITE_APP_MODE ?? 'produccion').trim().toLowerCase()

if (appMode === 'develop') {
  app.use(createPerformanceMonitor())
}

app.use(createPinia())
app.use(router)
app.use(ElementPlus)

app.mount('#app')
