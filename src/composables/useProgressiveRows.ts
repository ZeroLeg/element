import { nextTick, onScopeDispose, shallowRef } from 'vue'
// nextTick: espera a que Vue procese las actualizaciones pendientes del DOM.
// onScopeDispose: ejecuta una limpieza al destruirse el ámbito del composable.
// shallowRef: crea una referencia reactiva sin hacer reactivo cada objeto interno.

/** Adds rows in batches, yielding between updates so the browser can respond. */
export function useProgressiveRows<T>() {
  // Filas que consume la tabla. T representa el tipo de cada fila.
  const rows = shallowRef<T[]>([])

  // Identificador de la operación de renderizado actual.
  let generation = 0

  function clear() {
    // Invalida cualquier renderizado progresivo que siga en marcha.
    generation++

    // Vacía la tabla.
    rows.value = []
  }

  async function renderRows(data: T[], batchSize = 5) {
    // Evita tamaños inválidos, como 0, números negativos o decimales.
    if (!Number.isInteger(batchSize) || batchSize < 1) {
      throw new RangeError('batchSize must be a positive integer')
    }

    // Identifica esta ejecución. Incrementar generation también invalida
    // cualquier ejecución anterior que todavía esté en marcha.
    const current = ++generation

    // Empieza con la tabla vacía.
    rows.value = []

    // Avanza por los datos en saltos del tamaño indicado.
    for (let index = 0; index < data.length; index += batchSize) {
      // Si se llamó a clear(), empezó otra ejecución o se desmontó el
      // componente, esta ejecución deja de añadir filas.
      if (current !== generation) return

      // Crea un array desde el inicio hasta el final del siguiente lote.
      // Por ejemplo: primero 5 filas, después 10, después 15…
      rows.value = data.slice(0, index + batchSize)

      // Espera a que Vue aplique la actualización pendiente al DOM.
      await nextTick()

      // Cede el control al navegador antes de procesar el siguiente lote.
      await new Promise<void>((resolve) => setTimeout(resolve, 0))
    }
  }

  // Al destruirse el ámbito del componente, invalida la ejecución pendiente.
  onScopeDispose(() => {
    generation++
  })

  // Expone la lista y las funciones para que las use el componente.
  return { rows, clear, renderRows }
}
