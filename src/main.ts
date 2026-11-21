import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import App from './App.vue'
import router from './router'
import { createPerformanceMonitor } from './plugins/performanceMonitor'

const app = createApp(App)

if (import.meta.env.DEV) {
  app.use(createPerformanceMonitor())
}

app.use(createPinia())
app.use(router)
app.use(ElementPlus)

app.mount('#app')
