# Gestión de registros

Aplicación Vue 3 con TypeScript, Pinia, Vue Router y Element Plus. Permite consultar registros, editar un detalle o varias filas, cancelar borradores y eliminar registros previa confirmación.

Los selects de región y oficina dependen del país. Los errores de validación bloquean el guardado; las advertencias de formato del nombre son orientativas. El resumen de incidencias permite enfocar el campo afectado. Los errores de carga de opciones ofrecen reintento y la navegación avisa si hay cambios pendientes.

## Desarrollo

Requiere Node.js `^22.18.0 || >=24.12.0` y pnpm.

```sh
pnpm install
pnpm dev
```

## Comprobaciones

```sh
pnpm test:unit --run
pnpm build
pnpm exec eslint .
pnpm exec oxlint .
```

`pnpm lint` aplica correcciones automáticamente. `pnpm format` formatea `src`.

## Organización

- `domain/record.ts`: entidad y creación de registros vacíos, sin dependencias visuales.
- `forms/types.ts`: contratos de campos y opciones reutilizables.
- `forms/recordForm.ts`: configuración visual y reglas de Element Plus para registros.
- `data/recordOptions.ts`: proveedor de opciones, reemplazable por un servicio remoto.
- `stores/records.ts`: estado compartido; copia las actualizaciones y rechaza IDs inexistentes.
- `composables/useRecordForm.ts`: borrador, modo de edición y guardado de una instantánea.
- `composables/useDependentSelects.ts`: invalidación de peticiones, limpieza de dependencias y errores de carga.
- `composables/useRecordTableEditing.ts`: ciclo de edición y guardado de varias filas.
- `composables/useFormFeedback.ts`: errores y advertencias por campo o fila.
- `composables/useUnsavedChangesGuard.ts`: protección de navegación y cierre con borradores pendientes.
- `components/`: presentación y adaptación de controles de Element Plus.
- `views/`: composición de pantallas, navegación y mensajes al usuario.

## Alcance actual

Los datos son de demostración y viven en memoria: recargar la página restaura los registros iniciales. No hay backend ni persistencia local. La pestaña Edificios está reservada y todavía no tiene funcionalidad. Los registros actuales tienen campos planos de texto; el controlador de borradores usa copias superficiales y comparación JSON, por lo que necesita adaptarse antes de admitir objetos anidados o valores no serializables.
