# Monitor de rendimiento para Vue

Este prototipo observa señales en ejecución durante el desarrollo. No analiza el código estáticamente ni predice todos los problemas. Abre la consola del navegador y visita `/list-performance`; carga suficientes filas para producir trabajo apreciable. Los mensajes `[Performance]` aparecen si se superan los umbrales, no necesariamente en todas las cargas.

- **Componente Vue**: mide fases instrumentadas por Vue (por ejemplo, render, patch o mount). Una medida puede incluir trabajo de descendientes; no demuestra que el componente nombrado sea el origen. Las fases pueden solaparse, así que no deben sumarse.
- **Tarea larga**: indica que el hilo principal estuvo ocupado al menos 50 ms. No identifica por sí sola al componente responsable. Esta API no está disponible en todos los navegadores.

Los avisos son pistas para investigar con la pestaña Performance de DevTools, no diagnósticos ni pruebas de rendimiento en producción. La instrumentación y la consola añaden coste. Repite la medición con una build de producción, datos y dispositivos representativos, y compara trazas antes y después. Los umbrales no son límites universales.

## Uso en otro proyecto Vue 3

Copia `src/plugins/performanceMonitor.ts` y registra el plugin solo en desarrollo, antes de montar la aplicación. En Vite:

```ts
import { createPerformanceMonitor } from './plugins/performanceMonitor'

if (import.meta.env.DEV) {
  app.use(
    createPerformanceMonitor({
      componentThresholdMs: 30,
      longTaskThresholdMs: 50,
      cooldownMs: 5000,
    }),
  )
}
```

Ajusta los valores tras observar tu aplicación. Las tareas largas que emite el navegador empiezan en 50 ms: un umbral menor no detecta tareas más cortas. El plugin activa `app.config.performance` para observar las medidas que Vue emite en desarrollo. Depende de los nombres de esas medidas, que pueden cambiar entre versiones de Vue; verifica su funcionamiento al actualizar. Al desmontar la aplicación desconecta sus observadores. Con otro bundler utiliza su equivalente a la condición de desarrollo.

Si el navegador no admite la API de tareas largas, el monitor utiliza un temporizador como alternativa aproximada. Un retraso de al menos 100 ms puede indicar bloqueo, pero también puede deberse a la planificación o limitación de temporizadores del navegador. No mide la duración exacta de una tarea ni identifica su origen y puede pasar bloqueos por alto. Se ignoran las comprobaciones con la pestaña oculta y se limpia al desmontar la aplicación.

## Chrome y Firefox

El monitor detecta capacidades, no el nombre del navegador. Cuando `longtask` está disponible usa esa señal nativa; cuando no, recurre al temporizador aproximado. Las mediciones Vue se activan por separado si se admite observar entradas `measure`. El temporizador se reinicia al cambiar la visibilidad para reducir avisos engañosos al volver a la pestaña. La compatibilidad efectiva depende de la versión y configuración del navegador; revisa la consola y contrasta los resultados con sus herramientas de rendimiento.
