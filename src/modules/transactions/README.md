# Transacciones de formulario

En el componente raíz se llama a `provideTransactions()` y se monta
`TransactionDialog` con `:config="active"` y `@finish="finish"` (ver `App.vue`).
El estado pertenece a ese proveedor, no es un singleton global.

Cualquier componente descendiente puede abrir un formulario:

```ts
const { open } = useTransaction()
const result = await open({
  title: 'Crear usuario',
  confirmText: 'Guardar',
  fields: [
    { name: 'name', label: 'Nombre', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
  ],
  initialValues: { name: '', email: '' },
})

if (result.confirmed) {
  console.log(result.data.name, result.data.email)
}
```

Confirmar valida el formulario, cierra el diálogo y resuelve la promesa con una
copia de los datos. Cancelar, pulsar Escape o cerrar con la X o el fondo devuelve
`{ confirmed: false }`. Desmontar el proveedor también cancela la operación.
Solo se permite una transacción abierta: otra llamada devuelve
`{ confirmed: false, reason: 'busy' }` sin reemplazarla. El proveedor acepta
`onBusy` para mostrar un aviso; `App.vue` utiliza `ElMessageBox.alert` y evita
acumular alertas si se intenta abrir varias veces.

El composable gestiona el ciclo de la operación; el componente adapta la interfaz
a Element Plus. El consumidor solo conoce la configuración y el resultado.
Los campos actuales son de texto y email y sus valores son cadenas. Guardar en una
API es responsabilidad del consumidor después de recibir la confirmación.
