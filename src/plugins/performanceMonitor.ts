import type { App, Plugin } from 'vue'

export interface PerformanceMonitorOptions {
  /** Minimum duration of a Vue measurement to report, in milliseconds. */
  componentThresholdMs?: number
  /** Minimum duration of a browser long task to report, in milliseconds. */
  longTaskThresholdMs?: number
  /** Suppress repeated warnings for the same component/phase within this interval. */
  cooldownMs?: number
}

export function createPerformanceMonitor(options: PerformanceMonitorOptions = {}): Plugin {
  const { componentThresholdMs = 30, longTaskThresholdMs = 50, cooldownMs = 5000 } = options

  return {
    install(app: App) {
      if (typeof window === 'undefined') return

      const supported =
        typeof PerformanceObserver === 'undefined'
          ? []
          : (PerformanceObserver.supportedEntryTypes ?? [])
      const observers: PerformanceObserver[] = []
      const lastWarning = new Map<string, number>()
      const previousPerformance = app.config.performance

      if (supported.includes('measure')) {
        app.config.performance = true
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            // Vue's development measurements are named "<Component> phase".
            if (!/^<.+> (mount|patch|render|init|compile)$/.test(entry.name)) continue
            if (entry.duration < componentThresholdMs) continue
            const last = lastWarning.get(entry.name)
            if (last !== undefined && entry.startTime - last < cooldownMs) continue
            lastWarning.set(entry.name, entry.startTime)
            console.warn(
              `[Performance] ${entry.name}: ${entry.duration.toFixed(1)} ms. Revisa la traza en DevTools; puede incluir trabajo de descendientes.`,
            )
          }
        })
        observer.observe({ entryTypes: ['measure'] })
        observers.push(observer)
      }

      if (supported.includes('longtask')) {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration < longTaskThresholdMs) continue
            console.warn(
              `[Performance] Tarea larga del hilo principal: ${entry.duration.toFixed(1)} ms. Abre Performance en DevTools para localizar su origen.`,
            )
          }
        })
        observer.observe({ entryTypes: ['longtask'] })
        observers.push(observer)
      } else {
        // A delayed timer is only a heuristic: scheduling and throttling also affect it.
        const interval = 250
        const threshold = Math.max(longTaskThresholdMs, 100)
        let expected = performance.now() + interval
        let lastDelayWarning = -Infinity
        let timer = 0
        const checkDelay = () => {
          const now = performance.now()
          const delay = now - expected
          if (
            document.visibilityState === 'visible' &&
            delay >= threshold &&
            now - lastDelayWarning >= cooldownMs
          ) {
            lastDelayWarning = now
            console.warn(
              `[Performance] Retraso aproximado del temporizador: ${delay.toFixed(1)} ms. Puede indicar bloqueo, pero también deberse a planificación del navegador; comprueba DevTools.`,
            )
          }
          expected = now + interval
          timer = window.setTimeout(checkDelay, interval)
        }
        const resetTimer = () => {
          window.clearTimeout(timer)
          expected = performance.now() + interval
          timer = window.setTimeout(checkDelay, interval)
        }
        timer = window.setTimeout(checkDelay, interval)
        document.addEventListener('visibilitychange', resetTimer)
        app.onUnmount(() => {
          window.clearTimeout(timer)
          document.removeEventListener('visibilitychange', resetTimer)
        })
        console.info(
          '[Performance] La API de tareas largas no está disponible; se utilizará una estimación mediante temporizador.',
        )
      }

      app.onUnmount(() => {
        observers.forEach((observer) => observer.disconnect())
        lastWarning.clear()
        app.config.performance = previousPerformance
      })
    },
  }
}
