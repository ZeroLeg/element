---
name: schema-forms
description: Extender o trasladar los formularios Vue de este proyecto basados en detail.json y lista.json, incluyendo dependencias de combos y adaptadores HTTP.
---

Leer src/composables/form/README.md y los tipos antes de modificar las reglas.

- Mantener useFormBase independiente de los esquemas de detalle y lista. Los adaptadores extraen campos e hidratan valores; el transporte se inyecta con FormOptions.transport.
- Los ejemplos reales son src/detail.json y src/lista.json. El segundo no se llama list.json.
- parent envia data.parent con el valor actual del padre. combowaitparent y waitparent bloquean la peticion mientras no tenga valor; 0 y false son valores validos.
- action.sourcedest lee source del modelo y lo envia como data[destination]. Cambiar source limpia el combo dependiente y sus descendientes. action.sourcedestsetter tiene otra funcion: copiar propiedades de la opcion seleccionada al modelo.
- Preservar valores al hidratar filas. No mutar los esquemas ni aceptar respuestas antiguas tras invalidar una peticion.
- Al extender estas reglas, verificar payloads, cascadas y concurrencia con transporte falso. Ejecutar npm run type-check y npx vitest run src/composables/form/useFormBase.spec.ts.
- Los controles especializados se integran mediante el slot field de FormComponent. No sustituir relaciones o geometria por editores de texto sin definir su contrato.
- validation.rules admite regex con pattern, flags, severity, message y trigger. useFormValidation evalua las reglas; FormComponent presenta warnings amarillos fuera del error de el-form-item. Los warnings no bloquean submit; los errores si. Probar tambien src/composables/form/useFormValidation.spec.ts y src/components/FormComponent.spec.ts.
