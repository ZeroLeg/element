# Guía práctica de rendimiento en Vue

Guía para equipos · Vue 3 y aplicaciones con tablas · Noviembre 2026

## 1. Medir antes de cambiar

El tiempo de una petición no representa el tiempo total hasta que una pantalla resulta utilizable. Distingue descarga, lectura y transformación de datos, ejecución de JavaScript, actualización de Vue, cálculo de estilos y layout, y pintado. Registra una línea base con número de filas y columnas, tamaño de respuesta, navegador, dispositivo y condiciones de red y CPU. Compara la misma interacción antes y después, preferiblemente con una build de producción y datos representativos. Usa varios intentos y conserva las trazas.

Herramientas para investigar:

- **Network**: mide la duración y el tamaño de la respuesta.
- **Performance**: graba el clic y busca tareas largas en Main; revisa el flame chart y los tiempos de scripting, rendering y painting.
- **Vue DevTools**: investiga los componentes y sus actualizaciones.
- **Métricas reales**: usa INP para interacciones y, cuando sea relevante, LCP para la carga inicial.

Una tarea larga ocupa el hilo principal durante más de 50 ms; es una pista, pero no identifica por sí sola la causa.

## 2. Tablas y listas grandes

Una tabla de 2.000 filas por 10 columnas puede generar muchas más de 20.000 piezas de DOM, según el componente. Antes de optimizar, considera qué datos necesita ver el usuario. La paginación, filtros y ordenación en servidor reducen red, memoria y DOM, pero deben respetar la navegación y orden global. La paginación en cliente reduce DOM, no la descarga inicial.

La virtualización mantiene en el DOM las filas visibles y unas próximas; requiere una zona con scroll y tratar correctamente alturas, foco, selección y accesibilidad. No reduce por sí sola el tamaño de la respuesta. Evalúa las opciones disponibles para tu tabla y comprueba su compatibilidad, mantenimiento y funcionalidades antes de adoptarlas.

Añadir filas por lotes permite ceder el hilo entre actualizaciones y mostrar resultados progresivamente. No es virtualización: al final siguen todas en el DOM, y repetidas actualizaciones y copias pueden aumentar el tiempo total. Cinco filas no es un valor universal; mide lotes mayores, el tiempo de cada actualización y el tiempo total. Si el coste crece con el DOM acumulado, considera paginación o virtualización. Limita celdas complejas, componentes y cálculos repetidos por fila solo donde el perfil indique un coste relevante; conserva claves estables basadas en IDs.

## 3. Loading y sincronización

Define qué significa terminar: respuesta recibida, primera información utilizable o procesamiento completo. Para coordinar la interfaz:

- Muestra el loading antes del trabajo pesado y gestiona los estados de error y vacío.
- Libera el estado en `finally`, también cuando falle la petición.
- Evita que una respuesta antigua sobrescriba otra nueva mediante cancelación o un identificador de petición.
- Cancela tareas progresivas al desmontar el componente.

El indicador no puede animarse si una tarea bloquea el hilo principal: hay que reducir o dividir el trabajo.

nextTick() espera a que Vue aplique las actualizaciones pendientes del DOM. Es útil antes de leer o medir elementos actualizados. No espera a imágenes, peticiones, hijos asíncronos ni garantiza que el navegador haya pintado. Dos callbacks requestAnimationFrame sucesivos pueden dar una oportunidad de pintado, pero no son una confirmación universal de que todo haya terminado; en pestañas ocultas pueden retrasarse. Para hijos asíncronos usa una señal explícita de preparación. Evita retrasos arbitrarios como mecanismo de sincronización.

Ejemplo orientativo: activar loading; solicitar datos; asignarlos; await nextTick(); si necesitas dar una oportunidad de pintado, esperar dos requestAnimationFrame; desactivar en finally. Esto mejora la coordinación visual, no elimina tareas largas ni garantiza la finalización de procesos asíncronos posteriores. Si necesitas mostrar resultados progresivos, decide si el loading se retira tras el primer lote y comunica que siguen llegando filas.

## 4. Componentes y reactividad

Usa importaciones dinámicas de rutas para retrasar código de pantallas no visitadas. defineAsyncComponent sirve para componentes pesados o condicionales, como un editor o un diálogo que puede no abrirse. Mide la mejora y contempla estados de carga y error: dividir demasiado puede generar más solicitudes y retrasar la primera apertura. No vuelve asíncrono el renderizado de una tabla ya montada. En Vue Router se recomienda importar las rutas de forma dinámica directamente.

Evita cálculos caros en plantillas ejecutados por celda: precalcula o usa computed cuando corresponda. Mantén props estables y evita watchers profundos sobre estructuras grandes si no son necesarios. Usa shallowRef para grandes estructuras tratadas como inmutables solo si compensa: sustituye el array u objeto raíz para notificar cambios; una mutación interna no dispara por sí sola la actualización. No uses esa estrategia sin adaptar filas editables. Mantén componentes cohesionados; crear miles de instancias innecesarias puede tener coste, pero no elimines abstracciones útiles sin medir.

## 5. Arquitectura y pruebas

Separa obtención de datos, reglas de dominio y estado de presentación siguiendo las convenciones del proyecto. Un composable puede coordinar estado o procesamiento reutilizable; no necesita conocer detalles HTTP si recibe datos. Aplica responsabilidad única e inversión de dependencias cuando aporten claridad y pruebas útiles, sin crear capas vacías. Documenta contratos, límites de datos, cancelación y cuándo termina el loading.

Prueba estados de carga, éxito, error y vacío; respuestas fuera de orden; cambios de filtro; desmontaje durante carga; cancelación de lotes; tamaño inválido y preservación de orden y selección cuando aplique. Usa pruebas unitarias para lógica aislada y pruebas de integración para comportamiento visible. Complementa con perfiles manuales o automatizados sobre datos representativos; un test funcional o un temporizador aislado no demuestran buen rendimiento.

## 6. Plan de revisión para una pantalla lenta

1. Reproducir el problema y acordar qué interacción debe mejorar.
2. Medir red, DOM y trazas de Main con datos y dispositivo representativos.
3. Identificar si domina la respuesta, la transformación, las actualizaciones o el layout/pintado.
4. Reducir datos o DOM; dividir tareas largas si corresponde; revisar contenido de celdas solo con evidencia.
5. Verificar estados, errores, cancelación, accesibilidad y funcionalidad.
6. Comparar trazas y experiencia antes/después y registrar compromisos y limitaciones.

## Fuentes oficiales

- Vue: https://vuejs.org/guide/best-practices/performance.html
- Vue, componentes asíncronos: https://vuejs.org/guide/components/async.html
- Vue, nextTick: https://vuejs.org/api/general.html#nexttick
- Vue Router, carga de rutas: https://router.vuejs.org/guide/advanced/lazy-loading.html
- Chrome DevTools Performance: https://developer.chrome.com/docs/devtools/performance
- Web Vitals: https://web.dev/articles/vitals
