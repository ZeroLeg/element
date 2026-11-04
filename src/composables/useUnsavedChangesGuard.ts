import { onBeforeUnmount, onMounted, toValue, type MaybeRefOrGetter } from 'vue'
import { onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router'
import { ElMessageBox } from 'element-plus'

export function useUnsavedChangesGuard(isDirty: MaybeRefOrGetter<boolean>) {
  async function confirmNavigation() {
    if (!toValue(isDirty)) return true
    try {
      await ElMessageBox.confirm(
        'Tienes cambios sin guardar. ¿Quieres descartarlos y salir?',
        'Cambios sin guardar',
        {
          type: 'warning',
          confirmButtonText: 'Descartar y salir',
          cancelButtonText: 'Seguir editando',
        },
      )
      return true
    } catch {
      return false
    }
  }

  function beforeUnload(event: BeforeUnloadEvent) {
    if (!toValue(isDirty)) return
    event.preventDefault()
    event.returnValue = ''
  }

  onBeforeRouteLeave(confirmNavigation)
  onBeforeRouteUpdate(confirmNavigation)
  onMounted(() => window.addEventListener('beforeunload', beforeUnload))
  onBeforeUnmount(() => window.removeEventListener('beforeunload', beforeUnload))
}
